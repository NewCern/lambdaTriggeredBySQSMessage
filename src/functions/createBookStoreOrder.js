"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const lib_dynamodb_2 = require("@aws-sdk/lib-dynamodb");
const aws_sdk_1 = require("aws-sdk");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const dynamoDB = new aws_sdk_1.DynamoDB.DocumentClient();
const timeStamp = new Date().toISOString();
// Create an object to export with key value pairs
// some of these key value pairs will be functions
const dynamo = {
    write: (data, tableName) => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            TableName: tableName,
            Item: data,
        };
        // pass to database input
        const command = new lib_dynamodb_2.PutCommand(params);
        // send input command
        yield dynamoClient.send(command);
        return data;
    }),
    update: (order, tableName) => __awaiter(void 0, void 0, void 0, function* () {
        const { orderId } = order, updateData = __rest(order, ["orderId"]);
        const params = {
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
        const command = new lib_dynamodb_1.UpdateCommand(params);
        yield dynamoClient.send(command);
        return order;
    })
};
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventBody = JSON.parse(event.body);
        const orderId = eventBody.orderId;
        const body = Object.assign(Object.assign({}, eventBody), { timestamp: new Date().toISOString(), emailAddressUpperCase: eventBody.emailAddress !== "" ? eventBody.emailAddress.toUpperCase() : eventBody.emailAddress, shippingDetails: {
                address: eventBody.shippingDetails.address !== "" ? eventBody.shippingDetails.address.toUpperCase() : eventBody.shippingDetails.address,
                apt: eventBody.shippingDetails.apt !== "" ? eventBody.shippingDetails.apt.toUpperCase() : eventBody.shippingDetails.apt,
                city: eventBody.shippingDetails.city !== "" ? eventBody.shippingDetails.city.toUpperCase() : eventBody.shippingDetails.city,
                state: eventBody.shippingDetails.state !== "" ? eventBody.shippingDetails.state.toUpperCase() : eventBody.shippingDetails.state,
                zip: eventBody.shippingDetails.zip !== "" ? eventBody.shippingDetails.zip.toUpperCase() : eventBody.shippingDetails.zip,
                areaCode: eventBody.shippingDetails.areaCode !== "" ? eventBody.shippingDetails.areaCode.toUpperCase() : eventBody.shippingDetails.areaCode,
                phoneNumber: eventBody.shippingDetails.phoneNumber !== "" ? eventBody.shippingDetails.phoneNumber.toUpperCase() : eventBody.shippingDetails.phoneNumber,
            } });
        console.log("This is the body: ", body);
        const queryParams = {
            TableName: "Orders",
            FilterExpression: 'contains(orderId, :orderId)',
            ExpressionAttributeValues: {
                ':orderId': orderId,
            }
        };
        // query order number to see if it exists before creating it.
        const data = yield dynamoDB.scan(queryParams).promise();
        const orders = data.Items;
        // console.log("orders : ", orders)
        const queryResult = orders.find(order => order.orderId === orderId);
        // console.log("queryResult : ", queryResult)
        // if it does not exist, create it
        if (!queryResult) {
            // console.log("THIS IS THE ORDER BODY: ", body);
            // call write function from Library
            const order = yield dynamo.write(body, "Orders");
            const response = {
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
        yield dynamo.update(body, "Orders");
        const response = {
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
    }
    catch (error) {
        console.error('Unable to add order. Error JSON:', JSON.stringify(error, null, 2));
        const response = {
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
});
exports.handler = handler;
