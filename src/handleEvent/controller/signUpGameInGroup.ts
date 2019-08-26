import * as line from "@line/bot-sdk";
import { TextEventMessage } from "@line/bot-sdk";
import database from "../../database";
import { Role, TITLE_MESSAGE } from "../../config";
import {
  findOneUser,
  registerUnknownUser,
  findOneUserByNameInGame
} from "../../modules/userHelper";
import { getMessage } from "../../utils";
import {
  getLatestGameByGroup,
  addUserToGame,
  removeUserFromsGame,
  createNewGame
} from "../../modules/gameHelper";
import { client } from "../index";
import { GameInstance } from "../../models/game";
import Debug from "debug";
const debug = Debug("badminton:signupGameInGroup:debug");
const info = Debug("badminton:signupGameInGroup");

import { SignupMessage } from "../../modules/messageTemplate";

let replyStartingMessage = "";
replyStartingMessage += "統計人數就交給我吧！\n\n";
replyStartingMessage += "喊 +1 會幫你報名\n";
replyStartingMessage += "喊 -1 會取消報名\n";
replyStartingMessage += "喊 #Jason+1 會幫 Jason 報名\n";
replyStartingMessage += "喊 #Jason-1 會幫 Jason 取消\n";
export default async function signUpGameInGroup(
  client: line.Client,
  event: line.MessageEvent
): Promise<any> {
  if (event.source.type !== "group") {
    return Promise.resolve(null);
  }
  const { groupId, userId } = event.source;

  // register user to group
  const UserGroup = await database.UserGroup.upsert({
    groupId,
    userId,
    role: Role.User
  });

  const message = await getMessage(event);

  if (/^本週零打開始報名.*/g.test(message)) {
    const game = await createNewGame(groupId, {
      description: TITLE_MESSAGE
    });

    await client.replyMessage(event.replyToken, {
      type: "text",
      text: replyStartingMessage
    });

    return;
  }

  // Manage user join to Game
  const lastestGame = await getLatestGameByGroup(groupId);
  if (!lastestGame) {
    debug("no latest game");
    return;
  }

  // find user and get profile
  const user = await findOneUser(event.source);
  let game: GameInstance;

  if (/^\#.*\+1$/g.test(message)) {
    const name = message.substring(1, message.length - 2);
    info("[#Name+1]", name);
    const unknowUser = await registerUnknownUser(name);
    game = await addUserToGame(unknowUser, lastestGame);
    debug(
      `${unknowUser.display_name} order successful! by ${user.display_name}`
    );
  } else if (/^\#.*\-1$/g.test(message)) {
    const name = message.substring(1, message.length - 2);
    info("[#Name-1]", name);

    const userOfGames = await findOneUserByNameInGame(name, lastestGame);
    if (!userOfGames) {
      debug("[#Name-1] not found user: ", name);
      return;
    }

    game = await removeUserFromsGame(userOfGames, lastestGame);
    debug(`${name}'s order is cancelled by ${user.display_name}`);
  } else {
    switch (message) {
      case "+1":
        game = await addUserToGame(user, lastestGame);
        debug(`[+1] ${user.display_name} order successful!`);
        break;
      case "-1":
        game = await removeUserFromsGame(user, lastestGame);
        debug(`[-1] ${user.display_name}'s order cancelled.`);
        break;
      default:
        debug(`no match event!`);
        return;
    }
  }

  return await client.replyMessage(
    event.replyToken,
    SignupMessage(lastestGame.description, game.users)
  );
}
