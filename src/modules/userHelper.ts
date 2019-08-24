import * as line from "@line/bot-sdk";
import database from "../database";
import { UserType } from "../config";
import Debug from "debug";
const debug = Debug("badminton:hadnlerEvent");

/**
 * get User by Group
 * @param client
 * @param source
 */
export async function updateUser(
  client: line.Client,
  source: line.Group | line.User
): Promise<void> {
  let line_user: line.Profile;
  if (source.type === "user") {
    line_user = await client.getProfile(source.userId);
    await database.User.upsert({
      id: line_user.userId,
      display_name: line_user.displayName,
      picture_url: line_user.pictureUrl,
      type: UserType.Line
    });
  } else if (source.type === "group") {
    line_user = await client.getGroupMemberProfile(
      source.groupId,
      source.userId
    );

    // update group and user
    await Promise.all([
      await database.User.upsert({
        id: line_user.userId,
        display_name: line_user.displayName,
        picture_url: line_user.pictureUrl,
        type: UserType.Line
      }),
      await database.Group.upsert({
        id: source.groupId
      })
    ]);
    await database.UserGroup.upsert({
      userId: line_user.userId,
      groupId: source.groupId
    });
  }

  return Promise.resolve(null);
}

export async function findOneUser(source: line.Group) {
  return await database.User.findOne({
    where: { id: source.userId }
  });
}
