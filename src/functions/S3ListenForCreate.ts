import { S3Handler } from 'aws-lambda';
import { S3EventRecord } from 'aws-lambda/trigger/s3';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { S3 } from "@aws-sdk/client-s3";
import AWS from 'aws-sdk';
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const sqs = new SQSClient({ region: "us-east-1" });
const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/xml-file-added-to-queue";
const s3 = new S3Client({})

export const handler: S3Handler = async (event): Promise<any> => {
  try {
    // Process the S3 create event
    const records: S3EventRecord[] = event.Records;
    for (const record of records) {
      if (record.eventName === 'ObjectCreated:Put') {
        const bucketName: string = record.s3.bucket.name;
        const objectKey: string = record.s3.object.key;

        // BELOW IS TEST OF HOW TO ACCESS BUCKET CONTENTS
        // Create query parameters to search S3 bucket
        const getObjectParams = new GetObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        });
      
        // send get command to S3 bucket
        const getData = await s3.send(getObjectParams);
        // once data is recieved, convert to a string
        const fileData = await getData.Body?.transformToString();
        console.log("Here is the File data: ", fileData);
        
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

        // configure SQS message equiped with xml data
        const message = {
          event: 'objectCreated:Put',
          bucket: bucketName,
          key: objectKey,
          data: fileData,
        };

        // configure parameters to send to SQS
        const command = new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify(message),
        });

        // send to SQS
        await sqs.send(command);
      }
    }
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
