import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

const dynamoClient = new DynamoDBClient({});
const TABLE_NAME = "Customers";

export const handler = async (event: APIGatewayProxyResult): Promise<any> => {
  try {
      const parsedEvent = JSON.stringify(event);
      const eventBody = JSON.parse(parsedEvent);
      const {customerId, ...rest } = eventBody.body;

      const response: APIGatewayProxyResult = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ customerId: customerId, rest: rest})
      };
      return response;
  } catch (error) {
    console.error('Error processing SQS event:', error);
  }
}

// UPDATE PERSON
async function updateInDynamo(person: Record<string, any>, tableName: string): Promise<any> {
    const { personId, ...updateData } = person; 
    const params: UpdateCommandInput = {
      TableName: tableName,
      Key: {
        personId: personId,
      },
      UpdateExpression: "SET #firstName = :firstNameValue, #lastName = :lastNameValue, #address = :addressValue",
      ExpressionAttributeNames: {
        "#firstName": "firstName",
        "#lastName": "lastName",
        "#address": "address",
      },
      ExpressionAttributeValues: {
        ":firstNameValue": updateData.firstName,
        ":lastNameValue": updateData.lastName,
        ":addressValue": updateData.address,
      },
    };
    const command = new UpdateCommand(params);
    await dynamoClient.send(command);
    return person;
  }

