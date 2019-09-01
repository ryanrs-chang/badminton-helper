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
  if (event.source.type === "user") {
    const message = await utils.getMessage(event);

    //
    // say 'help'
    //
    if (message === "help") {
      return await client.replyMessage(event.replyToken, HelpMessage());
    }

    //
    // say 'game_list'
    //
    if (/^group_list/g.test(message)) {
      const groups = await getManageGroups(event.source.userId);
      return client.replyMessage(event.replyToken, GroupsMessage(groups));
    }

    //
    // say 'game_list' <group_id>
    //
    if (/^game_list: /g.test(message)) {
      const parsedGroupId = message.replace("game_list: ", "").trim();
      const games = await getGameList(parsedGroupId, event.source.userId);
      return client.replyMessage(event.replyToken, GamesMessage(games));
    }

    //
    // say 'game_create' <group_id>
    //
    if (/^game_create: /g.test(message)) {
      const parsedGroupId = message.replace("game_create: ", "").trim();
      const valid = await isCreateGameByManager(event, parsedGroupId);
      if (valid) {
        const game = await createNewGame(parsedGroupId, {
          description: "打球！",
          groupId: parsedGroupId
        });
        return client.replyMessage(event.replyToken, CreateGameMessage(game));
      }
      return;
    }
  }

  /**
   * sign up this week play game
   */
  if (isSignUpInGroup(event)) {
    return await signUpGameInGroup(client, event);
  }

  return Promise.resolve(null);
}
