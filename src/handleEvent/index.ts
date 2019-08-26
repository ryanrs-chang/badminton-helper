import Debug from "debug";
const debug = Debug("badminton:dispatchEvent");

import * as line from "@line/bot-sdk";
import handleMessage from "./message";
import handleJoin from "./join";
import handlePostback from "./postback";
import handleMemberJoin from "./memberJoin";
import handleMemberLeave from "./memberLeave";

import {
  updateUserInMessageEvent,
  updateGroupUserInJoin
} from "../modules/userHelper";

import { channelAccessToken, channelSecret } from "../config";
export const client = new line.Client({
  channelAccessToken,
  channelSecret
});

export default async function handleEvent(events: line.WebhookEvent[]) {
  return await Promise.all(events.map(dispatchEvent));
}

export async function dispatchEvent(event: line.WebhookEvent) {
  switch (event.type) {
    case "message":
      //
      debug(`dispatch to message: `, JSON.stringify(event, null, 2));
      await updateUserInMessageEvent(client, event);
      await handleMessage(client, event);
      //
      break;
    case "join":
      //
      debug(`dispatch to message: `, JSON.stringify(event, null, 2));
      await handleJoin(client, event);
      break;
    case "memberJoined":
      //
      debug(`dispatch to message: `, JSON.stringify(event, null, 2));
      await updateGroupUserInJoin(client, event);
      await handleMemberJoin(client, event);
      //
      break;
    case "memberLeft":
      //
      debug(`dispatch to message: `, JSON.stringify(event, null, 2));
      await handleMemberLeave(client, event);
      //
      break;
    case "postback":
      //
      debug(`dispatch to message: `, JSON.stringify(event, null, 2));
      await handlePostback(client, event);
      //
      break;
    default:
      debug(
        "not found function handle this event: ",
        JSON.stringify(event, null, 2)
      );
  }

  return Promise.resolve(null);
}
