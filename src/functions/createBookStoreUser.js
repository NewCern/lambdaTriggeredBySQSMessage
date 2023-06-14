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
const uuid_1 = require("uuid");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const aws_sdk_1 = require("aws-sdk");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const dynamoDB = new aws_sdk_1.DynamoDB.DocumentClient();
const TABLE_NAME = 'Customers';
// Create an object to export with key value pa
// some of these key value pairs will be functions
const dynamo = {
    write: (data, tableName) => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            TableName: tableName,
            Item: data,
        };
        // pass to database input
        const command = new lib_dynamodb_1.PutCommand(params);
        // send input command
        yield dynamoClient.send(command);
        return data;
    })
};
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const bcryptTest = bcrypt.hashSync('ThisIsPlainTest', 10);
        // console.log("This is the incrypted word: ", bcryptTest);
        const body = JSON.parse(event.body);
        const keyword = body.emailAddress;
        const newUser = Object.assign(Object.assign({}, body), { 
            // to make search feature more usable, add upperCase attribute
            emailAddressUpperCase: body.emailAddress.toUpperCase(), firstNameUpperCase: body.firstName.toUpperCase(), lastNameUpperCase: body.lastName.toUpperCase(), addressUpperCase: body.address.toUpperCase(), aptUpperCase: body.apt.toUpperCase(), cityUpperCase: body.city.toUpperCase(), stateUpperCase: body.state.toUpperCase(), customerId: (0, uuid_1.v4)() });
        // create logic to check for duplicate email address before POST
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'contains(emailAddressUpperCase, :keyword)',
            ExpressionAttributeValues: {
                ':keyword': keyword.toUpperCase()
            }
        };
        // search database of existance of email
        const data = yield dynamoDB.scan(params).promise();
        const books = data.Items;
        // chech if any emails are returned
        if (books.length !== 0) {
            const response = {
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
        yield dynamo.write(newUser, "Customers");
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({ message: 'User Succesfully created', statusCode: 200, books })
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
