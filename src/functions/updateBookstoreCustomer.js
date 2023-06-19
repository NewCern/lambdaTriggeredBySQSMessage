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
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const TABLE_NAME = "Customers";
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedEvent = JSON.stringify(event);
        const eventBody = JSON.parse(parsedEvent);
        const _a = eventBody.body, { customerId } = _a, rest = __rest(_a, ["customerId"]);
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ customerId: customerId, rest: rest })
        };
        return response;
    }
    catch (error) {
        console.error('Error processing SQS event:', error);
    }
});
exports.handler = handler;
// UPDATE PERSON
function updateInDynamo(person, tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { personId } = person, updateData = __rest(person, ["personId"]);
        const params = {
            TableName: tableName,
            Key: {
                personId: personId,
            },
            UpdateExpression: "SET #firstName = :firstNameValue, #lastName = :lastNameValue, #address = :addressValue",
            ExpressionAttributeNames: {
                "#firstName": "firstName",
                "#lastName": "lastName",
                "#address": "address",
            },
            ExpressionAttributeValues: {
                ":firstNameValue": updateData.firstName,
                ":lastNameValue": updateData.lastName,
                ":addressValue": updateData.address,
            },
        };
        const command = new lib_dynamodb_1.UpdateCommand(params);
        yield dynamoClient.send(command);
        return person;
    });
}
