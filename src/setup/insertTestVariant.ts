import * as dotenv from 'dotenv';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

dotenv.config();

const dynamoDbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'eu-west-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

export const insertTestVariant = async (): Promise<string> => {
    const variant = {
        key: 'https://liandonttouch.creatorsite.net/compare_1_category_ABW_T.html',
        testPages: [
            { pagePath: '/compare_1_category_ABW_T-A.html', variant: 'A' },
            { pagePath: '/compare_1_category_ABW_T-B.html', variant: 'B' }
        ],
        weights: [0.5, 0.5],
        testName: 'test name test',
        testID: 9403,
        websiteStrategy: 'SEGMENTS',
    };

    const params = {
        TableName: 'creator-abtests-variants',
        Item: {
            key: variant.key,
            document: JSON.stringify({
                testPages: variant.testPages,
                weights: variant.weights,
                testName: variant.testName,
                testID: variant.testID,
                websiteStrategy: variant.websiteStrategy,
            }),
        },
    };

    try {
        const command = new PutCommand(params);
        await ddbDocClient.send(command);
        console.log(`Record inserted/updated with key: ${variant.key}`);
        return variant.key;
    } catch (err) {
        console.error('Error inserting/updating record:', err);
        throw err;
    }
};
