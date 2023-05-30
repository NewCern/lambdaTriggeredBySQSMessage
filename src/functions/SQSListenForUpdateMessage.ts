import { DynamoDBClient, TableInUseException } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SQSHandler } from 'aws-lambda/trigger/sqs';

const dynamoClient = new DynamoDBClient({});
const TABLE_NAME = "PeopleTest";

export const handler:SQSHandler = async (event: SQSEvent): Promise<any> => {
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
        const update = await updateInDynamo(messagePayload, TABLE_NAME);
      }
  } catch (error) {
    console.error('Error processing SQS event:', error);
  }
}

// UPDATE PERSON
async function updateInDynamo(person: Record<string, any>, tableName: string): Promise<any> {
    const { personId, ...updateData } = person; 
    const params: UpdateCommandInput = {
      TableName: tableName,
      Key: {
        personId: personId,
      },
      UpdateExpression: "SET #firstName = :firstNameValue, #lastName = :lastNameValue, #address = :addressValue",
      ExpressionAttributeNames: {
        "#firstName": "firstName",
        "#lastName": "lastName",
        "#address": "address",
      },
      ExpressionAttributeValues: {
        ":firstNameValue": updateData.firstName,
        ":lastNameValue": updateData.lastName,
        ":addressValue": updateData.address,
      },
    };
    const command = new UpdateCommand(params);
    await dynamoClient.send(command);
    return person;
  }

