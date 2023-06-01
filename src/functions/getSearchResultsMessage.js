"use strict";
// import { DynamoDB } from 'aws-sdk';
// import { SQSEvent } from 'aws-lambda';
// import { SQSHandler } from 'aws-lambda/trigger/sqs';
// import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
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
const client_sqs_1 = require("@aws-sdk/client-sqs");
const sqs = new client_sqs_1.SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/search-results-objects-queue";
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // // Check if the request method is GET
        // if (event.httpMethod !== 'GET') {
        //   return {
        //     statusCode: 405,
        //     body: JSON.stringify('Method Not Allowed'),
        //   };
        // }
        // Perform SQS consumer logic
        const receiveMessageCommand = new client_sqs_1.ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: 1,
        });
        const { Messages } = yield sqs.send(receiveMessageCommand);
        // console.log("These Are the Messages: ", Messages)
        if (!Messages || Messages.length === 0) {
            return {
                statusCode: 204,
                body: JSON.stringify('No messages in the queue'),
            };
        }
        const message = Messages[0];
        console.log("This is Message[0]: ", message);
        const { Body: messageBody, ReceiptHandle } = message;
        // // // Process the message payload
        // const messageToJson = JSON.parse(messageBody || '{}');
        // const messagePayload = messageToJson.data;
        // const searchResults = messagePayload.Items || '{}';
        // // // Delete the processed message from the queue
        // const deleteMessageCommand = new DeleteMessageCommand({
        //   QueueUrl: queueUrl,
        //   ReceiptHandle,
        // });
        // await sqs.send(deleteMessageCommand);
        // Return the search results as an HTTP response
        const response = {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify("bodyParsed"),
        };
        return response;
    }
    catch (error) {
        console.error('Error processing SQS event:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Internal Server Error'),
        };
    }
});
exports.handler = handler;
