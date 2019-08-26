import * as line from "@line/bot-sdk";
import * as qs from "qs";
import { getGameList } from "../modules/gameHelper";
import { getManageGroups } from "../modules/groupHelper";
import { GroupsMessage } from "../modules/messageTemplate";
/**
 * when robot join to group
 */
export default async function handlePostback(
  client: line.Client,
  event: line.PostbackEvent
) {
  if (event.source.type === "user") {
    const data = qs.parse(event.postback.data);
    if (data.action === "group_list") {
      const groups = await getManageGroups(event.source.userId);
      return client.replyMessage(event.replyToken, GroupsMessage(groups));
    }
  }
}
