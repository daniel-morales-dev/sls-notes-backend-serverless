import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/client-dynamodb";
import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { flattenDynamoDBItem } from "src/utils/flattenedDynamoDbItem";
import { getResponseHeaders } from "src/utils/getResponseHeaders";

/*
  Route: GET /notes/{noteId}
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

    const params: QueryCommandInput = {
      TableName: TABLE_NAME,
      IndexName: "noteId-index",
      KeyConditionExpression: "noteId = :nid", // Suponiendo que también estás guardando userId
      ExpressionAttributeValues: {
        ":nid": { S: noteId },
      },
    };

    const command = new QueryCommand(params);
    const response = await client.send(command);

    if (!response.Items || !response.Items.length) {
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
      ...flattenDynamoDBItem(response.Items[0]),
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
