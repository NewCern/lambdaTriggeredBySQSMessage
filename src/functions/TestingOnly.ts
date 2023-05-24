import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SQSHandler } from 'aws-lambda/trigger/sqs';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { parseString } from 'xml2js';
import { SQS } from 'aws-sdk';
import fs from 'fs';

export const handler: SQSHandler = async (event: SQSEvent): Promise<any> => {
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
      console.log("Buffer to String result: ", xmlBufferToString)

      const options = {
        explicitArray: false,
      };
      const jsonObjects = await parseXML(xmlBufferToString, options);
      console.log("Here is the parseXML being invoked: ", jsonObjects);
    }
  } catch (error) {
    console.error('Error processing SQS messages in the catch:', error);
    throw error;
  }
};

async function parseXML(xmlFile: string, options: any): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xmlFile, options, (error, result) => {
      if (error) {
        console.log("There was an error: ", error);
        reject(error);
      } else {
        const json = JSON.stringify(result, null, 1);
        resolve(json);
        console.log("Here is the json: ", json);
      }
    })
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