import AWS from 'aws-sdk'; // Import AWS SDK

// Initialize DynamoDB Document Client (it will use the credentials from AWS.config)
const dynamoDb = new AWS.DynamoDB.DocumentClient();

interface TestVariant {
    key: string;
    testName: string;
    testID: number;
    pagePaths: string[];
    variants: string[];
    weights: number[];
}

// Function to insert or update a test variant in DynamoDB
export const insertTestVariant = async (variant: TestVariant): Promise<void> => {
    const params = {
        TableName: 'creator-abtests-variants',  // DynamoDB table name
        Item: {
            key: variant.key,  // Dynamic key
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
        await dynamoDb.put(params).promise();
        console.log(`Record inserted/updated with key: ${variant.key}`);
    } catch (err) {
        console.error('Error inserting/updating record:', err);
    }
};
