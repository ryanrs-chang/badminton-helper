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
import { SignupMessage } from "../modules/messageTemplate";
import { Group } from "@line/bot-sdk";

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
export async function helpTheOtherIncrement(ctx: Context) {
  logger.info("helpTheOtherIncrement");
  const { groupId, userId } = ctx.event.source as Group;
  const lastestGame = await getLatestGameByGroup(groupId);
  if (!lastestGame) {
    logger.debug("no latest game");
    return;
  }

  const user = await findOneUserBySource(ctx.event.source as Group);

  const name = getSafeName(ctx.text);
  if (!name) return;
  logger.info("[#Name+1]", name);

  const existUser = await findOneUnknownUserByDisplayNameInGame(
    name,
    lastestGame
  );
  if (existUser) {
    logger.info(`${name} exist in game`);
    return;
  }

  const unknowUser = await registerUnknownUser(name);
  const game = await addUserToGame(unknowUser, lastestGame);
  logger.info(
    `${unknowUser.display_name} order successful! by ${user.display_name}`
  );

  await ctx.$replyMessage(SignupMessage(lastestGame.description, game.users));
}

/**
 * handle user say #<name>-1
 * @param ctx Context
 */
export async function helpTheOtherDecrement(ctx: Context) {
  logger.info("helpTheOtherDecrement");
  const { groupId, userId } = ctx.event.source as Group;
  const lastestGame = await getLatestGameByGroup(groupId);
  if (!lastestGame) {
    logger.debug("no latest game");
    return;
  }

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
export async function gameStart(ctx: Context) {
  logger.info("gameStart");
  const { groupId, userId } = ctx.event.source as Group;
  const lastestGame = await getLatestGameByGroup(groupId);

  if (lastestGame) {
    ctx.$replyMessage({
      type: "text",
      text: "還有零打報名尚未結束"
    });
    return;
  }

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
export async function gameIsOver(ctx: Context) {
  const { groupId, userId } = ctx.event.source as Group;
  const lastestGame = await getLatestGameByGroup(groupId);
  if (!lastestGame) {
    logger.debug("no latest game");
    return;
  }

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
