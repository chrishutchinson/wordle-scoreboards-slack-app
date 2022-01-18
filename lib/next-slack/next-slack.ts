import { NextApiHandler } from "next";
import { NotFoundError } from "../utils/errors";
import { logger } from "../utils/logger";
import { handleEvent, NextBaseSlackEvent } from "./handle-event";
import {
  handleInteraction,
  NextSlackInteraction,
  NextSlackViewSubmission,
  NextSlackWorkflowStepEdit,
} from "./handle-interaction";

enum RequestType {
  Event = "event",
  Interaction = "interaction",
}

const validateRequestPath = (path: string): RequestType => {
  if (path === "event") {
    return RequestType.Event;
  }

  if (path === "interaction") {
    return RequestType.Interaction;
  }

  throw new NotFoundError(`"${path}" is not a valid request path`);
};

type NextSlackArgs = {
  events?: NextBaseSlackEvent[];
  interactions?: NextSlackInteraction[];
  viewSubmissions?: NextSlackViewSubmission[];
  workflowStepEdits?: NextSlackWorkflowStepEdit[];
};

export const NextSlack =
  ({
    events,
    interactions,
    viewSubmissions,
    workflowStepEdits,
  }: NextSlackArgs): NextApiHandler =>
  async (req, res) => {
    try {
      if (!req.url) {
        throw new Error("Invalid request");
      }

      const requestPath = req.url.replace("/api/slack/", "");
      const requestType = validateRequestPath(requestPath);

      switch (requestType) {
        case RequestType.Event:
          await handleEvent(events || [])(req, res);
          break;
        case RequestType.Interaction:
          await handleInteraction(
            interactions || [],
            viewSubmissions || [],
            workflowStepEdits || []
          )(req, res);
          break;
      }
    } catch (e) {
      if (e instanceof NotFoundError) {
        res.statusCode = 404;
        res.end();
        return;
      }

      logger.error(e.message);

      res.statusCode = 500;
      res.end();
    }
  };
