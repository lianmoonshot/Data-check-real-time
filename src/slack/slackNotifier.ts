import { WebClient } from '@slack/web-api';
import * as dotenv from 'dotenv';

dotenv.config();

const token = process.env.SLACK_BOT_TOKEN;
const channelId = process.env.SLACK_CHANNEL_ID;

const slackClient = new WebClient(token);

export const sendSlackMessage = async (message: string) => {
    try {
        await slackClient.chat.postMessage({
            channel: channelId!,
            text: message,
        });
    } catch (error) {
        console.error('Error sending message to Slack:', error);
    }
};
