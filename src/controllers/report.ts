import Koa from "koa";
import {
  getLatestGameByGroup,
  findGameWithMembers
} from "../modules/gameHelper";
export default async function report(ctx: Koa.Context) {
  const latestGame = await getLatestGameByGroup(
    "Cce9702dfcdf2824f50f89fd9054546c0"
  );

  if (!latestGame) {
    return (ctx.body = "");
  }

  const game = await findGameWithMembers(latestGame);

  await ctx.render("index", {users: game.users});
}
