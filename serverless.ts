import type { AWS } from "@serverless/typescript";

import addNote from "@functions/addNote";
import updateNote from "@functions/updateNote";
import getNotes from "@functions/getNotes";
import getNote from "@functions/getNote";
import deleteNote from "@functions/deleteNote";

const serverlessConfiguration: AWS = {
  service: "sls-notes-backend",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline"],
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node20",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    region: "us-east-1",
    httpApi: {
      payload: "2.0",
      cors: {
        allowedOrigins: ["*"],
        allowedHeaders: [
          "Accept",
          "Content-Type",
          "Content-Length",
          "Authorization",
          "X-Amz-Date",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
          "X-Amzn-Trace-id",
          "X-Custom-Header",
          "app_user_id",
          "app_user_name",
        ],
        allowedMethods: ["GET", "POST", "PATCH", "DELETE"],
      },
    },
    stage: "prod",
    memorySize: 128,
    timeout: 5,
    endpointType: "regional",
    environment: {
      NOTES_TABLE: "${self:service}-${opt:stage,self:provider.stage}",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["dynamodb:Query", "dynamodb:PutItem", "dynamodb:DeleteItem"],
        Resource:
          "arn:aws:dynamodb:${opt:region,self:provider.region}:*:table/${self.provider.environment.NOTES_TABLE}",
      },
    ],
  },
  resources: {
    Resources: {
      NotesTable: {
        Type: "AWS::DynamoDB::Table",
        DeletionPolicy: "Retain",
        Properties: {
          TableName: "${self:provider.environment.NOTES_TABLE}",
          AttributeDefinitions: [
            {
              AttributeName: "userId",
              AttributeType: "S",
            },
            {
              AttributeName: "timestamp",
              AttributeType: "N",
            },
            {
              AttributeName: "noteId",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "userId",
              KeyType: "HASH",
            },
            {
              AttributeName: "timestamp",
              KeyType: "RANGE",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          GlobalSecondaryIndexes: [
            {
              IndexName: "noteId-index",
              KeySchema: [
                {
                  AttributeName: "noteId",
                  KeyType: "HASH",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
              },
            },
          ],
        },
      },
    },
  },
  functions: { addNote, updateNote, getNotes, getNote, deleteNote },
  package: { individually: true },
};

module.exports = serverlessConfiguration;
