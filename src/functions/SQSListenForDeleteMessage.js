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
const TABLE_NAME = "PeopleTest";
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!event.Records || event.Records.length === 0) {
            console.log('No messages in the event.');
            return;
        }
        for (const message of event.Records) {
            const { body } = message;
            const messageToJson = JSON.parse(body);
            // access data key for payload
            const messagePayload = messageToJson.data;
            yield deleteFromDynamo(messagePayload.personId, TABLE_NAME);
            const response = {
                statusCode: 200,
                body: JSON.stringify({ message: `Item number ${messagePayload.personId} has been deleted`, body }),
            };
            return response;
        }
    }
    catch (error) {
        console.error('Error processing SQS event:', error);
    }
});
exports.handler = handler;
// DELETE PERSON
function deleteFromDynamo(personId, tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            TableName: tableName,
            Key: {
                personId: personId,
            },
        };
        const command = new lib_dynamodb_1.DeleteCommand(params);
        yield dynamoClient.send(command);
        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: `person with id ${personId} deleted` }),
        };
        return response;
    });
}
