import * as AWS from 'aws-sdk';
import * as xml2js from 'xml2js';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SQSHandler } from 'aws-lambda/trigger/sqs';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

const dynamoClient = new DynamoDBClient({});
const TABLE_NAME = "PeopleTest";

interface Person {
  firstName: string;
  // firstNameLowerCase: string;
  lastName: string;
  // lastNameLowerCase: string;
  address: string;
  // addressLowerCase: string;
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
        // const bufferString= Buffer.from(messagePayload).toString('utf8');

        // parse xml file to javascript object
        const persons = await parseXML(messagePayload);

        // iterate through persons and add each object to DynamoDB
        for(let person of persons){
          // create an id number
          // and spread person object
          const data = {
            ...person,
            addressUpperCase: person.address.toUpperCase(),
            lastNameUpperCase: person.lastName.toUpperCase(),
            firstNameUpperCase: person.firstName.toUpperCase(),
            personId: uuid(),
          }
          // post to the database
          await insertToDynamo(data, TABLE_NAME);
          console.log("Here is each person: ", person);
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
      // create an array of datatype "Person"
      const persons: Person[] = parsedData.records.record.map((record: any) => ({
        firstName: record.firstName,
        lastName: record.lastName,
        address: record.address,
      }));
      return persons;
  } catch (error) {
      console.error('Error parsing XML:', error);
      return;
  }
}
// INSERT PERSON
async function insertToDynamo (person: Record<string, any>, tableName: string): Promise<any> {
  const params: PutCommandInput = {
    TableName: tableName,
    Item: person,
  };
  const command = new PutCommand(params);
  await dynamoClient.send(command);
  return person;
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

