import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, UpdateCommandInput, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
// const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);

// Create an object to export with key-value pairs
// some of these key-value pairs will be functions
const dynamo = {
  update: async (tableName: string, id: string, newData: any) => {
    const params: UpdateCommandInput = {
      TableName: tableName,
      Key: {
        personId: id,
      },
      UpdateExpression: 'SET #data = :newData',
      ExpressionAttributeNames: {
        '#data': 'data',
      },
      ExpressionAttributeValues: {
        ':newData': newData,
      },
    };
    // pass update command to the database
    const command = new UpdateCommand(params);
    // send update command
    const data = await dynamoClient.send(command);
    return data;
  },
};

export const handler = async (event: any): Promise<any> => {
  try {
    const personId = event.pathParameters.id;
    const newData = JSON.parse(event.body); // Assuming the new data is passed in the request body

    // call update function
    await dynamo.update("PeopleTest", personId, newData);
    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': '*',
        "Access-Control-Allow-Credentials": false
      },
      body: JSON.stringify(event.body)
    };
    return response;
  } catch (error) {
    console.error('Unable to update item. Error JSON:', JSON.stringify(error, null, 2));
    const response: APIGatewayProxyResult = {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,PUT' // Updated methods to include PUT
      },
      body: JSON.stringify({ message: 'Unable to update item' })
    };
    return response;
  }
};
