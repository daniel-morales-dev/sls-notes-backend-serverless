import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { flattenDynamoDBItem } from "src/utils/flattenedDynamoDbItem";
import { getResponseHeaders } from "src/utils/getResponseHeaders";
import { getUserId } from "src/utils/getUserId";
import { getUserName } from "src/utils/getUserName";

/*
  Route: PATCH /note
*/
const client = new DynamoDBClient({
  region: "us-east-1",
});
const TABLE_NAME = process.env.NOTES_TABLE;

const updateNote = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(event.body);
    let item = body;
    item.userId = { S: getUserId(event.headers) };

    const now = Date.now();
    item = {
      ...item,
      userName: { S: getUserName(event.headers) },
      expires: { N: String(now + 90 * 24 * 60 * 60 * 1000) },
      title: { S: item.title },
      content: { S: item.content },
      category: { S: item.category },
      noteId: { S: item.noteId },
      timestamp: { N: String(item.timestamp) },
    };

    const input: PutItemCommandInput = {
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: "#t = :t",
      ExpressionAttributeNames: {
        "#t": "timestamp",
      },
      ExpressionAttributeValues: {
        ":t": item.timestamp,
      },
    };

    const command = new PutItemCommand(input);
    await client.send(command);

    return formatJSONResponse(flattenDynamoDBItem(item));
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
