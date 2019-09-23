import { Group } from "@line/bot-sdk";
import database from "../database";
import Context from "koa-line-message-router/dist/lib/context";

export default async function joinGroup(ctx: Context) {
  const source: Group = ctx.event.source as Group;
  await database.Group.upsert({
    id: source.groupId
  });
}
