import Context from "koa-line-message-router/dist/lib/context";
import { Group } from "@line/bot-sdk";
import database from "./database";
import { Role } from "./config";

import { LoggerFilename } from "./logger";
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
