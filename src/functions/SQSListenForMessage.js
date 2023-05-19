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
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Process each SQS record in the event
        for (const record of event.Records) {
            // Retrieve the message body
            const { body } = record;
            // Logic to seperate .xml to individual files will go here
            // Delete the message from the queue
            //   await deleteMessage(record);
        }
    }
    catch (error) {
        console.error('Error processing SQS messages:', error);
        throw error;
    }
});
exports.handler = handler;
function deleteMessage(record) {
    return __awaiter(this, void 0, void 0, function* () {
        const { receiptHandle } = record;
        const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/xml-file-added-to-queue";
        const sqs = new aws_sdk_1.SQS();
        const params = {
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle,
        };
        try {
            yield sqs.deleteMessage(params).promise();
            console.log('Deleted SQS message:', record.messageId);
        }
        catch (error) {
            console.error('Error deleting SQS message:', error);
            throw error;
        }
    });
}
