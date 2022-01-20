import { config } from "../../../lib/config/config";
import { createScore, getWorkspaceScores } from "../../../lib/models/score";
import { getWorkspace } from "../../../lib/models/workspace";
import {
  SlackEventRequestBody,
  SlackMessageChannelsEvent,
  SlackWorkflowStepExecuteEvent,
} from "../../../lib/next-slack/handle-event";
import { NextSlack } from "../../../lib/next-slack/next-slack";
import { getWebClient } from "../../../lib/slack/client";
import { getCurrentPuzzleNumber } from "../../../lib/utils/wordle";

const checkMessageForWordleSyntax = (text: string) => {
  const matches = text.match(/Wordle \d+ \d\/6/);

  if (!matches) {
    return false;
  }

  return true;
};

const parseWordleMessage = (message: string) => {
  const [score] = message.split("\n");

  const [, id, attempts] = score.match(/Wordle (\d+) (\d)\/6/);

  return {
    id: parseInt(id),
    attempts: parseInt(attempts),
  };
};

export default NextSlack({
  interactions: [
    {
      actionId: "select_daily_summary_destination",
      handler: () => {},
    },
    {
      actionId: "get_summary",
      handler: async (request) => {
        const webClient = await getWebClient(request.team.id);

        const wordleNumber = getCurrentPuzzleNumber();

        const scores = await getWorkspaceScores(request.team.id, wordleNumber);

        if (scores.length === 0) {
          await webClient.chat.postMessage({
            channel: request.channel.id,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `No one has played today's Wordle #${wordleNumber}!`,
                },
              },
              {
                type: "divider",
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: `_*Sent via Wordle Scoreboards* • <${config.app.aboutUrl}|About> • <${config.app.bugReportUrl}|Report a bug>_`,
                  },
                ],
              },
            ],
            text: "No one has played Wordle today!",
          });
          return;
        }

        const fewestAttempts = scores.sort((a, b) =>
          a.attempts < b.attempts ? -1 : 1
        )[0].attempts;

        await webClient.chat.postMessage({
          channel: request.channel.id,
          unfurl_links: false,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `Wordle #${wordleNumber} daily summary`,
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${
                  scores.length
                }* team members played today, and the best attempt was *${fewestAttempts} ${
                  fewestAttempts === 1 ? "guess" : "guesses"
                }*`,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `🎉 Congratulations to these team members who completed today's Wordle in the fewest attempts:
${scores
  .filter((s) => s.attempts === fewestAttempts)
  .map((s) => `• <@${s.userId}>`)
  .join("\n")}`,
              },
            },
            {
              type: "divider",
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `_*Sent via Wordle Scoreboards* • <${config.app.aboutUrl}|About> • <${config.app.bugReportUrl}|Report a bug>_`,
                },
              ],
            },
          ],
          text: "Your Wordle daily summary is ready",
        });
      },
    },
  ],
  viewSubmissions: [
    {
      callbackId: "",
      handler: async (request) => {
        if (!request.workflow_step) {
          return;
        }

        const webClient = await getWebClient(request.team.id);

        await webClient.workflows.updateStep({
          inputs: {
            channelId: {
              value: (
                request.view.state.values.select_daily_summary_actions as any
              ).select_daily_summary_destination.selected_channel,
            },
          },
          outputs: [
            {
              type: "text",
              name: "channelId",
              label: "Channel",
            },
          ],
          workflow_step_edit_id: request.workflow_step.workflow_step_edit_id,
        });
      },
    },
  ],
  workflowStepEdits: [
    {
      callbackId: "daily_summary",
      handler: async (request) => {
        const webClient = await getWebClient(request.team.id);

        await webClient.views.open({
          trigger_id: request.trigger_id,
          view: {
            type: "workflow_step",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "Choose the channel to post the daily summary to.",
                },
              },
              {
                type: "actions",
                block_id: "select_daily_summary_actions",
                elements: [
                  {
                    type: "channels_select",
                    placeholder: {
                      type: "plain_text",
                      text: "Select a channel",
                      emoji: true,
                    },
                    initial_channel: request.workflow_step.inputs.channelId
                      ? request.workflow_step.inputs.channelId.value
                      : undefined,
                    action_id: "select_daily_summary_destination",
                  },
                ],
              },
            ],
          },
        });
      },
    },
  ],
  events: [
    {
      type: "workflow_step_execute",
      handler: async (
        request: SlackEventRequestBody<SlackWorkflowStepExecuteEvent>
      ) => {
        const webClient = await getWebClient(request.team_id);

        const wordleNumber = getCurrentPuzzleNumber();

        const scores = await getWorkspaceScores(request.team_id, wordleNumber);

        if (scores.length === 0) {
          await webClient.chat.postMessage({
            channel: request.event.workflow_step.inputs.channelId.value,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `No one has played today's Wordle #${wordleNumber}!`,
                },
              },
              {
                type: "divider",
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: `_*Sent via Wordle Scoreboards* • <${config.app.aboutUrl}|About> • <${config.app.bugReportUrl}|Report a bug>_`,
                  },
                ],
              },
            ],
            text: "No one has played Wordle today!",
          });
          return;
        }

        const fewestAttempts = scores.sort((a, b) =>
          a.attempts < b.attempts ? -1 : 1
        )[0].attempts;

        await webClient.chat.postMessage({
          channel: request.event.workflow_step.inputs.channelId.value,
          unfurl_links: false,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `Wordle #${wordleNumber} daily summary`,
                emoji: true,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${
                  scores.length
                }* team members played today, and the best attempt was *${fewestAttempts} ${
                  fewestAttempts === 1 ? "guess" : "guesses"
                }*`,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `🎉 Congratulations to these team members who completed today's Wordle in the fewest attempts:
${scores
  .filter((s) => s.attempts === fewestAttempts)
  .map((s) => `• <@${s.userId}>`)
  .join("\n")}`,
              },
            },
            {
              type: "divider",
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `_*Sent via Wordle Scoreboards* • <${config.app.aboutUrl}|About> • <${config.app.bugReportUrl}|Report a bug>_`,
                },
              ],
            },
          ],
          text: "Your Wordle daily summary is ready",
        });
      },
    },
    {
      type: "member_joined_channel",
      handler: async (request) => {
        const { botUserId } = await getWorkspace(request.team_id);

        if (request.event.user !== botUserId) {
          // Another user has joined, not the Wordle bot
          return;
        }

        const webClient = await getWebClient(request.team_id);

        await webClient.chat.postMessage({
          channel: request.event.channel,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Hi, I'm the Wordle scoreboard bot, here to track your Wordle scores for your team! I'll :eyes: look out for any Wordle messages you send, and report back with a daily summary and a celebration of your team's best Wordler!",
              },
            },
            {
              type: "divider",
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `_*Sent via Wordle Scoreboards* • <${config.app.aboutUrl}|About> • <${config.app.bugReportUrl}|Report a bug>_`,
                },
              ],
            },
          ],
          text: "Hi, I'm the Wordle scoreboard bot, here to track your Wordle scores for your team! I'll look out for any Wordle messages you send, and report back with a daily summary and a celebration of your team's best Wordler!",
        });
      },
    },
    {
      type: "app_mention",
      handler: async (request) => {
        const webClient = await getWebClient(request.team_id);
        const wordleNumber = getCurrentPuzzleNumber();

        await webClient.chat.postMessage({
          channel: request.event.channel,
          thread_ts: request.event.event_ts,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Hey there! If you'd like a team summary for today's Wordle (#${wordleNumber}), hit the button below!`,
              },
            },
            {
              type: "actions",
              block_id: "app_mention_actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Get today's summary",
                    emoji: true,
                  },
                  action_id: "get_summary",
                },
              ],
            },
            {
              type: "divider",
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `_*Sent via Wordle Scoreboards* • <${config.app.aboutUrl}|About> • <${config.app.bugReportUrl}|Report a bug>_`,
                },
              ],
            },
          ],
          text: "Hey there! If you'd like a team summary for today's Wordle, hit the button below!",
        });
      },
    },
    {
      type: "message",
      handler: async (
        request: SlackEventRequestBody<SlackMessageChannelsEvent>
      ) => {
        const webClient = await getWebClient(request.team_id);

        const isWordleMessage = checkMessageForWordleSyntax(request.event.text);

        if (!isWordleMessage) {
          return;
        }

        const { id, attempts } = parseWordleMessage(request.event.text);

        await createScore({
          userId: request.event.user,
          workspaceId: request.team_id,
          wordleId: id,
          attempts,
        });

        await webClient.chat.postMessage({
          channel: request.event.channel,
          thread_ts: request.event.event_ts,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `I've recorded your score, thanks <@${request.event.user}>!`,
              },
            },
          ],
          text: "I've recorded your score, thanks!",
        });
      },
    },
  ],
});
