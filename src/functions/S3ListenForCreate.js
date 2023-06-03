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
const client_s3_1 = require("@aws-sdk/client-s3");
const sqs = new client_sqs_1.SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/xml-file-added-to-queue";
const s3 = new client_s3_1.S3Client({});
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Process the S3 create event
        const records = event.Records;
        for (const record of records) {
            if (record.eventName === 'ObjectCreated:Put') {
                const bucketName = record.s3.bucket.name;
                const objectKey = record.s3.object.key;
                // BELOW IS TEST OF HOW TO ACCESS BUCKET CONTENTS
                // Create query parameters to search S3 bucket
                const getObjectParams = new client_s3_1.GetObjectCommand({
                    Bucket: bucketName,
                    Key: objectKey,
                });
                // send get message command to S3 bucket
                const getData = yield s3.send(getObjectParams);
                // access the actual data within the S3 bucket
                // once data is recieved, convert to a string
                const fileData = yield ((_a = getData.Body) === null || _a === void 0 ? void 0 : _a.transformToString());
                console.log("Here is the File data: ", fileData);
                // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                // configure SQS message equiped with xml data within "data" key
                const message = {
                    event: 'objectCreated:Put',
                    bucket: bucketName,
                    key: objectKey,
                    data: fileData,
                };
                // configure parameters to send to SQS
                const command = new client_sqs_1.SendMessageCommand({
                    QueueUrl: queueUrl,
                    MessageBody: JSON.stringify(message),
                });
                // send to SQS
                yield sqs.send(command);
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'S3 create event processed' }),
        };
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
