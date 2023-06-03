import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

const dynamoDB = new DynamoDB.DocumentClient();
const TABLE_NAME = 'PeopleTest';

interface User {
  personId: string;
  firstName: string;
  lastName: string;
  address: string;
}

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
  try {
    const eventBody = JSON.stringify(event);
    const body = JSON.parse(eventBody);
    const keyword = body.search;

    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'contains(firstNameUpperCase, :keyword) OR contains(lastNameUpperCase, :keyword) OR contains(addressUpperCase, :keyword)',
      ExpressionAttributeValues: {
        ':keyword': keyword.toUpperCase()
      }
    };

    const data = await dynamoDB.scan(params).promise();
    const users = data.Items as User[];

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(users)
    };
    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(`Error getting users from DynamoDB: ${error}`),
    };
  }
};
