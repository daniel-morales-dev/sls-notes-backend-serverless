import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { flattenDynamoDBItem } from "src/utils/flattenedDynamoDbItem";
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
  const startTimeStamp = Number(query?.start);
  if (!startTimeStamp) return undefined;
  if (startTimeStamp > 0) {
    return {
      userId: { S: userId },
      timestamp: { N: String(startTimeStamp) },
    };
  }
  return undefined;
};

const getNotes = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const query = event.queryStringParameters;
    const limit = Math.min(Number(query?.limit) || 5, 50);
    const userId = getUserId(event.headers);

    if (!userId) {
      return {
        statusCode: 400,
        headers: getResponseHeaders(),
        body: JSON.stringify({ error: "El user id es requerido." }),
      };
    }

    const exclusiveStartKey = getExclusiveStartKey(query, userId);

    const params: QueryCommandInput = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: userId },
      },
      Limit: limit,
      ScanIndexForward: false,
      ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
    };

    const command = new QueryCommand(params);
    const response = await client.send(command);

    const items = response.Items.map((item) => flattenDynamoDBItem(item));

    return formatJSONResponse({
      items: items || [],
      totalItems: response.Count || 0,
      next: response.LastEvaluatedKey
        ? flattenDynamoDBItem(response.LastEvaluatedKey)
        : null,
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

export const main = getNotes;
