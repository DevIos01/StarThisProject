const { Router } = require('express');
const axios = require('axios');
const { redis } = require('../redis/redis');
const { slackApp } = require('../slack/slack');

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

var authRouter = Router();

authRouter.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  console.log("code: " + code);
  console.log("state: " + state);

  res.send('GitHub authentication successful! You can now star GitHub repositories by reacting to messages with a :star: emoji.');

  try {
    const accessToken = await exchangeCodeForToken(JSON.parse(state), code);
    if (accessToken) {

      const stateObj = JSON.parse(state);
      const channelId = stateObj.channel;
      const slackUserId = stateObj.slackUserId;

      // post a message to the channel
      await slackApp.client.chat.postEphemeral({
        channel: channelId,
        user: slackUserId,
        text: 'GitHub authentication successful! You can now star GitHub repositories by reacting to messages with a :star: emoji.'
      });

    } else {

      const stateObj = JSON.parse(state);
      const channelId = stateObj.channel;
      const slackUserId = stateObj.slackUserId;

      // post a message to the channel
      await slackApp.client.chat.postEphemeral({
        channel: channelId,
        user: slackUserId,
        text: 'GitHub authentication failed. Please try again.'
      });

      res.send('GitHub authentication failed. Please try again.');
    }
  } catch (error) {

    const stateObj = JSON.parse(state);
    const channelId = stateObj.channel;
    const slackUserId = stateObj.slackUserId;

    console.log(channelId)
    console.log(slackUserId)

    // post a message to the channel
    await slackApp.client.chat.postEphemeral({
      channel: channelId,
      user: slackUserId,
      text: `Error authenticating with GitHub: ${error.message}`
    });

    res.send(`Error authenticating with GitHub: ${error.message}`);
  }
});

// exchanges a GitHub OAuth code for an access token
async function exchangeCodeForToken(state, code) {
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: githubClientId,
        client_secret: githubClientSecret,
        code,
        state,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );
    const accessToken = response.data.access_token;

    // Use the access token to fetch the user's GitHub ID
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    const githubId = userResponse.data.id;

    // Save the access token, GitHub ID, and Slack ID to Redis
    await redis.set(`github-token:${githubId}`, accessToken);
    await redis.set(`github-id-to-slack-id:${githubId}`, state.slackUserId);
    await redis.set(`slack-id-to-github-id:${state.slackUserId}`, githubId);

    return accessToken;
  } catch (error) {
    console.error(`Error exchanging code for token: ${error.message}`);
    return null;
  }
};

module.exports = { authRouter };