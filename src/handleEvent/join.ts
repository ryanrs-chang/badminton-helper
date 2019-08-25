import * as line from "@line/bot-sdk";
import joinGroup from "./controller/joinGroup";
/**
 * when robot join to group
 */
export default async function handleJoin(
  client: line.Client,
  event: line.JoinEvent
) {
  await joinGroup(client, event);
}
