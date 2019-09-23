import Context from "koa-line-message-router/dist/lib/context";
import database from "../database";
import { UserType } from "../config";
import { LoggerFilename } from "../logger";
const logger = LoggerFilename(__filename);
import { User, Profile, MemberJoinEvent, Group } from "@line/bot-sdk";

export default async function updateUserInfoWhenJoinGroup(ctx: Context) {
  logger.debug("updateUserInfoWhenJoinGroup");
  const event = ctx.event as MemberJoinEvent;
  const source = event.source as Group;
  const members: User[] = event.joined.members.filter(m => m.type === "user");

  const gId = source.groupId;
  const userProfile: Profile[] = await Promise.all(
    members.map(m => ctx.client.getGroupMemberProfile(gId, m.userId))
  );

  await Promise.all(
    userProfile.map(profile =>
      database.User.upsert({
        id: profile.userId,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl,
        type: UserType.Line
      })
    )
  );
}
