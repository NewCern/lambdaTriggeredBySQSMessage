"use strict";
// import { DynamoDB } from 'aws-sdk';
// import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const aws_sdk_1 = require("aws-sdk");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const dynamoDB = new aws_sdk_1.DynamoDB.DocumentClient();
const TABLE_NAME = 'Customers';
// Create an object to export with key value pa
// some of these key value pairs will be functions
// const dynamo = {
//     write: async (data: Record<string, any>, tableName: string) => {
//         const params: PutCommandInput = {
//             TableName: tableName,
//             Item: data,
//         };
//         // pass to database input
//         const command = new PutCommand(params);
//         // send input command
//         await dynamoClient.send(command);
//         return data;
//     }
// };
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const bcryptTest = bcrypt.hashSync('ThisIsPlainTest', 10);
        // console.log("This is the incrypted word: ", bcryptTest);
        // const body = JSON.parse(event.body);
        // const keyword = body.emailAddress;
        const eventBody = JSON.stringify(event);
        const body = JSON.parse(eventBody);
        const keyword = body.emailAddress;
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'contains(emailAddressUpperCase, :keyword)',
            ExpressionAttributeValues: {
                ':keyword': keyword.toUpperCase()
            }
        };
        // search database of existance of email
        const data = yield dynamoDB.scan(params).promise();
        const customers = data.Items;
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            // body: JSON.stringify({ message: 'User Succesfully created', statusCode: 200, customers })
            body: JSON.stringify(customers)
        };
        return response;
    }
    catch (error) {
        console.error('Unable to add customer. Error JSON:', JSON.stringify(error, null, 2));
        const response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify(error)
        };
        return response;
    }
});
exports.handler = handler;
