import { LoggerFilename } from "../logger";
const logger = LoggerFilename(__filename);

import Context from "koa-line-message-router/dist/lib/context";

import {
  findOneUserBySource,
  registerUnknownUser,
  findOneUnknownUserByDisplayNameInGame
} from "../modules/userHelper";
import {
  getLatestGameByGroup,
  addUserToGame,
  removeUserFromGame,
  endGame,
  createNewGame
} from "../modules/gameHelper";

import { isEmpty } from "lodash";
import { SignupMessage, HelloMessage } from "../modules/messageTemplate";
import { Group } from "@line/bot-sdk";
import { LatestGameContext, UsersContext } from "../type";

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

/**
 * handle user say +1
 * @param ctx Context
 */
export async function increment(ctx: Context) {
  logger.info("increment");
  const { groupId, userId } = ctx.event.source as Group;
  const lastestGame = await getLatestGameByGroup(groupId);
  if (!lastestGame) {
    logger.debug("no latest game");
    return;
  }

  const user = await findOneUserBySource(ctx.event.source as Group);

  const game = await addUserToGame(user, lastestGame);
  logger.info(`[+1] ${user.display_name} order successful!`);

  await ctx.$replyMessage(SignupMessage(lastestGame.description, game.users));
}

/**
 * handle user say -1
 * @param ctx Context
 */
export async function decrement(ctx: Context) {
  logger.info("decrement");
  const { groupId, userId } = ctx.event.source as Group;
  const lastestGame = await getLatestGameByGroup(groupId);
  if (!lastestGame) {
    logger.debug("no latest game");
    return;
  }

  const user = await findOneUserBySource(ctx.event.source as Group);

  const game = await removeUserFromGame(user, lastestGame);
  logger.info(`[-1] ${user.display_name}'s order cancelled.`);

  await ctx.$replyMessage(SignupMessage(lastestGame.description, game.users));
}

/**
 * handle user say #<name>+1
 * @param ctx Context
 */
export async function helpTheOtherIncrement(
  ctx: LatestGameContext & UsersContext
) {
  logger.info("helpTheOtherIncrement");
  const latestGame = ctx.latestGame;
  const game = await addUserToGame(ctx.users, latestGame);
  logger.info(`${ctx.users.map(u => u.display_name)} order successful!`);
  await ctx.$replyMessage(SignupMessage(latestGame.description, game.users));
}

/**
 * handle user say #<name>-1
 * @param ctx Context
 */
export async function helpTheOtherDecrement(ctx: LatestGameContext) {
  logger.info("helpTheOtherDecrement");
  const lastestGame = ctx.latestGame;

  const name = getSafeName(ctx.text);
  if (!name) return;
  logger.info("[#Name-1]", name);

  const user = await findOneUnknownUserByDisplayNameInGame(name, lastestGame);
  if (!user) {
    logger.info("[#Name-1] not found user: ", name);
    return;
  }

  const game = await removeUserFromGame(user, lastestGame);
  logger.info(`${name}'s order is cancelled by ${user.display_name}`);

  await ctx.$replyMessage(SignupMessage(lastestGame.description, game.users));
}

/**
 * handle user say 本週零打報名開始
 * @param ctx Context
 */
export async function gameStart(ctx: LatestGameContext) {
  logger.info("gameStart");
  const { groupId } = ctx.event.source as Group;

  const game = await createNewGame(groupId, {
    description: ctx.text
  });

  await ctx.$replyMessage({
    type: "text",
    text: replyStartingMessage
  });
}

/**
 * handle user say 本週零打報名結束
 * @param ctx Context
 */
export async function gameIsOver(ctx: LatestGameContext) {
  const lastestGame = ctx.latestGame;

  const game = await endGame(lastestGame);
  const users = game.users;
  let message = "";
  let sum = 0;
  users.forEach((user, index) => {
    message += `${index + 1}.${user.display_name}\n`;
    sum++;
  });

  logger.info("this game is completed");
  await ctx.$replyMessage({
    type: "text",
    text: `OK\n\n${message}\n共${sum}人`
  });
}
