import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { SQSEvent } from 'aws-lambda';
import { SQSHandler } from 'aws-lambda/trigger/sqs';

const dynamoClient = new DynamoDBClient({});
const TABLE_NAME = "PeopleTest";

export const handler: SQSHandler = async (event: SQSEvent): Promise<any> => {
  try {
    if (!event.Records || event.Records.length === 0) {
      console.log('No messages in the event.');
      return;
    }

    for (const message of event.Records) {
      const { body } = message;
      const messageToJson = JSON.parse(body);
      // access data key for payload
      const messagePayload = messageToJson.data;
      await deleteFromDynamo(messagePayload.personId, TABLE_NAME);
      const response = {
        statusCode: 200,
        body: JSON.stringify({message: `Item number ${messagePayload.personId} has been deleted`, body}),
      };
      return response;
    }
  } catch (error) {
    console.error('Error processing SQS event:', error);
  }
}

// DELETE PERSON
async function deleteFromDynamo(personId: string, tableName: string): Promise<any> {
  const params: DeleteCommandInput = {
    TableName: tableName,
    Key: {
      personId: personId,
    },
  };
  const command = new DeleteCommand(params);
  await dynamoClient.send(command);
  const response = {
    statusCode: 200,
    body: JSON.stringify({message: `person with id ${personId} deleted`}),
  }
  return response;
}
