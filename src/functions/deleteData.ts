import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
// const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);

// Create an object to export with key value pairs
// some of these key value pairs will be functions
const dynamo = {
    delete: async (tableName: string, id: string) => {
        const params: DeleteCommandInput = {
            TableName: tableName,
            Key: { 
                personId: id,
            }
        };
        // pass delete command to the database
        const command = new DeleteCommand(params);
        // send delete command
        const data = await dynamoClient.send(command);
        return data;
    }
};

export const handler = async (event: any): Promise<any> => {
    try {
        const personId = event.pathParameters.id;
        console.log("Path PathParameters", personId)
        console.log("Here is the event on delete: event ", event.pathParameters.id)
        // call delete function 
        await dynamo.delete("PeopleTest", personId);
        const response: APIGatewayProxyResult = {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
              'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
            },
            body: JSON.stringify({ message: 'Data has been deleted' })
          };
          return response;
    } catch(error){
        console.error('Unable to add item. Error JSON:', JSON.stringify(error, null, 2));
        const response: APIGatewayProxyResult = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,DELETE'
          },
          body: JSON.stringify({ message: 'Unable to delete item' })
        };
        return response;
    }
};