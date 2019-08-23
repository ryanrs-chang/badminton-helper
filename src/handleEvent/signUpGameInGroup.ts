import * as line from "@line/bot-sdk";
import { TextEventMessage } from "@line/bot-sdk";
import database from "../database";
import { Role } from "../config";
import { findOneUser } from "../modules/userHelper";
import { updateGroup } from "../modules/groupHelper";
import { getMessage } from "../utils";
import {
  getLatestGameByGroup,
  addUserToGame,
  removeUserFromsGame
} from "../modules/gameHelper";
import { client } from "./index";

function replyMessage(event: line.MessageEvent, text: string) {
  const echo: TextEventMessage = {
    type: "text",
    text
  } as TextEventMessage;
  client.replyMessage(event.replyToken, echo);
}

export default async function signUpGameInGroup(
  client: line.Client,
  event: line.WebhookEvent
): Promise<void> {
  if (event.source.type !== "group") {
    return Promise.resolve(null);
  }
  const groupSource: line.Group = event.source;

  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  ////
  //// prepaer group and user info
  await updateGroup(groupSource.groupId);

  // find user and get profile
  const user = await findOneUser(client, event.source);

  const { groupId, userId } = groupSource;
  // register user to group
  const UserGroup = await database.UserGroup.upsert(
    { groupId, userId, role: Role.User },
    { returning: true }
  );
  ////
  ////

  // Manage user join to Game
  const lastestGame = await getLatestGameByGroup(groupId);
  if (!lastestGame) {
    return replyMessage(event, `latest game not found`);
  }
  let game;
  switch (getMessage(event)) {
    case "+1":
      game = await addUserToGame(user, lastestGame);
      console.log(`${user.display_name} order successful!`);
      break;
    case "-1":
      game = await removeUserFromsGame(user, lastestGame);
      console.log(`${user.display_name}'s order cancelled.`);
      break;
  }
  const users = game.users.map(
    (user, index) => `${index + 1}.${user.display_name}\n`
  );
  const message = users.length > 0 ? `${users}` : "Empty";

  return replyMessage(event, message);
}
