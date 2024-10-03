import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getResponseHeaders } from "src/utils/getResponseHeaders";
import { getUserId } from "src/utils/getUserId";

/*
  Route: DELETE /notes/{timestamp}
*/
const client = new DynamoDBClient({
  region: "us-east-1",
});
const TABLE_NAME = process.env.NOTES_TABLE;

const deleteNote = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const timestamp = decodeURIComponent(event.pathParameters.timestamp);

    const params: DeleteItemCommandInput = {
      TableName: TABLE_NAME,
      Key: {
        userId: {
          S: getUserId(event.headers),
        },
        timestamp: {
          N: timestamp,
        },
      },
    };

    const command = new DeleteItemCommand(params);
    await client.send(command);

    return formatJSONResponse({
      message: "Tarea eliminada satisfactoriamente",
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

export const main = deleteNote;
