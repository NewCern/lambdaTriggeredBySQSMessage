"use strict";
// import { SQSEvent, SQSRecord } from 'aws-lambda';
// import { SQSHandler } from 'aws-lambda/trigger/sqs';
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
// import { parseString } from 'xml2js';
// import { SQS } from 'aws-sdk';
// import fs from 'fs';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const xml2js = __importStar(require("xml2js"));
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// Configure AWS SDK
// AWS.config.update({
//   region: 'us-east-1',
//   accessKeyId: 'AKIATM3VCDC4T72JPFTL',
//   secretAccessKey: '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',
// });
// const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
// async function processSQSEvent(event: AWS.SQS.Types.ReceiveMessageResult): Promise<void> {
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const messages = event.Messages;
        // if (!messages || messages.length === 0) {
        if (!event.Records || event.Records.length === 0) {
            console.log('No messages in the event.');
            return;
        }
        // for (const message of messages) {
        for (const message of event.Records) {
            // const xmlPayload = message.Body;
            const { body } = message;
            // console.log("below Message Body: ", body);
            const messageToJson = JSON.parse(body);
            // console.log("This is a string convered to json: ", messageToJson);
            const messagePayload = messageToJson.key;
            // console.log("This is the message payload: ", messagePayload);
            const messagePayloadToBuffer = Buffer.from(messagePayload);
            console.log("Message payload to buffer: ", messagePayloadToBuffer);
            const messageBufferToString = messagePayloadToBuffer.toString();
            const bufferToStringNoWhitespace = messageBufferToString.replace(/\s/g, '');
            console.log("Buffer To String: ", bufferToStringNoWhitespace);
            const persons = yield parseXML(bufferToStringNoWhitespace);
            console.log("Below persons: ", persons);
            for (const person of persons) {
                yield insertPersonToDynamoDB(person);
            }
            // Delete the processed message from the SQS queue
            // await deleteSQSMessage(message.ReceiptHandle);
            // console.log('Processed and deleted a message from the SQS queue.');
        }
    }
    catch (error) {
        console.error('Error processing SQS event:', error);
    }
});
exports.handler = handler;
function parseXML(xmlPayload) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const parsedData = yield xml2js.parseStringPromise(xmlPayload, { explicitArray: false });
            console.log("Below parsedData in parseXML: ", parsedData);
            const persons = parsedData.records.record.map((record) => ({
                firstName: record.firstName,
                lastName: record.lastName,
                address: record.address,
            }));
            console.log("Below persons in parseXML function: ", parsedData);
            return persons;
        }
        catch (error) {
            console.error('Error parsing XML:', error);
            return [];
        }
    });
}
function insertPersonToDynamoDB(person) {
    return __awaiter(this, void 0, void 0, function* () {
        // const params = {
        //   TableName: 'PeopleTest',
        //   Item: person,
        // };
        const params = {
            TableName: 'PeopleTest',
            Item: person,
        };
        const command = new lib_dynamodb_1.PutCommand(params);
        // try {
        // await dynamoDB.put(params).promise();
        yield dynamoClient.send(command);
        console.log(`Inserted record: ${JSON.stringify(person)}`);
        // } catch (error) {
        //   console.error(`Error inserting record: ${JSON.stringify(person)}`, error);
        // }
    });
}
// async function deleteSQSMessage(receiptHandle: string): Promise<void> {
//   const params = {
//     QueueUrl: 'YourSQSQueueUrl',
//     ReceiptHandle: receiptHandle,
//   };
//   try {
//     await new AWS.SQS().deleteMessage(params).promise();
//   } catch (error) {
//     console.error(`Error deleting message: ${receiptHandle}`, error);
//   }
// }
// Usage within Lambda handler
// export const handler = async (event: SQSEvent): Promise<void> => {
//   await processSQSEvent(event).catch(console.error);
// };
