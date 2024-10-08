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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTestVariant = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk")); // Import AWS SDK
// Initialize DynamoDB Document Client (it will use the credentials from AWS.config)
const dynamoDb = new aws_sdk_1.default.DynamoDB.DocumentClient();
// Function to insert or update a test variant in DynamoDB
const insertTestVariant = (variant) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        TableName: 'creator-abtests-variants', // DynamoDB table name
        Item: {
            key: variant.key, // Dynamic key
            document: {
                testPages: variant.pagePaths.map((path, index) => ({
                    pagePath: path,
                    variant: variant.variants[index],
                })),
                weights: variant.weights,
                testName: variant.testName,
                testID: variant.testID,
                websiteStrategy: 'SEGMENTS',
            },
        },
    };
    try {
        yield dynamoDb.put(params).promise();
        console.log(`Record inserted/updated with key: ${variant.key}`);
    }
    catch (err) {
        console.error('Error inserting/updating record:', err);
    }
});
exports.insertTestVariant = insertTestVariant;
