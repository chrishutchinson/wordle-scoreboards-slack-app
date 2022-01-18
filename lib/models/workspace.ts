import { dynamoDbClient } from "../database/database";

type WorkspaceInput = {
  id: string;
  name: string;
  botUserId: string;
  botToken: string;
};

type Workspace = {
  id: string;
  name: string;
  botUserId: string;
  botToken: string;
};

const isValidWorkspace = (maybeWorkspace: any): maybeWorkspace is Workspace => {
  return (
    maybeWorkspace.id &&
    maybeWorkspace.name &&
    maybeWorkspace.botToken &&
    maybeWorkspace.botUserId
  );
};

export const createWorkspace = (input: WorkspaceInput) => {
  return dynamoDbClient
    .put({
      TableName: "wordle-teams-slack-workspaces",
      Item: {
        id: input.id,
        name: input.name,
        botUserId: input.botUserId,
        botToken: input.botToken,
      },
    })
    .promise();
};

export const getWorkspace = async (id: string): Promise<Workspace> => {
  const { Item } = await dynamoDbClient
    .get({
      TableName: "wordle-teams-slack-workspaces",
      Key: {
        id,
      },
    })
    .promise();

  if (!isValidWorkspace(Item)) {
    throw new Error("Invalid workspace");
  }

  return Item;
};
