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
        const body = JSON.parse(event.body);
        // const { customerId, ...others } = body;
        const update = yield updateInDynamo(body, TABLE_NAME);
        console.log("THIS IS THE UPDATE RESULT", update);
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ message: "Update complete", statusCode: 200 })
        };
        return response;
    }
    catch (error) {
        console.error('Error processing SQS event:', error);
    }
});
exports.handler = handler;
// UPDATE customer
function updateInDynamo(customer, tableName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { customerId } = customer, updateData = __rest(customer, ["customerId"]);
        const params = {
            TableName: tableName,
            Key: {
                customerId: customerId,
            },
            UpdateExpression: "SET #firstName = :firstNameValue, #firstNameUpperCase = :firstNameUpperCaseValue, #lastName = :lastNameValue, #lastNameUpperCase = :lastNameUpperCaseValue, #emailAddress = :emailAddressValue, #emailAddressUpperCase = :emailAddressUpperCaseValue, #address = :addressValue, #addressUpperCase = :addressUpperCaseValue, #apt = :aptValue, #aptUpperCase = :aptUpperCaseValue, #city = :cityValue, #cityUpperCase = :cityUpperCaseValue, #state = :stateValue, #stateUpperCase = :stateUpperCaseValue, #zip = :zipValue, #areaCode = :areaCodeValue, #phoneNumber = :phoneNumberValue",
            ExpressionAttributeNames: {
                "#firstName": "firstName",
                "#firstNameUpperCase": "firstNameUpperCase",
                "#lastName": "lastName",
                "#lastNameUpperCase": "lastNameUpperCase",
                "#emailAddress": "emailAddress",
                "#emailAddressUpperCase": "emailAddressUpperCase",
                "#address": "address",
                "#addressUpperCase": "addressUpperCase",
                "#apt": "apt",
                "#aptUpperCase": "aptUpperCase",
                "#city": "city",
                "#cityUpperCase": "cityUpperCase",
                "#state": "state",
                "#stateUpperCase": "stateUpperCase",
                "#zip": "zip",
                "#areaCode": "areaCode",
                "#phoneNumber": "phoneNumber",
            },
            ExpressionAttributeValues: {
                ":firstNameValue": updateData.firstName,
                ":firstNameUpperCaseValue": updateData.firstNameUpperCase,
                ":lastNameValue": updateData.lastName,
                ":lastNameUpperCaseValue": updateData.lastNameUpperCase,
                ":emailAddressValue": updateData.emailAddress,
                ":emailAddressUpperCaseValue": updateData.emailAddressUpperCase,
                ":addressValue": updateData.address,
                ":addressUpperCaseValue": updateData.addressUpperCase,
                ":aptValue": updateData.apt,
                ":aptUpperCaseValue": updateData.aptUpperCase,
                ":cityValue": updateData.city,
                ":cityUpperCaseValue": updateData.cityUpperCase,
                ":stateValue": updateData.state,
                ":stateUpperCaseValue": updateData.stateUpperCase,
                ":zipValue": updateData.zip,
                ":areaCodeValue": updateData.areaCode,
                ":phoneNumberValue": updateData.phoneNumber,
            },
        };
        const command = new lib_dynamodb_1.UpdateCommand(params);
        yield dynamoClient.send(command);
        return customer;
    });
}
