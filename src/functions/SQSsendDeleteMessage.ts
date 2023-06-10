import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { APIGatewayProxyResult } from "aws-lambda";

const sqs = new SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/bookstore-delete-data-object-queue";

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body);
    console.log("Here is the body: ", body);
    // configure SQS message equiped with xml data
    const message = {
        event: 'Send delete Message To Queue',
        key: body.personId,
        data: body,
    };
    // configure parameters to send to SQS
    const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(message),
    });

        // send to SQS
    await sqs.send(command);
    const response: APIGatewayProxyResult = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        body: JSON.stringify({ message: 'data sent to message', body })
      };
      return response;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred' }),
    };
  }
};
