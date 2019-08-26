import * as line from "@line/bot-sdk";
import database from "../database";
import { UserType } from "../config";
import Debug from "debug";
import { UserInstance } from "../models/user";
const debug = Debug("badminton:hadnlerEvent");

// {
//   "replyToken": "0f3779fba3b349968c5d07db31eabf65",
//   "type": "memberJoined",
//   "timestamp": 1462629479859,
//   "source": {
//     "type": "group",
//     "groupId": "C4af4980629..."
//   },
//   "joined": {
//     "members": [
//       {
//        "type": "user",
//         "userId": "U4af4980629..."
//       },
//       {
//         "type": "user",
//         "userId": "U91eeaf62d9..."
//       }
//     ]
//   }
// }

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
  return await database.User.findOne({
    where: { id: source.userId }
  });
}
