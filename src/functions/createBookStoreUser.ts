import { APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from 'aws-sdk';
import bcrypt from 'bcrypt';

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


// Create an object to export with key value pa
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
        // const bcryptTest = bcrypt.hashSync('ThisIsPlainTest', 10);
        // console.log("This is the incrypted word: ", bcryptTest);
        const body = JSON.parse(event.body);
        const keyword = body.emailAddress;
        const newUser = {
            ...body,
            // to make search feature more usable, add upperCase attribute
            emailAddressUpperCase: body.emailAddress.toUpperCase(),
            firstNameUpperCase: body.firstName.toUpperCase(),
            lastNameUpperCase: body.lastName.toUpperCase(),
            addressUpperCase: body.address.toUpperCase(),
            aptUpperCase: body.apt.toUpperCase(),
            cityUpperCase: body.city.toUpperCase(),
            stateUpperCase: body.state.toUpperCase(),
            customerId: uuid()
        };
        // create logic to check for duplicate email address before POST
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'contains(emailAddressUpperCase, :keyword)',
            ExpressionAttributeValues: {
                ':keyword': keyword.toUpperCase()
            }
        };

        // search database of existance of email
        const data = await dynamoDB.scan(params).promise();
        const customers = data.Items as Customer[];

        // chech if any emails are returned
        if(customers.length !== 0) {
            const response: APIGatewayProxyResult = {
                statusCode: 200,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                  'Access-Control-Allow-Methods': 'OPTIONS,POST'
                },
                body: JSON.stringify({ message: `Email Already Exists for ${keyword}`, statusCode: 409 })
              };
              return response;
        }

        // else call write function from Library
        await dynamo.write(newUser, "Customers");
        const response: APIGatewayProxyResult = {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
              'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({ message: 'User Succesfully created', statusCode: 200, customers })
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