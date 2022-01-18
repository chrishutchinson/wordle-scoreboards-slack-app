import { NextApiHandler } from "next";
import { NotFoundError } from "../utils/errors";

export interface NextBaseSlackEvent {
  type: string;
  handler: (request: SlackEventRequestBody) => void;
}

interface NextSlackEventAppHomeOpened extends NextBaseSlackEvent {
  type: "app_home_opened";
  handler: (request: SlackEventRequestBody<SlackAppHomeOpenedEvent>) => void;
}

interface NextSlackEventMemberJoinedChannel extends NextBaseSlackEvent {
  type: "member_joined_channel";
  handler: (
    request: SlackEventRequestBody<SlackMemberJoinedChannelEvent>
  ) => void;
}

interface NextSlackEventMessageChannels extends NextBaseSlackEvent {
  type: "message";
  handler: (request: SlackEventRequestBody<SlackMessageChannelsEvent>) => void;
}

interface NextSlackEventWorkflowStepExecute extends NextBaseSlackEvent {
  type: "workflow_step_execute";
  handler: (
    request: SlackEventRequestBody<SlackWorkflowStepExecuteEvent>
  ) => void;
}

interface NextSlackEventAppMention extends NextBaseSlackEvent {
  type: "app_mention";
  handler: (request: SlackEventRequestBody<SlackAppMentionEvent>) => void;
}

interface SlackBaseEvent {
  type: string;
  user: string;
  channel: string;
  event_ts: string;
}

interface SlackAppHomeOpenedEvent extends SlackBaseEvent {
  tab: "home" | "messages";
  view: {
    team_id: string;
  };
}

interface SlackMemberJoinedChannelEvent extends SlackBaseEvent {}
interface SlackAppMentionEvent extends SlackBaseEvent {}
export interface SlackMessageChannelsEvent extends SlackBaseEvent {
  text: string;
}
export interface SlackWorkflowStepExecuteEvent extends SlackBaseEvent {
  workflow_step: {
    workflow_id: string;
    inputs: {
      [key: string]: {
        value: string;
      };
    };
    outputs: {
      name: string;
      label: string;
      type: "text";
    }[];
  };
}

export type SlackEventRequestBody<T extends SlackBaseEvent = SlackBaseEvent> = {
  token: string;
  team_id: string;
  api_app_id: string;
  event: T;
  type: "event_callback";
  event_id: string;
  event_time: number;
  authed_users: string[];
  authorizations: unknown[];
  is_ext_shared_channel: boolean;
};

const parseBody = (body: unknown): SlackEventRequestBody => {
  return body as SlackEventRequestBody;
};

export const handleEvent =
  (events: NextBaseSlackEvent[]): NextApiHandler =>
  async (req, res) => {
    if (req.body.challenge) {
      res.send(req.body.challenge);
      return;
    }

    const slackRequest = parseBody(req.body);

    const configuredEvent = events.find(
      (e) => e.type === slackRequest.event.type
    );

    if (!configuredEvent) {
      throw new NotFoundError(
        `Unable to find a handler for event "${slackRequest.event.type}"`
      );
    }

    switch (slackRequest.event.type) {
      case "app_home_opened":
        await (configuredEvent as NextSlackEventAppHomeOpened).handler(
          slackRequest as SlackEventRequestBody<SlackAppHomeOpenedEvent>
        );
        break;
      case "member_joined_channel":
        await (configuredEvent as NextSlackEventMemberJoinedChannel).handler(
          slackRequest as SlackEventRequestBody<SlackMemberJoinedChannelEvent>
        );
        break;
      case "workflow_step_execute":
        await (configuredEvent as NextSlackEventWorkflowStepExecute).handler(
          slackRequest as SlackEventRequestBody<SlackWorkflowStepExecuteEvent>
        );
        break;
      case "message":
        await (configuredEvent as NextSlackEventMessageChannels).handler(
          slackRequest as SlackEventRequestBody<SlackMessageChannelsEvent>
        );
        break;
      case "app_mention":
        await (configuredEvent as NextSlackEventAppMention).handler(
          slackRequest as SlackEventRequestBody<SlackAppMentionEvent>
        );
        break;
      default:
        throw new Error("Unknown event type");
    }

    res.statusCode = 200;
    res.end();
  };
