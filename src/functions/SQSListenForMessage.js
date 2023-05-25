"use strict";
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
            const bufferString = Buffer.from(messagePayload).toString('utf8');
            // console.log("Here is the converted buffer: ", bufferString);
            const removeBOM = bufferString.replace('\ufeff', '');
            const removeWhiteSpace = removeBOM.replace(/\s/g, '');
            console.log("white space removed: ", removeWhiteSpace);
            const persons = yield parseXML(removeBOM);
            console.log("Below persons: ", persons);
            for (let record of persons) {
                console.log("each individual record: ", record);
            }
            // for (const person of persons) {
            //   await insertPersonToDynamoDB(person);
            // }
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
            const options = {
                explicitCharkey: false,
                trim: true,
                normalize: false,
                explicitRoot: true,
                emptyTag: null,
                explicitArray: true,
                ignoreAttrs: false,
                mergeAttrs: false,
                validator: null // a callable validator
            };
            // const parsedData = await xml2js.parseStringPromise(xmlPayload, { explicitArray: false });
            const parser = new xml2js.Parser(options);
            // const parsedData = await xml2js.parseStringPromise(xmlPayload, { explicitArray: false });
            const parsedData = yield parser.parseStringPromise(xmlPayload);
            // const persons: Person[] = parsedData.records.record.map((record: any) => ({
            // firstName: record.firstName,
            // lastName: record.lastName,
            // address: record.address,
            // }));
            // console.log("im in the function: ", persons)
            // return persons;
            // test
            console.log(parsedData);
            return parsedData;
            // trying a different npm package
            // const parsedData = xmljs.xml2json(xmlPayload, { trim:true, compact: true, spaces: 4 } );
            // console.log("Here is parsedData: ", parsedData);
            // // const convertToObject = JSON.parse(parsedData);
            // // const persons: Person[] = convertToObject.records.record.map((record: any) => ({
            // // firstName: record.firstName,
            // // lastName: record.lastName,
            // // address: record.address,
            // // }));
            // // console.log("from with function: ", persons)
            // // return persons;
            // // test
            // return parsedData;
        }
        catch (error) {
            console.error('Error parsing XML:', error);
            return [];
        }
    });
}
// ANOTHER METHOD OF PARSING XML
// async function parseXML(xmlPayload: any): Promise<Person[]> {
//   try {
//     const parsedData = await xml2js.parseStringPromise(xmlPayload, { explicitArray: false });
//     console.log("Below parsedData in parseXML: ", parsedData);
//     const persons: Person[] = parsedData.records.record.map((record: any) => ({
//       firstName: record.firstName,
//       lastName: record.lastName,
//       address: record.address,
//     }));
//     console.log("Below persons in parseXML function: ", parsedData);
//     return persons;
//   } catch (error) {
//     console.error('Error parsing XML:', error);
//     return [];
//   }
// }
// INSERT PERSON
// async function insertPersonToDynamoDB(person: Person): Promise<void> {
//   // const params = {
//   //   TableName: 'PeopleTest',
//   //   Item: person,
//   // };
//   const params: PutCommandInput = {
//     TableName: 'PeopleTest',
//     Item: person,
//   };
//   const command = new PutCommand(params);
//   // try {
//     // await dynamoDB.put(params).promise();
//     await dynamoClient.send(command);
//     console.log(`Inserted record: ${JSON.stringify(person)}`);
//   // } catch (error) {
//   //   console.error(`Error inserting record: ${JSON.stringify(person)}`, error);
//   // }
// }
// DELETE
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
