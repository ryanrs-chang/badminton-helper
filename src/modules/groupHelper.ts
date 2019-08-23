import * as line from "@line/bot-sdk";
import database from "../database";
import { GroupInstance } from "../models/group";

export async function updateGroup(groupId: string): Promise<GroupInstance> {
  if (!groupId) {
    return Promise.reject("group id not found");
  }

  const [record, created] = await database.Group.upsert(
    { id: groupId },
    { returning: true }
  );
  return record;
}
