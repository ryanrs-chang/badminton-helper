import * as line from "@line/bot-sdk";
import { TextEventMessage } from "@line/bot-sdk";
import { channelAccessToken, channelSecret } from "../config";
import Debug from "debug";
const debug = Debug("badminton:hadnlerEvent");
import joinGroup from "./joinGroup";
import signUpGameInGroup from "./signUpGameInGroup";
import { isSignUpInGroup, isCreateGameByManager } from "../utils/assertMessage";
import {
  HelpMessage,
  GroupsMessage,
  GamesMessage,
  CreateGameMessage
} from "../modules/messageTemplate";
import { updateUser } from "../modules/userHelper";
import { getManageGroups } from "../modules/groupHelper";
import { getGameList, createNewGame } from "../modules/gameHelper";
export const client = new line.Client({
  channelAccessToken,
  channelSecret
});
import database from "../database";
import * as utils from "../utils";

// { type: 'memberJoined',
//   replyToken: '7667fac8a64d4611a6b60275341b4873',
//   source:
//    { groupId: 'Cce9702dfcdf2824f50f89fd9054546c0', type: 'group' },
//   timestamp: 1566629933179,
//   joined: { members: [ [Object] ] } }
export default async function handleEvent(event: line.WebhookEvent) {
  debug(`event:\n`, event);

  /**
   * user say 'help' text
   */
  if (event.type === "message" && event.source.type === "user") {
    const message = await utils.getMessage(event);

    //
    // say 'help'
    if (message === "help") {
      return await help(client, event);
    }

    //
    // say 'game_list'
    if (/^group_list/g.test(message)) {
      const groups = await getManageGroups(event.source.userId);
      return client.replyMessage(event.replyToken, GroupsMessage(groups));
    }

    //
    // say 'game_list' <group_id>
    if (/^game_list: /g.test(message)) {
      const parsed_group_id = message.replace("game_list: ", "").trim();
      const games = await getGameList(parsed_group_id, event.source.userId);
      return client.replyMessage(event.replyToken, GamesMessage(games));
    }

    //
    // say 'game_create' <group_id>
    if (/^game_create: /g.test(message)) {
      const parsed_group_id = message.replace("game_create: ", "").trim();
      const valid = await isCreateGameByManager(event, parsed_group_id);
      if (valid) {
        const game = await createNewGame(parsed_group_id, {
          description: "開心打羽球",
          groupId: parsed_group_id
        });
        return client.replyMessage(event.replyToken, CreateGameMessage(game));
      }
      return;
    }
  }

  /**
   * when robot join to group
   */
  if (event.type === "join") {
    return await joinGroup(client, event);
  }

  /**
   *
   */
  if (event.type === "message" || event.type === "memberJoined") {
    await updateUser(client, event.source as any);
  }

  if (isSignUpInGroup(event)) {
    return await signUpGameInGroup(client, event);
  }

  return Promise.resolve(null);
}

/**
 * help command
 * @param client
 * @param event
 */
async function help(client: line.Client, event: line.MessageEvent) {
  return await client.replyMessage(event.replyToken, HelpMessage());
}
