import { Action, Option, View } from "@slack/types";
import { NextApiHandler } from "next";
import { NotFoundError } from "../utils/errors";

export type NextSlackInteraction = {
  actionId: string;
  valueMatcher?: (value: string) => boolean;
  handler: (
    req: SlackInteractionRequestPayload,
    actionValue: string
  ) => Promise<void> | void;
};

export type NextSlackViewSubmission = {
  callbackId: string;
  handler: (
    req: SlackViewSubmissionRequestPayload,
    state: Record<string | number, unknown>,
    metadata: string | undefined
  ) => Promise<void> | void;
};

export type NextSlackWorkflowStepEdit = {
  callbackId: string;
  handler: (
    req: SlackWorkflowStepEditRequestPayload,
    triggerId: string,
    workflowStep: {
      id: string;
    }
  ) => Promise<void> | void;
};

type SlackViewSubmissionRequestPayload = {
  type: "view_submission";
  team: {
    id: string;
    domain: string;
  };
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
  api_app_id: string;
  token: string;
  trigger_id: string;
  enterprise: unknown;
  is_enterprise_install: boolean;
  view: View & {
    state: {
      values: Record<string | number, unknown>;
    };
  };
  workflow_step?: {
    workflow_id: string;
    workflow_step_edit_id: string;
  };
};

type SlackInteractionRequestPayload = {
  type: string;
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
  channel: {
    id: string;
  };
  api_app_id: string;
  token: string;
  container: unknown;
  trigger_id: string;
  team: {
    id: string;
    domain: string;
  };
  enterprise: unknown;
  is_enterprise_install: boolean;
  view: View;
  actions: Action[];
};

type SlackWorkflowStepEditRequestPayload = {
  type: string;
  user: {
    id: string;
    username: string;
    name: string;
    team_id: string;
  };
  api_app_id: string;
  token: string;
  container: unknown;
  trigger_id: string;
  team: {
    id: string;
    domain: string;
  };
  enterprise: unknown;
  is_enterprise_install: boolean;
  view: View;
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
};

const parsePayload = (
  body: string
):
  | SlackViewSubmissionRequestPayload
  | SlackWorkflowStepEditRequestPayload
  | SlackInteractionRequestPayload => {
  const data = JSON.parse(body);

  if (data.type === "view_submission") {
    return data as SlackViewSubmissionRequestPayload;
  }

  if (data.type === "workflow_step_edit") {
    return data as SlackWorkflowStepEditRequestPayload;
  }

  return data as SlackInteractionRequestPayload;
};

interface OverflowAction extends Action {
  type: "overflow";
  block_id: string;
  selected_option: {
    text: Option["text"];
    value: string;
  };
}

interface ButtonAction extends Action {
  type: "button";
  block_id: string;
  text: Option["text"];
  value: string;
}

interface ChannelsSelectAction extends Action {
  type: "channels_select";
  action_id: string;
  block_id: string;
  selected_channel: string;
}

const getAction = (
  actions: Action[]
): OverflowAction | ButtonAction | ChannelsSelectAction => {
  const action = actions[0];

  switch (action.type) {
    case "overflow":
      return action as OverflowAction;
    case "button":
      return action as ButtonAction;
    case "channels_select":
      return action as ChannelsSelectAction;
    default:
      throw new Error(`Action type "${action.type}" not implemented`);
  }
};

const getActionValue = (
  action: OverflowAction | ButtonAction | ChannelsSelectAction
) => {
  switch (action.type) {
    case "overflow":
      return action.selected_option.value;
    case "button":
      return action.value;
    case "channels_select":
      return action.selected_channel;
  }
};

export const handleInteraction =
  (
    interactions: NextSlackInteraction[],
    viewSubmissions: NextSlackViewSubmission[],
    workflowStepEdits: NextSlackWorkflowStepEdit[]
  ): NextApiHandler =>
  async (req, res) => {
    const payload = parsePayload(req.body.payload);
    if (payload.type === "view_submission") {
      if (!payload.view) {
        throw new Error("No view sent with payload");
      }

      const configuredViewSubmission = viewSubmissions.find((i) => {
        const matchedCallbackId = i.callbackId === payload.view.callback_id;

        if (!matchedCallbackId) {
          return false;
        }

        return true;
      });

      if (!configuredViewSubmission) {
        throw new NotFoundError(
          "Unable to find a configuration for the provided action"
        );
      }

      const viewSubmissionPayload =
        payload as SlackViewSubmissionRequestPayload;

      await configuredViewSubmission.handler(
        viewSubmissionPayload,
        viewSubmissionPayload.view.state.values,
        viewSubmissionPayload.view.private_metadata
      );

      res.statusCode = 200;
      res.end();

      return;
    }

    if (payload.type === "workflow_step_edit") {
      const interactionPayload = payload as SlackWorkflowStepEditRequestPayload;

      const { callback_id, trigger_id, workflow_step } =
        interactionPayload as any;

      const configuredWorkflowStepEdit = workflowStepEdits.find((i) => {
        const matchedCallbackId = i.callbackId === callback_id;

        if (!matchedCallbackId) {
          return false;
        }

        return true;
      });

      if (!configuredWorkflowStepEdit) {
        throw new NotFoundError(
          "Unable to find a configuration for the provided workflow step edit"
        );
      }

      await configuredWorkflowStepEdit.handler(
        interactionPayload,
        trigger_id,
        workflow_step
      );

      res.statusCode = 200;
      res.end();

      return;
    }

    const interactionPayload = payload as SlackInteractionRequestPayload;

    if (
      !interactionPayload.actions ||
      interactionPayload.actions.length === 0
    ) {
      throw new Error("No action sent with payload");
    }

    const action = getAction(interactionPayload.actions);

    const configuredInteraction = interactions.find((i) => {
      const matchedActionId = i.actionId === action.action_id;

      if (!matchedActionId) {
        return false;
      }

      if (!i.valueMatcher) {
        return true;
      }

      return i.valueMatcher(getActionValue(action));
    });

    if (!configuredInteraction) {
      throw new NotFoundError(
        "Unable to find a configuration for the provided action"
      );
    }

    await configuredInteraction.handler(
      interactionPayload,
      getActionValue(action)
    );

    res.statusCode = 200;
    res.end();
  };
