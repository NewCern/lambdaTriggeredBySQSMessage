import { S3Handler } from 'aws-lambda';
import { S3EventRecord } from 'aws-lambda/trigger/s3';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

// need to utilize environment variables here
const sqs = new SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/xml-file-added-to-queue";

export const handler: S3Handler = async (event): Promise<any> => {
  try {
    // Process the S3 create event
    const records: S3EventRecord[] = event.Records;
    for (const record of records) {
      if (record.eventName === 'ObjectCreated:Put') {
        const bucketName: string = record.s3.bucket.name;
        const objectKey: string = record.s3.object.key;

        // Perform actions on the newly created object
        // Send a message to the SQS queue
        const message = {
          event: 'objectCreated:Put',
          bucket: bucketName,
          key: objectKey
        };
        const command = new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify(message)
        });
        await sqs.send(command);
      }
    }

    // Return a successful response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'S3 create event processed' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'An error occurred' }),
    };
  }
};
