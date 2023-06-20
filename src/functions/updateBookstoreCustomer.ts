import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';

const dynamoClient = new DynamoDBClient({});
const TABLE_NAME = "Customers";

export const handler = async (event: APIGatewayProxyResult): Promise<any> => {
  try {
      const body = JSON.parse(event.body);
      // const { customerId, ...others } = body;

      const update = await updateInDynamo(body, TABLE_NAME);
      console.log("THIS IS THE UPDATE RESULT", update);

      const response: APIGatewayProxyResult = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: "Update complete", statusCode: 200 })
      };
      return response;
  } catch (error) {
    console.error('Error processing SQS event:', error);
  }
}

// UPDATE customer
async function updateInDynamo(customer: Record<string, any>, tableName: string): Promise<any> {
    const { customerId, ...updateData } = customer; 
    const params: UpdateCommandInput = {
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
    const command = new UpdateCommand(params);
    await dynamoClient.send(command);
    return customer;
  }

