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
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
// const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);
// Create an object to export with key-value pairs
// some of these key-value pairs will be functions
const dynamo = {
    update: (tableName, id, newData) => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            TableName: tableName,
            Key: {
                personId: id,
            },
            UpdateExpression: 'SET #data = :newData',
            ExpressionAttributeNames: {
                '#data': 'data',
            },
            ExpressionAttributeValues: {
                ':newData': newData,
            },
        };
        // pass update command to the database
        const command = new lib_dynamodb_1.UpdateCommand(params);
        // send update command
        const data = yield dynamoClient.send(command);
        return data;
    }),
};
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const personId = event.pathParameters.id;
        const newData = JSON.parse(event.body); // Assuming the new data is passed in the request body
        // call update function
        yield dynamo.update("PeopleTest", personId, newData);
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': '*',
                "Access-Control-Allow-Credentials": false
            },
            body: JSON.stringify(event.body)
        };
        return response;
    }
    catch (error) {
        console.error('Unable to update item. Error JSON:', JSON.stringify(error, null, 2));
        const response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,PUT' // Updated methods to include PUT
            },
            body: JSON.stringify({ message: 'Unable to update item' })
        };
        return response;
    }
});
exports.handler = handler;
