import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { DynamoDBAdapter } from "@next-auth/dynamodb-adapter";

import { dynamoDbClient } from "../../../lib/database/database";
import { createWorkspace } from "../../../lib/models/workspace";
import { config } from "../../../lib/config/config";

const slackScopes = [
  "app_mentions:read",
  "channels:history",
  "channels:join",
  "channels:read",
  "chat:write",
  "groups:read",
  "team:read",
  "users.profile:read",
  "users:read",
  "workflow.steps:execute",
];

export default NextAuth({
  providers: [
    Providers.Slack({
      clientId: config.slack.clientId,
      clientSecret: config.slack.clientSecret,
      scope: slackScopes.join(","),
    }),
  ],
  adapter: DynamoDBAdapter(dynamoDbClient, {
    tableName: "wordle-teams-slack-next-auth",
  }),
  callbacks: {
    signIn: async (user, account, profile) => {
      await createWorkspace({
        id: (account.team as any).id,
        name: (account.team as any).name,
        botUserId: account.bot_user_id as any,
        botToken: account.access_token,
      });

      return true;
    },
  },
});
