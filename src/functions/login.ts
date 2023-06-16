import { APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from 'aws-sdk';

const dynamoClient = new DynamoDBClient({});
const dynamoDB = new DynamoDB.DocumentClient();


const TABLE_NAME = 'Customers';

interface Customer {
        emailAddress: string,
        password: string,
        firstName: string,
        lastName: string,
        areaCode: string,
        phoneNumber: string,
        address: string,
        apt: string,
        city: string,
        state: string,
        zip: string,
    }

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
    try {
        const eventBody = JSON.stringify(event);
        const body = JSON.parse(eventBody);
        const { emailAddress, password } = body;

        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'contains(emailAddressUpperCase, :emailAddress)',
            ExpressionAttributeValues: {
                ':emailAddress': emailAddress.toUpperCase()
            }
        };

        // search database of existance of email
        const data = await dynamoDB.scan(params).promise();
        const customers = data.Items as Customer[];

        const match = customers.find(customer => customer.emailAddress === emailAddress && customer.password === password);
        if(match){
          const response: APIGatewayProxyResult = {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
              'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            // body: JSON.stringify({ message: 'User Succesfully created', statusCode: 200, customers })
            body: JSON.stringify({ success: true, statusCode: 200, user: match })
          };
          return response;
        }
        const response: APIGatewayProxyResult = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
          },
          // body: JSON.stringify({ message: 'User Succesfully created', statusCode: 200, customers })
          body: JSON.stringify({ success: false, statuscode: 403 })
        };
        return response;
    } catch(error){
        console.error('Unable to add customer. Error JSON:', JSON.stringify(error, null, 2));
        const response: APIGatewayProxyResult = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
          },
          body: JSON.stringify( error )
        };
        return response;
    }
};
