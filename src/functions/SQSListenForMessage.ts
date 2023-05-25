import * as AWS from 'aws-sdk';
import * as xml2js from 'xml2js';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SQSHandler } from 'aws-lambda/trigger/sqs';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import xmljs from 'xml-js';

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
      const bufferString= Buffer.from(messagePayload).toString('utf8');
      // console.log("Here is the converted buffer: ", bufferString);

      const removeBOM = bufferString.replace('\ufeff', '');
      const removeWhiteSpace = removeBOM.replace(/\s/g, '');
      console.log("white space removed: ", removeWhiteSpace);

      const persons = await parseXML(removeBOM);
      console.log("Below persons: ", persons)

      for(let record of persons){
        console.log("each individual record: ", record);
      }

      // for (const person of persons) {
      //   await insertPersonToDynamoDB(person);
      // }

      // Delete the processed message from the SQS queue
      // await deleteSQSMessage(message.ReceiptHandle);
      // console.log('Processed and deleted a message from the SQS queue.');
    }

  } catch (error) {
    console.error('Error processing SQS event:', error);
  }
}

async function parseXML(xmlPayload: string): Promise<any> {
  try {
    const options: any = {           // options passed to xml2js parser
      explicitCharkey: false, // undocumented
      trim: true,            // trim the leading/trailing whitespace from text nodes
      normalize: false,       // trim interior whitespace inside text nodes
      explicitRoot: true,    // return the root node in the resulting object?
      emptyTag: null,         // the default value for empty nodes
      explicitArray: true,    // always put child nodes in an array
      ignoreAttrs: false,     // ignore attributes, only create text nodes
      mergeAttrs: false,      // merge attributes and child elements
      validator: null         // a callable validator
      };
      // const parsedData = await xml2js.parseStringPromise(xmlPayload, { explicitArray: false });
      const parser = new xml2js.Parser(options);
      // const parsedData = await xml2js.parseStringPromise(xmlPayload, { explicitArray: false });
      const parsedData = await parser.parseStringPromise(xmlPayload);
      // const persons: Person[] = parsedData.records.record.map((record: any) => ({
      // firstName: record.firstName,
      // lastName: record.lastName,
      // address: record.address,
      // }));
      // console.log("im in the function: ", persons)
      // return persons;

      // test
      console.log(parsedData);
      return parsedData

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

  } catch (error) {
      console.error('Error parsing XML:', error);
      return [];
  }
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

