// import { SQSEvent, SQSRecord } from 'aws-lambda';
// import { SQSHandler } from 'aws-lambda/trigger/sqs';
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
// import { parseString } from 'xml2js';
// import { SQS } from 'aws-sdk';
// import fs from 'fs';

// export const handler: SQSHandler = async (event: SQSEvent): Promise<any> => {
//   try {
//     // Process each array item in the queue
//     for (const record of event.Records) {
//       // isolate message object
//       const { body } = record;
//       // convert to javascript object
//       const message = JSON.parse(body);
//       // extract key, which contains xml file
//       const xml = message.key;
//       // convert to buffer
//       const xmlBuffer = Buffer.from(xml);
//       // then to string
//       const xmlBufferToString = xmlBuffer.toString();
//       console.log("Buffer to String result: ", xmlBufferToString)

//       const options = {
//         explicitArray: false,
//       };
//       const jsonObjects = await parseXML(xmlBufferToString, options);
//       console.log("Here is the parseXML being invoked: ", jsonObjects);
//     }
//   } catch (error) {
//     console.error('Error processing SQS messages in the catch:', error);
//     throw error;
//   }
// };

// async function parseXML(xmlFile: string, options: any): Promise<any> {
//   return new Promise((resolve, reject) => {
//     parseString(xmlFile, options, (error, result) => {
//       if (error) {
//         console.log("There was an error: ", error);
//         reject(error);
//       } else {
//         const json = JSON.stringify(result, null, 1);
//         resolve(json);
//         console.log("Here is the json: ", json);
//       }
//     })
//   });
// }

// // async function deleteMessage(record: SQSRecord) {
// //   const { receiptHandle } = record;
// //   const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/xml-file-added-to-queue";
// //   const sqs = new SQS();
// //   const params = {
// //     QueueUrl: queueUrl,
// //     ReceiptHandle: receiptHandle,
// //   };

// //   try {
// //     await sqs.deleteMessage(params).promise();
// //     console.log('Deleted SQS message:', record.messageId);
// //   } catch (error) {
// //     console.error('Error deleting SQS message:', error);
// //     throw error;
// //   }
// // }


//////////////////////////////////////////////////////////////

// import * as AWS from 'aws-sdk';
// import * as xml2js from 'xml2js';

// // Configure AWS SDK
// AWS.config.update({
//   region: 'YOUR_REGION',
//   accessKeyId: 'YOUR_ACCESS_KEY',
//   secretAccessKey: 'YOUR_SECRET_KEY',
// });

// const sqs = new AWS.SQS();
// const dynamoDB = new AWS.DynamoDB.DocumentClient();

// interface Person {
//   firstName: string;
//   lastName: string;
//   address: string;
// }

// export const handler = async (queueUrl: string, tableName: string): Promise<void> => {
//   try {
//     const { Messages } = await sqs.receiveMessage({ QueueUrl: queueUrl, MaxNumberOfMessages: 10 }).promise();

//     if (!Messages || Messages.length === 0) {
//       console.log('No messages in the queue.');
//       return;
//     }

//     for (const message of Messages) {
//       const xmlPayload = message.Body;
//       const persons = await parseXML(xmlPayload);

//       for (const person of persons) {
//         await insertPersonToDynamoDB(person, tableName);
//       }

//       // await sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle }).promise();
//       // console.log('Processed and deleted a message from the queue.');
//     }

//     console.log('All XML messages processed and inserted into DynamoDB successfully!');
//   } catch (error) {
//     console.error('Error processing XML messages:', error);
//   }
// }

// async function parseXML(xmlPayload: any): Promise<Person[]> {
//   try {
//     const parsedData = await xml2js.parseStringPromise(xmlPayload, { explicitArray: false });
//     const persons: Person[] = parsedData.records.record.map((record: any) => ({
//       firstName: record.firstName,
//       lastName: record.lastName,
//       address: record.address,
//     }));

//     return persons;
//   } catch (error) {
//     console.error('Error parsing XML:', error);
//     return [];
//   }
// }

// async function insertPersonToDynamoDB(person: Person, tableName: string): Promise<void> {
//   const params = {
//     TableName: tableName,
//     Item: person,
//   };

//   try {
//     await dynamoDB.put(params).promise();
//     console.log(`Inserted record: ${JSON.stringify(person)}`);
//   } catch (error) {
//     console.error(`Error inserting record: ${JSON.stringify(person)}`, error);
//   }
// }

// // Usage
// const queueUrl = 'YourSQSQueueUrl';
// const tableName = 'YourDynamoDBTableName';

// handler(queueUrl, tableName).catch(console.error);

////////////////////////////////////////////////////////////////////////////////////////////////

import * as AWS from 'aws-sdk';
import * as xml2js from 'xml2js';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SQSHandler } from 'aws-lambda/trigger/sqs';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";



// Configure AWS SDK
// AWS.config.update({
//   region: 'us-east-1',
//   accessKeyId: 'AKIATM3VCDC4T72JPFTL',
//   secretAccessKey: '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',
// });

// const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoClient = new DynamoDBClient({});

interface Person {
  firstName: string;
  lastName: string;
  address: string;
}

// async function processSQSEvent(event: AWS.SQS.Types.ReceiveMessageResult): Promise<void> {
export const handler:SQSHandler = async (event: SQSEvent): Promise<any> => {
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


      const persons = await parseXML(bufferToStringNoWhitespace);
      console.log("Below persons: ", persons)

      for (const person of persons) {
        await insertPersonToDynamoDB(person);
      }

      // Delete the processed message from the SQS queue
      // await deleteSQSMessage(message.ReceiptHandle);
      // console.log('Processed and deleted a message from the SQS queue.');
    }

  } catch (error) {
    console.error('Error processing SQS event:', error);
  }
}

async function parseXML(xmlPayload: any): Promise<Person[]> {
  try {
    const parsedData = await xml2js.parseStringPromise(xmlPayload, { explicitArray: false });
    console.log("Below parsedData in parseXML: ", parsedData);
    const persons: Person[] = parsedData.records.record.map((record: any) => ({
      firstName: record.firstName,
      lastName: record.lastName,
      address: record.address,
    }));
    console.log("Below persons in parseXML function: ", parsedData);

    return persons;
  } catch (error) {
    console.error('Error parsing XML:', error);
    return [];
  }
}

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

