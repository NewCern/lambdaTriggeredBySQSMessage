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
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
// Create an object to export with key value pairs
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
        const body = JSON.parse(event.body);
        const data = Object.assign(Object.assign({}, body), { 
            // to make search feature more usable, add upperCase attribute
            addressUpperCase: body.address.toUpperCase(), lastNameUpperCase: body.lastName.toUpperCase(), firstNameUpperCase: body.firstName.toUpperCase(), personId: (0, uuid_1.v4)() });
        // call write function from Library
        yield dynamo.write(data, "PeopleTest");
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({ message: 'Data has been created' })
        };
        return response;
    }
    catch (error) {
        console.error('Unable to add item. Error JSON:', JSON.stringify(error, null, 2));
        const response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({ message: 'Unable to add item' })
        };
        return response;
    }
});
exports.handler = handler;
