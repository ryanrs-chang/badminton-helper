import Context from "koa-line-message-router/dist/lib/context";
import { Group } from "@line/bot-sdk";
import database from "./database";
import { Role } from "./config";

import { LoggerFilename } from "./logger";
import { Message } from "@line/bot-sdk/lib/types";
import * as _ from "lodash";
import { LatestGameContext, UsersContext } from "./type";
import { GameInstance } from "./models/game";

import { getLatestGameByGroup } from "./modules/gameHelper";

const logger = LoggerFilename(__filename);

export function registerUserToGroup() {
  return async function(ctx: Context, next: () => Promise<null>) {
    logger.debug("registerUserToGroup");
    const { groupId, userId } = ctx.event.source as Group;
    // register user to group
    await database.UserGroup.upsert({
      groupId,
      userId,
      role: Role.User
    });
    await next();
  };
}

export interface HasLatestGameParam {
  success?: Message;
  reject?: Message;
}

/**
 * rejectMessage?: Message
 * check had Latest game
 */
export function hasLatestGame(
  callback?: (latestGame: GameInstance) => Message
) {
  return async function hasLatestGame(
    ctx: LatestGameContext,
    next: () => Promise<void>
  ) {
    const { groupId } = ctx.event.source as Group;
    if (!groupId) {
      logger.debug("no group id");
      return;
    }

    const latestGame = await getLatestGameByGroup(groupId);
    ctx.latestGame = latestGame;

    if (callback) {
      let msg = callback(latestGame);
      if (msg) {
        console.log(msg);
        return ctx.$replyMessage(msg);
      }
      return await next();
    }

    await next();
  };
}

export function handleMutipleUser() {
  return async function handleMutipleUser(ctx: UsersContext) {
    const users = ctx.text
      .substring(1, ctx.text.length - 2)
      .split(";")
      .filter(str => !_.isEmpty(str))
      .map(user => {
        //
        // TODO: mapping or register user to database
        //
      });
    ctx.users = users as [];
  };
}
