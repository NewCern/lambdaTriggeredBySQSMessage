import { APIGatewayProxyResult, APIGatewayProxyEvent, SQSEvent } from 'aws-lambda';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/bookstore-search-results-objects-queue";

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
  try {
    // // Check if the request method is GET
    // if (event.httpMethod !== 'GET') {
    //   return {
    //     statusCode: 405,
    //     body: JSON.stringify('Method Not Allowed'),
    //   };
    // }

    // Perform SQS consumer logic
    const receiveMessageCommand = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 1,
    });
    const { Messages } = await sqs.send(receiveMessageCommand);

    // console.log("These Are the Messages: ", Messages)
    
    if (!Messages || Messages.length === 0) {
      return {
        statusCode: 204,
        body: JSON.stringify('No messages in the queue'),
      };
    }

    const message = Messages[0];
    console.log("This is Message[0]: ", message)
    const { Body: messageBody, ReceiptHandle } = message;

    // // // Process the message payload
    const messageToJson = JSON.parse(messageBody || '{}');
    const messagePayload = messageToJson.data;
    const searchResults = messagePayload.Items || '{}';

    // // // Delete the processed message from the queue
    // const deleteMessageCommand = new DeleteMessageCommand({
    //   QueueUrl: queueUrl,
    //   ReceiptHandle,
    // });
    // await sqs.send(deleteMessageCommand);

    // Return the search results as an HTTP response
    const response: APIGatewayProxyResult = {
      statusCode: 200,
      headers: {
        // 'Content-Type': 'application/json',
        // 'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      },
      body: searchResults,
    };

    return response;
  } catch (error) {
    console.error('Error processing SQS event:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Internal Server Error'),
    };
  }
};
