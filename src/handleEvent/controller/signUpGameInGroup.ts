import * as line from "@line/bot-sdk";
import database from "../../database";
import { Role } from "../../config";
import {
  findOneUserBySource,
  registerUnknownUser,
  findOneUnknownUserByDisplayNameInGame
} from "../../modules/userHelper";
import { getMessage } from "../../utils";
import {
  getLatestGameByGroup,
  addUserToGame,
  removeUserFromGame,
  createNewGame,
  endGame
} from "../../modules/gameHelper";
import { GameInstance } from "../../models/game";
import { isEmpty } from "lodash";
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

function getSafeName(message: string): string {
  const name = message.substring(1, message.length - 2);
  if (isEmpty(name)) {
    return null;
  }
  return name.trim();
}

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

  // Manage user join to Game
  const lastestGame = await getLatestGameByGroup(groupId);

  if (/^本週零打開始報名.*/g.test(message)) {
    if (lastestGame) {
      await client.replyMessage(event.replyToken, {
        type: "text",
        text: "還有零打報名尚未結束"
      });
      return;
    }

    const game = await createNewGame(groupId, {
      description: message
    });

    await client.replyMessage(event.replyToken, {
      type: "text",
      text: replyStartingMessage
    });

    return;
  }

  if (!lastestGame) {
    debug("no latest game");
    return;
  }

  // set game to enpty
  if (/^本週零打報名結束.*/g.test(message)) {
    const game = await endGame(lastestGame);
    const users = game.users;
    let message = "";
    let sum = 0;
    users.forEach((user, index) => {
      message += `${index + 1}.${user.display_name}\n`;
      sum++;
    });

    info("this game is completed");
    await client.replyMessage(event.replyToken, {
      type: "text",
      text: `OK\n\n${message}\n共${sum}人`
    });
    return;
  }

  //
  // find user and get profile
  const user = await findOneUserBySource(event.source);
  let game: GameInstance;

  //
  // handle #<Name>+1
  if (/^\#.+\+1$/g.test(message)) {
    const name = getSafeName(message);
    if (!name) return;
    info("[#Name+1]", name);

    const existUser = await findOneUnknownUserByDisplayNameInGame(
      name,
      lastestGame
    );
    if (existUser) {
      info(`${name} exist in game`);
      return;
    }

    const unknowUser = await registerUnknownUser(name);
    game = await addUserToGame(unknowUser, lastestGame);
    info(
      `${unknowUser.display_name} order successful! by ${user.display_name}`
    );

    //
    // handle #<Name>-1
  } else if (/^\#.+\-1$/g.test(message)) {
    const name = getSafeName(message);
    if (!name) return;
    info("[#Name-1]", name);

    const user = await findOneUnknownUserByDisplayNameInGame(name, lastestGame);
    if (!user) {
      info("[#Name-1] not found user: ", name);
      return;
    }

    game = await removeUserFromGame(user, lastestGame);
    info(`${name}'s order is cancelled by ${user.display_name}`);

    //
    // handle +1
  } else if (/^\+1$/g.test(message)) {
    game = await addUserToGame(user, lastestGame);
    info(`[+1] ${user.display_name} order successful!`);

    //
    // handle -1
  } else if (/^\-1$/g.test(message)) {
    game = await removeUserFromGame(user, lastestGame);
    info(`[-1] ${user.display_name}'s order cancelled.`);
  } else {
    info(`no match event!`);
    return;
  }

  return await client.replyMessage(
    event.replyToken,
    SignupMessage(lastestGame.description, game.users)
  );
}
