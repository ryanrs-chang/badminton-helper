import * as line from "@line/bot-sdk";
import { TextEventMessage } from "@line/bot-sdk";
import { channelAccessToken, channelSecret } from "../config";
import Debug from "debug";
const debug = Debug("badminton:hadnlerEvent");
import joinGroup from "./joinGroup";
import createGame from "./admin/createGame";
import signUpGameInGroup from "./signUpGameInGroup";
import { isSignUpInGroup, isCreateGameByManager } from "../utils/assertMessage";

export const client = new line.Client({
  channelAccessToken,
  channelSecret
});
import database from "../database";
import * as utils from "../utils";

export default async function handleEvent(event: line.WebhookEvent) {
  debug(`event:\n`, event);

  if (event.type === "join") {
    return await joinGroup(client, event);
  }

  if (isSignUpInGroup(event)) {
    return await signUpGameInGroup(client, event);
  }

  const message = utils.getMessage(event);
  const valid = await isCreateGameByManager(event, message);
  if (valid) {
    return await createGame(client, event as line.MessageEvent);
  }

  return Promise.resolve(null);
}
