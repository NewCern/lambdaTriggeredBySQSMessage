import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});

// Create an object to export with key value pairs
// some of these key value pairs will be functions
export const dynamo = {
    write: async (data: Record<string, any>, tableName: string) => {
        const params: PutCommandInput = {
            TableName: tableName,
            Item: data,
        };
        // pass to database input
        const command = new PutCommand(params);
        // send input command
        await dynamoClient.send(command);
        return data;
    }
};