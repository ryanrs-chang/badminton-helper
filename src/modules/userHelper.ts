import * as line from "@line/bot-sdk";
import database from "../database";
import { UserType, LINE_VERIFY_USER_ID, Status } from "../config";
import Debug from "debug";
import { UserInstance } from "../models/user";
import { GameInstance } from "../models/game";
const debug = Debug("badminton:userHelper");

/**
 * get User by Group
 * @param client
 * @param source
 */
export async function updateUserInMessageEvent(
  client: line.Client,
  event: line.MessageEvent
): Promise<void> {
  let line_user: line.Profile;
  let source: line.Group | line.User = event.source as any;

  if (source.type === "user") {
    /*

        when chat with single user

     */
    if (source.userId === LINE_VERIFY_USER_ID) return;

    line_user = await client.getProfile(source.userId);
    await database.User.upsert({
      id: line_user.userId,
      display_name: line_user.displayName,
      picture_url: line_user.pictureUrl,
      type: UserType.Line
    });
  } else if (source.type === "group") {
    /*

        when chatbot in group

    */
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
}

export async function updateGroupUserInJoin(
  client: line.Client,
  event: line.MemberJoinEvent
): Promise<void> {
  if (event.source.type !== "group") {
    return;
  }

  const members: line.User[] = event.joined.members.filter(
    member => member.type === "user"
  );

  const groupId = event.source.groupId;
  const userProfile: line.Profile[] = await Promise.all(
    members.map(member => client.getGroupMemberProfile(groupId, member.userId))
  );

  const users: boolean[] = await Promise.all(
    userProfile.map(profile =>
      database.User.upsert({
        id: profile.userId,
        display_name: profile.displayName,
        picture_url: profile.pictureUrl,
        type: UserType.Line
      })
    )
  );

  return Promise.resolve(null);
}

export async function findOneUser(source: line.Group) {
  return database.User.findOne({
    where: { id: source.userId }
  });
}

export async function registerUnknownUser(user: string) {
  return database.User.create({
    display_name: user,
    type: UserType.Unknown
  });
}

/**
 *
 * @param display_name user display name
 * @param gameId
 */
export async function findOneUserByNameInGame(
  display_name: string,
  game: GameInstance
): Promise<UserInstance> {
  //
  // workaround: should use query by 'include'
  //

  const users = await database.User.findAll({
    where: { display_name, type: UserType.Unknown }
  });
  if (users.length === 0) {
    return Promise.resolve(null);
  }

  let userGames = await Promise.all(
    users.map(user =>
      database.UserGame.findOne({
        where: {
          gameId: game.id,
          userId: user.id,
          status: { $ne: Status.Deleted }
        }
      })
    )
  );

  userGames = userGames.filter(userGame => userGame !== null);
  if (userGames.length !== 1) {
    debug("userGames: ", userGames);
    return Promise.resolve(null);
  }
  const userGame = userGames.pop();

  return await database.User.findOne({ where: { id: userGame.userId } });
}
