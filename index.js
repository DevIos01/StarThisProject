const express = require('express');

const { config } = require('dotenv');
config();

const { authRouter } = require('./src/api/auth');
require('./src/redis/redis');
require('./src/slack/slack');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

