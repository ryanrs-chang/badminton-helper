import Context from "koa-line-message-router/dist/lib/context";
import { getGameList } from "../modules/gameHelper";
import { GamesMessage } from "../modules/messageTemplate";

export default async function gameList(ctx: Context) {
  const parsed_group_id = ctx.text.replace("game_list: ", "").trim();
  const games = await getGameList(parsed_group_id, ctx.event.source.userId);
  ctx.$replyMessage(GamesMessage(games));
}
