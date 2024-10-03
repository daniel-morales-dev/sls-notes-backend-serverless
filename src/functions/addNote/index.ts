import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  description: "POST /note",
  events: [
    {
      httpApi: {
        method: "post",
        path: "/notes",
      },
    },
  ],
};
