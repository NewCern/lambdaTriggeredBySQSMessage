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
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const TABLE_NAME = "books";
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!event.Records || event.Records.length === 0) {
            console.log('No messages in the event.');
            return;
        }
        for (const message of event.Records) {
            const { body } = message;
            // converts message to javascript object.
            // however, at this point, data payload is still in xml format at this point
            const messageToJson = JSON.parse(body);
            // access data key in s3 bucket to get xml file
            const messagePayload = messageToJson.data;
            console.log("This is the message Payload: ", messagePayload);
            // parse xml file to javascript object
            const books = yield parseXML(messagePayload);
            // iterate through persons and add each object to DynamoDB
            for (let book of books) {
                // create an id number
                // and spread person object
                const data = Object.assign(Object.assign({}, book), { 
                    // create uppercase attributes
                    byUpperCase: book.by.toUpperCase(), titleUpperCase: book.title.toUpperCase(), publicationDateUpperCase: book.publicationDate.toUpperCase(), formatUpperCase: book.format.toUpperCase(), trimSizeUpperCase: book.trimSize.toUpperCase(), categoryUpperCase: book.category.toUpperCase(), isbnUpperCase: book.isbn.toUpperCase(), bookId: (0, uuid_1.v4)() });
                // post to the database
                yield insertToDynamo(data, TABLE_NAME);
                console.log("Here is each book: ", book);
                console.log("Book with upperCase Integrated: ", data);
            }
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
            // configure options for json output
            const options = {
                explicitCharkey: false,
                trim: true,
                normalize: false,
                explicitRoot: true,
                emptyTag: null,
                explicitArray: false,
                ignoreAttrs: false,
                mergeAttrs: false,
                validator: null // a callable validator
            };
            const parser = new xml2js.Parser(options);
            const parsedData = yield parser.parseStringPromise(xmlPayload);
            // create an array of datatype "Book"
            const books = parsedData.books.book.map((book) => ({
                by: book.by,
                title: book.title,
                publicationDate: book.publicationDate,
                format: book.format,
                category: book.category,
                trimSize: book.trimSize,
                isbn: book.isbn,
                price: book.price,
                imageUrl: book.imageUrl
            }));
            return books;
        }
        catch (error) {
            console.error('Error parsing XML:', error);
            return;
        }
    });
}
// INSERT BOOK
function insertToDynamo(book, tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            TableName: tableName,
            Item: book,
        };
        const command = new lib_dynamodb_1.PutCommand(params);
        yield dynamoClient.send(command);
        return book;
    });
}
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
