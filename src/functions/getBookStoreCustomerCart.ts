import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyResult } from "aws-lambda";

const dynamoDB = new DynamoDB.DocumentClient();
const TABLE_NAME = "Orders";

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
    timestampe: string,
}

export const handler = async (event: APIGatewayProxyResult): Promise<APIGatewayProxyResult> => { 
    const eventBody = JSON.stringify(event);
    const body = JSON.parse(eventBody);
    const customerId = body.customerId

    const queryParams = {
        TableName: TABLE_NAME,
        FilterExpression: 'contains(customerId, :customerId)',
        ExpressionAttributeValues: {
        ':customerId': customerId,
        }
    };

    try {
        // GET request
        const data = await dynamoDB.scan(queryParams).promise();
        const orders = data.Items as Order[];
        const openCart = orders.find(order => order.openCart === true);

        if(openCart){
            const response: APIGatewayProxyResult = {
                statusCode: 200,
                headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'OPTIONS,GET'
                },
                body: JSON.stringify({ message:"Cart items retrieved", statusCode:200, openCart }),
            };
            return response;
        }

        const response: APIGatewayProxyResult = {
            statusCode: 200,
            headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,GET'
            },
            body: JSON.stringify({ message:"No cart items saved", statusCode: 404 }),
        };

        return response;

    } catch (error) {
    return { 
        statusCode: 500, 
        body: JSON.stringify(`Error getting cart items: ${error}`) 
    };
  }
};