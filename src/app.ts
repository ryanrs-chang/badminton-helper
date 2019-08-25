import dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import * as database from "./database";
import { channelAccessToken, channelSecret } from "./config";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import handleEvent from "./handleEvent";
import { LineMiddleware } from "./middleware";

const config = {
  channelAccessToken,
  channelSecret
};

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

router.post("/callback", LineMiddleware(config), async ctx => {
  try {
    ctx.body = await Promise.all(ctx.request.body.events.map(handleEvent));
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
});

router.get("/", async ctx => {
  ctx.body = "Line Robot";
});

async function start() {
  try {
    await database.init();
    app.context.$db = database;
    app.listen(process.env.PORT || 3000);
  } catch (error) {
    process.exit();
  }
}

start();
