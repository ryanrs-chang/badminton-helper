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

  const message = event.message.text;
  if (
    /[-\+]1$/g.test(message) ||
    /^本週零打開始報名/g.test(message) ||
    /^本週零打報名結束/g.test(message) ||
    /^\#.*.[\+\-]1$/g.test(message) // helo another people signup
  ) {
    return true;
  }

  return false;
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

  if (!userGroup) {
    return false;
  }

  return userGroup.role >= Role.Manager;
}
