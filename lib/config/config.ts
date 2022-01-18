export const config = {
  slack: {
    clientId: process.env.SLACK_APP_CLIENT_ID,
    clientSecret: process.env.SLACK_APP_CLIENT_SECRET,
  },
  aws: {
    accessKey: process.env.NEXT_AUTH_AWS_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_KEY,
    region: process.env.NEXT_AUTH_AWS_REGION,
  },
  app: {
    bugReportUrl:
      "https://www.github.com/chrishutchinson/wordle-scoreboards-slack-app",
    aboutUrl: "https://wordle-scoreboards.chrishutchinson.me",
  },
  wordle: {
    baseIndex: 213,
    baseDate: new Date("2022-01-18"),
  },
};
