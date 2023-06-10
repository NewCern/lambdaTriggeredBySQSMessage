import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

const dynamoDB = new DynamoDB.DocumentClient();
const TABLE_NAME = 'books';

interface Book {
  by: string,
  title: string,
  publicationDate: string,
  format: string,
  category: string,
  trimSize: string,
  isbn: string,
  price: string,
  // details: string,
  imageUrl: string
}

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
  try {
    const eventBody = JSON.stringify(event);
    const body = JSON.parse(eventBody);
    const keyword = body.search;

    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'contains(byUpperCase, :keyword) OR contains(titleUpperCase, :keyword) OR contains(publicationDateUpperCase, :keyword) OR contains(formatUpperCase, :keyword) OR contains(categoryUpperCase, :keyword) OR contains(trimSizeUpperCase, :keyword) OR contains(isbnUpperCase, :keyword) OR contains(priceUpperCase, :keyword) OR contains(imageUrlUpperCase, :keyword)',
      ExpressionAttributeValues: {
        ':keyword': keyword.toUpperCase()
      }
    };

    const data = await dynamoDB.scan(params).promise();
    const books = data.Items as Book[];

    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(books)
    };
    return response;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(`Error getting books from DynamoDB: ${error}`),
    };
  }
};
