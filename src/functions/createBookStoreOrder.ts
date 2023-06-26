import { APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from 'aws-sdk';

const dynamoClient = new DynamoDBClient({});
const dynamoDB = new DynamoDB.DocumentClient();
const timeStamp = new Date().toISOString();


interface Order {
    orderId: string,
    customerId: string,
    isLoggedIn: false,
    emailAddress: string,
    shippingDetails: Record<string, any>,
    items: Record<string, any>[],
    total: number,
    openCart: true,
    fullfilled: false,
    paymentProcessed: false,
}

// Create an object to export with key value pairs
// some of these key value pairs will be functions
const dynamo = {
    write: async (data: Record<string, any>, tableName: string) => {
        const params: PutCommandInput = {
            TableName: tableName,
            Item: data,
        };
        // pass to database input
        const command = new PutCommand(params);
        // send input command
        await dynamoClient.send(command);
        return data;
    },
    update: async (order: Record<string, any>, tableName: string): Promise<any> => {
        const { orderId, ...updateData } = order; 
        const params: UpdateCommandInput = {
          TableName: tableName,
          Key: {
            orderId: orderId,
          },
          UpdateExpression: "SET #isLoggedIn = :isLoggedInValue, #customerId = :customerIdValue, #emailAddress = :emailAddressValue, #emailAddressUpperCase = :emailAddressUpperCaseValue, #shippingDetails = :shippingDetailsValue, #items = :itemsValue, #total = :totalValue, #openCart = :openCartValue, #fullfilled = :fullfilledValue, #paymentProcessed = :paymentProcessedValue",
          ExpressionAttributeNames: {
            "#isLoggedIn": "isLoggedIn",
            "#customerId": "customerId",
            "#emailAddress": "emailAddress",
            "#emailAddressUpperCase": "emailAddressUpperCase",
            "#shippingDetails": "shippingDetails",
            "#items": "items",
            "#total": "total",
            "#openCart": "openCart",
            "#fullfilled": "fullfilled",
            "#paymentProcessed": "paymentProcessed",
            // "#timestamp": "timestamp",
          },
          ExpressionAttributeValues: {
            ":isLoggedInValue": updateData.isLoggedIn,
            ":customerIdValue": updateData.customerId,
            ":emailAddressValue": updateData.emailAddress,
            ":emailAddressUpperCaseValue": updateData.emailAddress.toUpperCase(),
            ":shippingDetailsValue": updateData.shippingDetails,
            ":itemsValue": updateData.items,
            ":totalValue": updateData.total,
            ":openCartValue": updateData.openCart,
            ":fullfilledValue": updateData.fullfilled,
            ":paymentProcessedValue": updateData.paymentProcessed,
            // ":timestampValue": timeStamp,
          },
        };
        const command = new UpdateCommand(params);
        await dynamoClient.send(command);
        return order;
      }
};

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => {
    try {
        const eventBody = JSON.parse(event.body);
        const orderId = eventBody.orderId;

        const body = {
            ...eventBody,
            timestamp: new Date().toISOString(),
            emailAddressUpperCase: eventBody.emailAddress !== "" ? eventBody.emailAddress.toUpperCase() : eventBody.emailAddress,
            shippingDetails: {
                address: eventBody.shippingDetails.address !== "" ? eventBody.shippingDetails.address.toUpperCase() : eventBody.shippingDetails.address,
                apt: eventBody.shippingDetails.apt !== "" ? eventBody.shippingDetails.apt.toUpperCase() : eventBody.shippingDetails.apt,
                city: eventBody.shippingDetails.city !== "" ? eventBody.shippingDetails.city.toUpperCase() : eventBody.shippingDetails.city,
                state: eventBody.shippingDetails.state !== "" ? eventBody.shippingDetails.state.toUpperCase() : eventBody.shippingDetails.state,
                zip: eventBody.shippingDetails.zip !== "" ? eventBody.shippingDetails.zip.toUpperCase() : eventBody.shippingDetails.zip,
                areaCode: eventBody.shippingDetails.areaCode !== "" ? eventBody.shippingDetails.areaCode.toUpperCase() : eventBody.shippingDetails.areaCode,
                phoneNumber: eventBody.shippingDetails.phoneNumber !== "" ? eventBody.shippingDetails.phoneNumber.toUpperCase() : eventBody.shippingDetails.phoneNumber,
            },

        };
        console.log("This is the body: ", body)

        const queryParams = {
            TableName: "Orders",
            FilterExpression: 'contains(orderId, :orderId)',
            ExpressionAttributeValues: {
            ':orderId': orderId,
            }
        };

        // query order number to see if it exists before creating it.
        const data = await dynamoDB.scan(queryParams).promise();
        const orders = data.Items as Order[];
        // console.log("orders : ", orders)

        const queryResult = orders.find(order => order.orderId === orderId);
        // console.log("queryResult : ", queryResult)

        // if it does not exist, create it
        if(!queryResult){
            // console.log("THIS IS THE ORDER BODY: ", body);
            // call write function from Library
             const order = await dynamo.write(body, "Orders");
             const response: APIGatewayProxyResult = {
                statusCode: 200,
                headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                  'Access-Control-Allow-Methods': 'OPTIONS,POST'
                },
                body: JSON.stringify({ message: 'Order has been created', order })
            };
            return response;
        }

        // if it does exist, update it
        await dynamo.update(body, "Orders");
        const response: APIGatewayProxyResult = {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
              'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            body: JSON.stringify({ 
                message: 'Order updated', 
                statusCode: 200,
             })
          };
          return response;

    } catch(error){
        console.error('Unable to add order. Error JSON:', JSON.stringify(error, null, 2));
        const response: APIGatewayProxyResult = {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
          },
          body: JSON.stringify({ message: 'Unable to add order' })
        };
        return response;
    }
};