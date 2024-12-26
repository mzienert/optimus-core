"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalvitronStack = void 0;
const cdk = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const lambda = require("aws-cdk-lib/aws-lambda");
const s3 = require("aws-cdk-lib/aws-s3");
const cognito_1 = require("../cognito");
class GalvitronStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const s3CorsRule = {
            allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
            allowedOrigins: ['*'],
            allowedHeaders: ['*'],
            maxAge: 300,
        };
        const s3Bucket = new s3.Bucket(this, 'S3Bucket', {
            bucketName: 'optimus-core-s3',
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            accessControl: s3.BucketAccessControl.PRIVATE,
            cors: [s3CorsRule]
        });
        // Define the Lambda function resource
        const helloWorldFunction = new lambda.Function(this, 'HelloWorldFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'hello.handler',
        });
        new cognito_1.CognitoPool(this, 'MyCognitoPool', {
            stage: 'Beta',
        });
        // Define the API Gateway resource
        const api = new apigateway.LambdaRestApi(this, 'HelloWorldApi', {
            handler: helloWorldFunction,
            proxy: false,
        });
        // Define the '/hello' resource with a GET method
        const helloResource = api.root.addResource('hello');
        helloResource.addMethod('GET');
    }
}
exports.GalvitronStack = GalvitronStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Fsdml0cm9uLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2Fsdml0cm9uLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUduQyx5REFBeUQ7QUFDekQsaURBQWlEO0FBQ2pELHlDQUF5QztBQUV6Qyx3Q0FBeUM7QUFFekMsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLFVBQVUsR0FBZ0I7WUFDOUIsY0FBYyxFQUFFLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDekQsY0FBYyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ3JCLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNyQixNQUFNLEVBQUUsR0FBRztTQUNaLENBQUM7UUFFRixNQUFNLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUMvQyxVQUFVLEVBQUUsY0FBYztZQUMxQixpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztZQUNqRCxhQUFhLEVBQUUsRUFBRSxDQUFDLG1CQUFtQixDQUFDLE9BQU87WUFDN0MsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDO1NBQ25CLENBQUMsQ0FBQztRQUVILHNDQUFzQztRQUN0QyxNQUFNLGtCQUFrQixHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDekUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQ3JDLE9BQU8sRUFBRSxlQUFlO1NBQ3pCLENBQUMsQ0FBQztRQUVILElBQUkscUJBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQ3JDLEtBQUssRUFBRSxNQUFNO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsa0NBQWtDO1FBQ2xDLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQzlELE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsS0FBSyxFQUFFLEtBQUs7U0FDYixDQUFDLENBQUM7UUFFSCxpREFBaUQ7UUFDakQsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEQsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqQyxDQUFDO0NBQ0Y7QUF2Q0Qsd0NBdUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5cbmltcG9ydCB7IENvZ25pdG9Qb29sIH0gZnJvbSAnLi4vY29nbml0byc7XG5cbmV4cG9ydCBjbGFzcyBHYWx2aXRyb25TdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHMzQ29yc1J1bGU6IHMzLkNvcnNSdWxlID0ge1xuICAgICAgYWxsb3dlZE1ldGhvZHM6IFtzMy5IdHRwTWV0aG9kcy5HRVQsIHMzLkh0dHBNZXRob2RzLkhFQURdLFxuICAgICAgYWxsb3dlZE9yaWdpbnM6IFsnKiddLFxuICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnKiddLFxuICAgICAgbWF4QWdlOiAzMDAsXG4gICAgfTtcblxuICAgIGNvbnN0IHMzQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCAnUzNCdWNrZXQnLCB7XG4gICAgICBidWNrZXROYW1lOiAnZ2Fsdml0cm9uLXMzJyxcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICBhY2Nlc3NDb250cm9sOiBzMy5CdWNrZXRBY2Nlc3NDb250cm9sLlBSSVZBVEUsXG4gICAgICBjb3JzOiBbczNDb3JzUnVsZV1cbiAgICB9KTtcbiAgICAgICAgXG4gICAgLy8gRGVmaW5lIHRoZSBMYW1iZGEgZnVuY3Rpb24gcmVzb3VyY2VcbiAgICBjb25zdCBoZWxsb1dvcmxkRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdIZWxsb1dvcmxkRnVuY3Rpb24nLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMjBfWCxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhJyksXG4gICAgICBoYW5kbGVyOiAnaGVsbG8uaGFuZGxlcicsXG4gICAgfSk7XG5cbiAgICBuZXcgQ29nbml0b1Bvb2wodGhpcywgJ015Q29nbml0b1Bvb2wnLCB7XG4gICAgICBzdGFnZTogJ0JldGEnLFxuICAgIH0pO1xuICAgIFxuICAgIC8vIERlZmluZSB0aGUgQVBJIEdhdGV3YXkgcmVzb3VyY2VcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFSZXN0QXBpKHRoaXMsICdIZWxsb1dvcmxkQXBpJywge1xuICAgICAgaGFuZGxlcjogaGVsbG9Xb3JsZEZ1bmN0aW9uLFxuICAgICAgcHJveHk6IGZhbHNlLFxuICAgIH0pO1xuICAgIFxuICAgIC8vIERlZmluZSB0aGUgJy9oZWxsbycgcmVzb3VyY2Ugd2l0aCBhIEdFVCBtZXRob2RcbiAgICBjb25zdCBoZWxsb1Jlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2hlbGxvJyk7XG4gICAgaGVsbG9SZXNvdXJjZS5hZGRNZXRob2QoJ0dFVCcpO1xuICB9XG59Il19