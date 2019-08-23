import * as line from "@line/bot-sdk";
import database from "../database";
import { UserInstance } from "../models/user";

/**
 * get User by Group
 * @param client
 * @param source
 */
export async function findOneUser(
  client: line.Client,
  source: line.EventSource
): Promise<UserInstance> {
  let user = await database.User.findOne({
    where: { id: source.userId }
  });
  if (!user) {
    const line_user = await client.getProfile(source.userId);
    const [record, created] = await database.User.upsert(
      {
        id: line_user.userId,
        display_name: line_user.displayName,
        picture_url: line_user.pictureUrl
      },
      { returning: true }
    );
    user = record;
  }

  return user;
}
