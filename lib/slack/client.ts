import { WebClient } from "@slack/web-api";
import { getWorkspace } from "../models/workspace";

export const createSlackWebClient = (botToken: string) => {
  return new WebClient(botToken);
};

export const getWebClient = async (workspaceId: string) => {
  const { botToken } = await getWorkspace(workspaceId);
  const webClient = createSlackWebClient(botToken);

  return webClient;
};
