import * as line from "@line/bot-sdk";
import { TextEventMessage } from "@line/bot-sdk";
import database from "../../database";

export default async function createGame(
  client: line.Client,
  event: line.WebhookEvent & line.MessageEvent
): Promise<line.MessageAPIResponseBase> {
  const model = await database.Game.create({
    description: "開心打羽球",
    groupId: "Cce9702dfcdf2824f50f89fd9054546c0"
  });

  let message = "create failed!";
  if (model) {
    message = `create ${model.description} game is successful`;
  }

  return await client.replyMessage(event.replyToken, {
    type: "text",
    text: message
  } as TextEventMessage);
}
