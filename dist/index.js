"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv")); // Import dotenv to load .env variables
const aws_sdk_1 = __importDefault(require("aws-sdk")); // Import AWS SDK
const dynamoOperations_1 = require("./dynamo/dynamoOperations"); // Your DynamoDB operation
// Load the .env file
dotenv.config();
// Update AWS SDK configuration with credentials from .env
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Load from .env
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Load from .env
    region: process.env.AWS_REGION // Load from .env
});
// Function to insert a test variant into DynamoDB
const runTest = () => __awaiter(void 0, void 0, void 0, function* () {
    const variant = {
        key: 'vpnpros.com/apple_IND_D.html', // Example dynamic key
        testName: 'Lian Test DynamoDB',
        testID: 9000,
        pagePaths: ['/apple_ISR_D-616-A.html', '/apple_ISR_D-616-B.html'],
        variants: ['A', 'B'],
        weights: [0.5, 0.5],
    };
    // Insert test variant into DynamoDB
    yield (0, dynamoOperations_1.insertTestVariant)(variant);
});
// Run the example
runTest();
