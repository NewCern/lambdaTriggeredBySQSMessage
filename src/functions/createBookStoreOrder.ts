import { APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});

// Create an object to export with key value pairs
// some of these key value pairs will be functions
const dynamo = {
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

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
    try {
        const body = JSON.parse(event.body);
        const data = {
            ...body,
            orderId: uuid(),
            // to make search feature more usable, add upperCase attribute
            // emailAddressToUpperCase: body.address.toUpperCase(),
        };

        console.log("THIS IS THE ORDER BODY: ", data);
        // call write function from Library
        await dynamo.write(data, "Orders");

        const response: APIGatewayProxyResult = {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
              'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({ message: 'Order has been created' })
          };
          return response;

    } catch(error){
        console.error('Unable to add item. Error JSON:', JSON.stringify(error, null, 2));
        const response: APIGatewayProxyResult = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
          },
          body: JSON.stringify({ message: 'Unable to add order' })
        };
        return response;
    }
};