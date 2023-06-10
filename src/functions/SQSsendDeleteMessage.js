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
const client_sqs_1 = require("@aws-sdk/client-sqs");
const sqs = new client_sqs_1.SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/bookstore-delete-data-object-queue";
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = JSON.parse(event.body);
        console.log("Here is the body: ", body);
        // configure SQS message equiped with xml data
        const message = {
            event: 'Send delete Message To Queue',
            key: body.personId,
            data: body,
        };
        // configure parameters to send to SQS
        const command = new client_sqs_1.SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(message),
        });
        // send to SQS
        yield sqs.send(command);
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({ message: 'data sent to message', body })
        };
        return response;
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'An error occurred' }),
        };
    }
});
exports.handler = handler;
