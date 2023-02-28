const { App, LogLevel } = require('@slack/bolt');
const axios = require('axios');
const { redis } = require('../redis/redis');

const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackAppToken = process.env.SLACK_APP_TOKEN;
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;

// Slack app
const slackApp = new App({
  token: slackBotToken,
  appToken: slackAppToken,
  socketMode: true,
  signingSecret: slackSigningSecret,
  logLevel: LogLevel.DEBUG,
});

slackApp.event('reaction_added', async ({ event, context }) => {

  if (event.reaction !== 'star') {
    return;
  }

  const result = await slackApp.client.conversations.history({
    channel: event.item.channel,
    latest: event.item.ts,
    inclusive: true, // Limit the results to only one
    limit: 1
  });

  const message = result.messages[0];

  if (!message.text) {
    return;
  }

  const regex = /https:\/\/github.com\/(.+?)\/(.+?)(?:\s|>)/;
  const match = message.text.match(regex);
  if (!match) {
    return;
  }

  const githubOwner = match[1];
  const githubRepo = match[2];

  const state = {
    slackUserId: event.user,
    channel: event.item.channel,
  };
  const authorizationUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=read:user,public_repo&state=${encodeURIComponent(
    JSON.stringify(state)
  )}`;

  const githubId = await redis.get(`slack-id-to-github-id:${event.user}`);

  if (!githubId) {

    await slackApp.client.chat.postEphemeral({
      channel: event.item.channel,
      user: event.user,
      text: `Seems like you haven\'t authorized the app to access your GitHub account yet. To do so, click the link <${authorizationUrl}|here> and follow the instructions.`,
    });
    return;
  }

  const accessToken = await redis.get(`github-token:${githubId}`);

  if (!accessToken) {

    await slackApp.client.chat.postEphemeral({
      channel: event.item.channel,
      user: event.user,
      text: `Seems like you haven\'t authorized the app to access your GitHub account yet. To do so, click the link <${authorizationUrl}|here> and follow the instructions.`,
    });
    return;
  }

  try {
    const response = await axios.put(
      `https://api.github.com/user/starred/${githubOwner}/${githubRepo}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
     
    await slackApp.client.chat.postEphemeral({
      channel: event.item.channel,
      user: event.user,
      text: `You have successfully starred ${githubOwner}/${githubRepo}!`,
    });

    console.log(`Starred ${githubOwner}/${githubRepo} for user ${githubId}`);
  } catch (error) {
    console.error(`Error starring ${githubOwner}/${githubRepo} for user ${githubId}: ${error.message}`);
  }
});

// Start the Slack app
const StartSlackApp = () => new Promise(async (resolve, reject) => {
  slackApp.start(process.env.SLACK_PORT || 4000)
    .then((result) => {
      console.log('slackApp is running! in port 4000');
      resolve();
    })
    .catch(reject);
});

StartSlackApp();

module.exports = { slackApp };