import { SQSEvent, SQSRecord } from 'aws-lambda';
import { SQS } from 'aws-sdk';

export const handler = async (event: SQSEvent) => {
  try {
    // Process each SQS record in the event
    for (const record of event.Records) {
      // Retrieve the message body
      const { body } = record;

      // Logic to seperate .xml to individual files will go here

      // Delete the message from the queue
    //   await deleteMessage(record);
    }
  } catch (error) {
    console.error('Error processing SQS messages:', error);
    throw error;
  }
};

async function deleteMessage(record: SQSRecord) {
  const { receiptHandle } = record;
  const queueUrl = "https://sqs.us-east-1.amazonaws.com/233784350905/xml-file-added-to-queue";
  const sqs = new SQS();
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  };

  try {
    await sqs.deleteMessage(params).promise();
    console.log('Deleted SQS message:', record.messageId);
  } catch (error) {
    console.error('Error deleting SQS message:', error);
    throw error;
  }
}
