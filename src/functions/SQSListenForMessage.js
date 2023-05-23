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
const xml2js_1 = require("xml2js");
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Process each array item in the queue
        for (const record of event.Records) {
            // isolate message object
            const { body } = record;
            // convert to javascript object
            const message = JSON.parse(body);
            // extract key, which contains xml file
            const xml = message.key;
            // convert to buffer
            const xmlBuffer = Buffer.from(xml);
            // then to string
            const xmlBufferToString = xmlBuffer.toString();
            console.log("Buffer to String result: ", xmlBufferToString);
            // const options = {
            //   explicitArray: false,
            // };
            // const jsonObjects = await parseXML(xmlBufferToString, options);
            // console.log("Here is the parseXML being invoked: ", jsonObjects);
        }
    }
    catch (error) {
        console.error('Error processing SQS messages in the catch:', error);
        throw error;
    }
});
exports.handler = handler;
function parseXML(xmlFile, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            (0, xml2js_1.parseString)(xmlFile, options, (error, result) => {
                // if (error) {
                //   console.log("There was an error: ", error);
                //   reject(error);
                // } else {
                const json = JSON.stringify(result, null, 1);
                resolve(json);
                console.log("Here is the json: ", json);
                // }
            });
        });
    });
}
// async function deleteMessage(record: SQSRecord) {
//   const { receiptHandle } = record;
//   const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/xml-file-added-to-queue";
//   const sqs = new SQS();
//   const params = {
//     QueueUrl: queueUrl,
//     ReceiptHandle: receiptHandle,
//   };
//   try {
//     await sqs.deleteMessage(params).promise();
//     console.log('Deleted SQS message:', record.messageId);
//   } catch (error) {
//     console.error('Error deleting SQS message:', error);
//     throw error;
//   }
// }
