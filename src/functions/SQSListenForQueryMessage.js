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
const aws_sdk_1 = require("aws-sdk");
const client_sqs_1 = require("@aws-sdk/client-sqs");
// this is the queue that the results message will be sent to.
const sqs = new client_sqs_1.SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/search-results-objects-queue";
const dynamoDB = new aws_sdk_1.DynamoDB.DocumentClient();
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
            // get keyword from message
            const keyword = messagePayload.search || '{}';
            const params = {
                TableName: TABLE_NAME,
                FilterExpression: 'contains(firstName, :keyword) OR contains(lastName, :keyword) OR contains(address, :keyword)',
                ExpressionAttributeValues: {
                    ':keyword': keyword
                }
            };
            // run the query
            const searchResults = yield dynamoDB.scan(params).promise();
            // create a message with searchResults
            const resultMessage = {
                event: 'Send result Message To Queue',
                key: 'Results',
                data: searchResults,
            };
            // configure parameters to send to SQS
            const command = new client_sqs_1.SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify(resultMessage),
            });
            // send message to queue
            yield sqs.send(command);
            console.log("These are the results: ", searchResults);
        }
    }
    catch (error) {
        console.error('Error processing SQS event:', error);
    }
});
exports.handler = handler;
