import * as AWS from 'aws-sdk';
import * as xml2js from 'xml2js';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SQSHandler } from 'aws-lambda/trigger/sqs';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

const dynamoClient = new DynamoDBClient({});
const TABLE_NAME = "books";

interface Book {
  by: string,
  title: string,
  publicationDate: string,
  format: string,
  category: string,
  trimSize: string,
  isbn: string,
  price: string,
  imageUrl: string
  
}

export const handler:SQSHandler = async (event: SQSEvent): Promise<any> => {
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
        const books = await parseXML(messagePayload);

        // iterate through persons and add each object to DynamoDB
        for(let book of books){
          // create an id number
          // and spread person object
          const data = {
            ...book,
            // create uppercase attributes
            byUpperCase: book.by.toUpperCase(),
            titleUpperCase: book.title.toUpperCase(),
            publicationDateUpperCase: book.publicationDate.toUpperCase(),
            formatUpperCase: book.format.toUpperCase(),
            trimSizeUpperCase: book.trimSize.toUpperCase(),
            categoryUpperCase: book.category.toUpperCase(),
            isbnUpperCase: book.isbn.toUpperCase(),
            bookId: uuid(),
          }
          // post to the database
          await insertToDynamo(data, TABLE_NAME);
          console.log("Here is each book: ", book);
          console.log("Book with upperCase Integrated: ", data);
        }
      }
  } catch (error) {
    console.error('Error processing SQS event:', error);
  }
}

async function parseXML(xmlPayload: string): Promise<any> {
  try {
    // configure options for json output
    const options: any = {           // options passed to xml2js parser
      explicitCharkey: false, // undocumented
      trim: true,            // trim the leading/trailing whitespace from text nodes
      normalize: false,       // trim interior whitespace inside text nodes
      explicitRoot: true,    // return the root node in the resulting object?
      emptyTag: null,         // the default value for empty nodes
      explicitArray: false,    // always put child nodes in an array
      ignoreAttrs: false,     // ignore attributes, only create text nodes
      mergeAttrs: false,      // merge attributes and child elements
      validator: null         // a callable validator
      };

      const parser = new xml2js.Parser(options);
      const parsedData = await parser.parseStringPromise(xmlPayload);
      // create an array of datatype "Book"
      const books: Book[] = parsedData.books.book.map((book: any) => ({
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
  } catch (error) {
      console.error('Error parsing XML:', error);
      return;
  }
}
// INSERT BOOK
async function insertToDynamo (book: Record<string, any>, tableName: string): Promise<any> {
  const params: PutCommandInput = {
    TableName: tableName,
    Item: book,
  };
  const command = new PutCommand(params);
  await dynamoClient.send(command);
  return book;
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

