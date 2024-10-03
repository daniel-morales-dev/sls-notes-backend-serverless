import { handlerPath } from "@libs/handler-resolver";
console.log(`${handlerPath(__dirname)}/handler.main`);
export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      httpApi: {
        method: "post",
        path: "/hello",
      },
    },
  ],
};
