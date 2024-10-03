import { getResponseHeaders } from "src/utils/getResponseHeaders";

export const formatJSONResponse = (
  response: Record<string, unknown>,
  statusCode: number = 200
) => {
  return {
    statusCode,
    body: JSON.stringify(response),
    headers: getResponseHeaders(),
  };
};
