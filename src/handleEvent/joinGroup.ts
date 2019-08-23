import * as line from "@line/bot-sdk";
import { TextEventMessage } from "@line/bot-sdk";
import database from "../database";

export default async function joinGroup(
  client: line.Client,
  event: line.EventBase
): Promise<void> {
  const source: line.Group = event.source as line.Group;
  const result = await database.Group.upsert({
    id: source.groupId
  });

  return Promise.resolve(null);
}
