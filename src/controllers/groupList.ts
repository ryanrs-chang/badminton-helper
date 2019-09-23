import Context from "koa-line-message-router/dist/lib/context";
import { getManageGroups } from "../modules/groupHelper";
import { GroupsMessage } from "../modules/messageTemplate";

export default async function groupList(ctx: Context) {
  const groups = await getManageGroups(ctx.event.source.userId);
  ctx.$replyMessage(GroupsMessage(groups));
}
