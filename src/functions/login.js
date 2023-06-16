"use strict";
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
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
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
        const data = yield dynamoDB.scan(params).promise();
        const customers = data.Items;
        const match = customers.find(customer => customer.emailAddress === emailAddress && customer.password === password);
        if (match) {
            const response = {
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
        const response = {
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
