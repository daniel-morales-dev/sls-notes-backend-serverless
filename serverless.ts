import type { AWS } from "@serverless/typescript";

import hello from "@functions/hello";

const serverlessConfiguration: AWS = {
  service: "sls-notes-backend",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-offline"],
  provider: {
    name: "aws",
    runtime: "nodejs20.x",
    region: "us-east-1",
    httpApi: {
      payload: "2.0",
      cors: true,
    },
    stage: "prod",
    memorySize: 128,
    timeout: 5,
    endpointType: "regional",
    environment: {
      NOTES_TABLE: "${self:service}-${opt:stage,self:provider.stage}",
    },
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
  functions: { hello },
  package: { individually: true },
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
};

module.exports = serverlessConfiguration;
