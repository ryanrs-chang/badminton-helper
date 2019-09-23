import Context from "koa-line-message-router/dist/lib/context";
import { isCreateGameByManager } from "../utils/assertMessage";
import { CreateGameMessage } from "../modules/messageTemplate";
import { createNewGame } from "../modules/gameHelper";

export default async function gameCreate(ctx: Context) {
  const parsed_group_id = ctx.text.replace("game_create: ", "").trim();
  const valid = await isCreateGameByManager(ctx.event, parsed_group_id);
  if (valid) {
    const game = await createNewGame(parsed_group_id, {
      description: "打球！",
      groupId: parsed_group_id
    });
    ctx.$replyMessage(CreateGameMessage(game));
  }
}
