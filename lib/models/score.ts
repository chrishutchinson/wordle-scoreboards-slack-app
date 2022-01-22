import { dynamoDbClient } from "../database/database";

type ScoreInput = {
  userId: string;
  workspaceId: string;
  attempts: number;
  wordleId: number;
  gridLines: number[][];
  firstGuessAccuracy: number;
};

type Score = {
  id: string;
  userId: string;
  workspaceId: string;
  wordleId: number;
  attempts: number;
  gridLines: number[][];
  firstGuessAccuracy: number;
};

const isValidScore = (maybeScore: any): maybeScore is Score => {
  return (
    maybeScore.id &&
    maybeScore.attempts &&
    maybeScore.wordleId &&
    maybeScore.workspaceId &&
    maybeScore.userId
    // && maybeScore.firstGuessAccuracy
  );
};

export const createScore = (input: ScoreInput) => {
  return dynamoDbClient
    .put({
      TableName: "wordle-teams-slack-scores",
      Item: {
        id: `${input.userId}-${input.workspaceId}-${input.wordleId}`,
        userId: input.userId,
        workspaceId: input.workspaceId,
        wordleId: input.wordleId,
        attempts: input.attempts,
        gridLines: input.gridLines,
        firstGuessAccuracy: input.firstGuessAccuracy,
      },
    })
    .promise();
};

export const getScore = async (
  userId: string,
  workspaceId: string,
  wordleId: number
): Promise<Score> => {
  const { Item } = await dynamoDbClient
    .get({
      TableName: "wordle-teams-slack-scores",
      Key: {
        id: `${userId}-${workspaceId}-${wordleId}`,
        wordleId,
      },
    })
    .promise();

  if (!isValidScore(Item)) {
    throw new Error("Invalid score");
  }

  return Item;
};

export const getWorkspaceScores = async (
  workspaceId: string,
  wordleId: number
) => {
  const { Items } = await dynamoDbClient
    .query({
      TableName: "wordle-teams-slack-scores",
      IndexName: "workspaceId-wordleId-index",
      KeyConditionExpression:
        "workspaceId = :workspaceId AND wordleId = :wordleId",
      ExpressionAttributeValues: {
        ":workspaceId": workspaceId,
        ":wordleId": wordleId,
      },
    })
    .promise();

  return Items as Score[];
};
