import { DynamoDB } from 'aws-sdk';
import { SQSEvent } from 'aws-lambda';
import { SQSHandler } from 'aws-lambda/trigger/sqs';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

// this is the queue that the results message will be sent to.
const sqs = new SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/bookstore-search-results-objects-queue";

const dynamoDB = new DynamoDB.DocumentClient();
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

        // get keyword from message
        const keyword = messagePayload.search || '{}';

        const params = {
          TableName: TABLE_NAME,
          FilterExpression: 'contains(firstName, :keyword) OR contains(lastName, :keyword) OR contains(address, :keyword)',
          ExpressionAttributeValues: {
            ':keyword': keyword
          }
        };
    
        // run the query
        const searchResults = await dynamoDB.scan(params).promise();

        // create a message with searchResults
        const resultMessage = {
            event: 'Send result Message To Queue',
            key: 'Results',
            data: searchResults,
        };

        // configure parameters to send to SQS
        const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(resultMessage),
        });
        
        // send message to queue
        await sqs.send(command);

        console.log("These are the results: ", searchResults);
      }
  } catch (error) {
    console.error('Error processing SQS event:', error);
  }
}

