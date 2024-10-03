import { getResponseHeaders } from "src/utils/getResponseHeaders";

export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 200,
    body: JSON.stringify(response),
    headers: getResponseHeaders(),
  };
};
