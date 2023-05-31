import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyResult } from "aws-lambda";

const dynamoDB = new DynamoDB.DocumentClient();
const TABLE_NAME = "PeopleTest";

interface User {
  firstName: string;
  lastName: string;
  address: string;
}

export const handler = async (): Promise<any> => { 
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    // GET request
    const data = await dynamoDB.scan(params).promise();
    const users = data.Items as User[];
    const response: APIGatewayProxyResult = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'OPTIONS,GET'
        },
        body: JSON.stringify(users),
      };
      return response;
  } catch (error) {
    return { 
        statusCode: 500, 
        body: JSON.stringify(`Error getting users from DynamoDB: ${error}`) 
    };
  }
};