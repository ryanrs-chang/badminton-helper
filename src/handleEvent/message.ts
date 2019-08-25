import * as line from "@line/bot-sdk";
import Debug from "debug";
const debug = Debug("badminton:hadnlerEvent");
import signUpGameInGroup from "./controller/signUpGameInGroup";
import { isSignUpInGroup, isCreateGameByManager } from "../utils/assertMessage";
import {
  HelpMessage,
  GroupsMessage,
  GamesMessage,
  CreateGameMessage
} from "../modules/messageTemplate";
import { getManageGroups } from "../modules/groupHelper";
import { getGameList, createNewGame } from "../modules/gameHelper";
import * as utils from "../utils";

/**
 * handleMessage
 * @param event
 */
export default async function handleMessage(
  client: line.Client,
  event: line.MessageEvent
) {
  /**
   * user say 'help' text
   */
  if (event.source.type === "user") {
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
