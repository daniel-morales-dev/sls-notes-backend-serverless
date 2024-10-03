import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getResponseHeaders } from "src/utils/getResponseHeaders";
import { getUserId } from "src/utils/getUserId";

/*
  Route: GET /notes
*/
const client = new DynamoDBClient({
  region: "us-east-1",
});
const TABLE_NAME = process.env.NOTES_TABLE;

const getExclusiveStartKey = (query, userId) => {
  const startTimeStamp = Number(query.start);
  if (startTimeStamp > 0) {
    return {
      userId: { S: userId },
      timestamp: { N: String(startTimeStamp) },
    };
  }
  return undefined;
};

const updateNote = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const query = event.queryStringParameters;
    const limit = Math.min(Number(query.limit) || 5, 50);
    const userId = getUserId(event.headers);

    if (!userId) {
      return {
        statusCode: 400,
        headers: getResponseHeaders(),
        body: JSON.stringify({ error: "El user id es requerido." }),
      };
    }

    const params: QueryCommandInput = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": userId,
      },
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey: getExclusiveStartKey(query, userId),
    };

    const command = new QueryCommand(params);
    const response = await client.send(command);

    return formatJSONResponse({
      items: response.Items || [],
      totalItems: response.Count || 0,
    });
  } catch (error) {
    console.error("Error", error);
    return {
      statusCode: 400,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        error: error.name || "Exception",
        message: error.message || "Unknown Error",
        details: error.details || null,
      }),
    };
  }
};

export const main = updateNote;
