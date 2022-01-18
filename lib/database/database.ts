import { DynamoDB } from "aws-sdk";
import { config } from "../config/config";

export const dynamoDbClient = new DynamoDB.DocumentClient({
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretAccessKey,
  },
  region: config.aws.region,
});
