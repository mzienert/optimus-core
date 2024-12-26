"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const dynamoClient = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
const createResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
});
const handleError = (error) => {
    console.error('Error:', error);
    if (error.name === 'ResourceNotFoundException') {
        return {
            statusCode: 404,
            message: 'DynamoDB table not found'
        };
    }
    if (error.name === 'ValidationException') {
        return {
            statusCode: 400,
            message: 'Invalid query parameters'
        };
    }
    return {
        statusCode: 500,
        message: 'Internal server error',
        error: error.message
    };
};
const handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE || 'GalvitronTable',
            IndexName: 'symbol-timestamp-index',
            KeyConditionExpression: '#type = :type',
            ExpressionAttributeNames: {
                '#type': 'type'
            },
            ExpressionAttributeValues: {
                ':type': 'KLINE'
            },
            ScanIndexForward: false,
            Limit: 50
        };
        const result = await docClient.send(new lib_dynamodb_1.QueryCommand(params));
        const response = {
            message: 'Successfully retrieved records',
            timestamp: new Date().toISOString(),
            count: result.Items?.length || 0,
            items: result.Items || []
        };
        return createResponse(200, response);
    }
    catch (error) {
        const errorResponse = handleError(error);
        return createResponse(errorResponse.statusCode, errorResponse);
    }
};
exports.handler = handler;
