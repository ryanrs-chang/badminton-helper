import line from "@line/bot-sdk";
export function getMessage(event: line.WebhookEvent) {
  if (event.type === "message" && event.message.type === "text") {
    return event.message.text;
  }

  return null;
}
