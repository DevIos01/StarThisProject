# GitHub Star Bot
This application allows Slack users to star GitHub repositories by reacting to messages with a :star: emoji inside Slack Channel.

# Setup
To run this application, you need to have the following:

* A Slack workspace with administrative access <br />
* A Slack app configured in that workspace <br />
* A Slack bot token for the app <br />
* A Slack app token for the app <br />
* A Slack signing secret for the app <br />
* A GitHub account with administrative access <br />
* A GitHub OAuth app configured in that account <br />
* A GitHub client ID for the app <br />
* A GitHub client secret for the app <br />
* A Redis instance <br />

To set up the application, you need to take the following steps:

1. Clone this repository to your local machine.
2. Install the dependencies by running the following command in your terminal:
```bash
npm install
```
3. Edit `.env` file in the project with the following variables:
```bash
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
SLACK_BOT_TOKEN=<your-slack-bot-token>
SLACK_APP_TOKEN=<your-slack-app-token>
SLACK_SIGNING_SECRET=<your-slack-signing-secret>
```
4.Start the Redis instance by running the following command in your terminal:
```bash
docker-compose up -d
```
5.Start the application by running the following command in your terminal:
```bash
npm start
```
6.In your Slack workspace, install the app and authorize it to access your Slack account.

7.In your GitHub account, configure the OAuth app and set the authorization callback URL to http://localhost:3000/auth/callback

8.In your Slack workspace, you can now react to a github link and if its not authorized , it will send you message with link to authorize.

# Usage
To use the application, you need to take the following steps:

Post a message in a channel with a link to a GitHub repository.
React to the message with a :star: emoji.
The bot will star the repository on GitHub if you have authorized it to access your GitHub account.

# License
This project is licensed under the MIT License. See the LICENSE file for details.
