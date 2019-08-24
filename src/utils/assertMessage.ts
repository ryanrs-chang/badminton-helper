import line from "@line/bot-sdk";
import database from "../database";
import { Role } from "../config";

export function isSignUpInGroup(event: line.WebhookEvent): boolean | string {
  if (!event) return false;

  if (event.source.type !== "group") {
    return false;
  }

  if (event.type !== "message" || event.message.type !== "text") {
    return false;
  }

  // const ret = /[-\+]1$/g.test(event.message.text);
  const message = event.message.text;
  return message === "+1" || message === "-1";
}

export async function isCreateGameByManager(
  event: line.WebhookEvent,
  groupId: string
): Promise<boolean | string> {
  if (!event) return false;

  if (event.source.type !== "user") {
    return false;
  }

  if (event.type !== "message" || event.message.type !== "text") {
    return false;
  }

  const userGroup = await database.UserGroup.findOne({
    where: { userId: event.source.userId, groupId }
  });


  console.log("asdfasdf")
  if (!userGroup) {
    return false;
  }

  console.log("asdfasdf111111111111111")

  return userGroup.role >= Role.Manager;
}
