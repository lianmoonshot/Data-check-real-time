import AWS from 'aws-sdk';

// Configure AWS SDK for DynamoDB
AWS.config.update({
    region: 'eu-west-2', // Adjust to your region
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export default dynamoDb;
