import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getResponseHeaders } from "src/utils/getResponseHeaders";

/*
  Route: GET /notes/{noteId}/${timestamp}
*/
const client = new DynamoDBClient({
  region: "us-east-1",
});
const TABLE_NAME = process.env.NOTES_TABLE;

const getNote = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const noteId = decodeURIComponent(event.pathParameters.noteId);
    const timestamp = decodeURIComponent(event.pathParameters.timestamp);

    const params: GetItemCommandInput = {
      TableName: TABLE_NAME,
      Key: {
        noteId: {
          S: noteId,
        },
        timestamp: {
          N: timestamp,
        },
      },
    };

    const command = new GetItemCommand(params);
    const response = await client.send(command);

    if (!response.Item) {
      return {
        statusCode: 400,
        headers: getResponseHeaders(),
        body: JSON.stringify({
          error: "NotFound",
          message: "No se han encontrado la nota.",
        }),
      };
    }

    return formatJSONResponse({
      ...response.Item,
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

export const main = getNote;
