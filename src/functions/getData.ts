import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyResult } from "aws-lambda";

const dynamoDB = new DynamoDB.DocumentClient();
const TABLE_NAME = "books";

interface Book {
  by: string,
  title: string,
  publicationDate: string,
  format: string,
  category: string,
  trimSize: string,
  isbn: string,
  price: string,
  imageUrl: string
}

export const handler = async (): Promise<any> => { 
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    // GET request
    const data = await dynamoDB.scan(params).promise();
    const books = data.Items as Book[];
    
    const response: APIGatewayProxyResult = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'OPTIONS,GET'
        },
        body: JSON.stringify(books),
      };
      return response;
  } catch (error) {
    return { 
        statusCode: 500, 
        body: JSON.stringify(`Error getting books from DynamoDB: ${error}`) 
    };
  }
};