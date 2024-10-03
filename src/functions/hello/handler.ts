import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

const hello = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const { name } = JSON.parse(event.body);
  return formatJSONResponse({
    message: `Hello ${name} welcome to the exciting Serverless world!`,
  });
};

export const main = hello;
