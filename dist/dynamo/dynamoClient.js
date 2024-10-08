"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
// Configure AWS SDK for DynamoDB
aws_sdk_1.default.config.update({
    region: 'us-west-2', // Adjust to your region
});
const dynamoDb = new aws_sdk_1.default.DynamoDB.DocumentClient();
exports.default = dynamoDb;
