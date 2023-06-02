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
const TABLE_NAME = 'PeopleTest';
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventBody = JSON.stringify(event);
        const body = JSON.parse(eventBody);
        const keyword = body.search;
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: 'contains(firstName, :keyword) OR contains(lastName, :keyword) OR contains(address, :keyword)',
            ExpressionAttributeValues: {
                ':keyword': keyword
            }
        };
        const data = yield dynamoDB.scan(params).promise();
        const users = data.Items;
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(users)
        };
        return response;
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(`Error getting users from DynamoDB: ${error}`),
        };
    }
});
exports.handler = handler;
