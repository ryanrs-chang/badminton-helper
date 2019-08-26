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
app.use(async function(ctx, next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`response time: ${ms}ms`);
  ctx.set("X-Response-Time", `${ms}ms`);
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

router.post("/callback", LineMiddleware(config), async ctx => {
  try {
    ctx.body = await handleEvent(ctx.request.body.events);
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
