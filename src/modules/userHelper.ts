import * as line from "@line/bot-sdk";
import database from "../database";
import { UserType, LINE_VERIFY_USER_ID, Status } from "../config";
import { GameInstance } from "../models/game";

/**
 * get User by Group
 * @param client
 * @param source
 */
export async function updateUserWhenMessageEvent(
  client: line.Client,
  event: line.WebhookEvent
): Promise<void> {
  let lineUser: line.Profile;
  let source: line.Group | line.User = event.source as any;

  if (source.type === "user") {
    /*

        when chat with single user

     */
    if (source.userId === LINE_VERIFY_USER_ID) return;

    lineUser = await client.getProfile(source.userId);
    await database.User.upsert({
      id: lineUser.userId,
      displayName: lineUser.displayName,
      pictureUrl: lineUser.pictureUrl,
      type: UserType.Line
    });
  } else if (source.type === "group") {
    /*

        when chatbot in group

    */
    lineUser = await client.getGroupMemberProfile(
      source.groupId,
      source.userId
    );

    // update group and user
    await Promise.all([
      await database.User.upsert({
        id: lineUser.userId,
        displayName: lineUser.displayName,
        pictureUrl: lineUser.pictureUrl,
        type: UserType.Line
      }),
      await database.Group.upsert({
        id: source.groupId
      })
    ]);
    await database.UserGroup.upsert({
      userId: lineUser.userId,
      groupId: source.groupId
    });
  }
}

export async function updateGroupUserWhenJoin(
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
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        type: UserType.Line
      })
    )
  );

  return Promise.resolve(null);
}

/**
 * findOneUserBySource
 * @param source
 */
export async function findOneUserBySource(source: line.Group) {
  return database.User.findOne({
    where: { id: source.userId }
  });
}

export async function registerUnknownUser(user: string) {
  return database.User.create({
    displayName: user,
    type: UserType.Unknown
  });
}

/**
 * findOneUnknownUserByDisplayName
 * @param name user display name
 */
export async function findOneUnknownUserByDisplayNameInGame(
  name: string,
  game: GameInstance
) {
  const user = await database.User.findOne({
    where: { displayName: name, type: UserType.Unknown },
    include: [
      {
        model: database.Game,
        through: {
          where: {
            gameId: game.id,
            status: Status.Normal
          }
        },
        required: true
      }
    ]
  });
  return user;
}
