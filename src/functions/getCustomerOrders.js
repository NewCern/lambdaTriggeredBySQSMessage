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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const dynamoDB = new aws_sdk_1.DynamoDB.DocumentClient();
const TABLE_NAME = "Orders";
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const eventBody = JSON.stringify(event);
    const body = JSON.parse(eventBody);
    const customerId = body.customerId;
    const queryParams = {
        TableName: TABLE_NAME,
        FilterExpression: 'contains(customerId, :customerId)',
        ExpressionAttributeValues: {
            ':customerId': customerId,
        }
    };
    try {
        // GET request
        const data = yield dynamoDB.scan(queryParams).promise();
        const orders = data.Items;
        const closedCart = orders.filter(order => order.openCart !== true && order.customerId === customerId);
        if (closedCart.length !== 0) {
            const response = {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Methods': 'OPTIONS,GET'
                },
                body: JSON.stringify({ message: "Cart items retrieved", statusCode: 200, closedCart }),
            };
            return response;
        }
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            body: JSON.stringify({ message: "No cart items found", statusCode: 404 }),
        };
        return response;
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(`Error getting orders: ${error}`)
        };
    }
});
exports.handler = handler;
