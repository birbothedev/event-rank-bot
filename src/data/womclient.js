import dotenv from 'dotenv';
import { WOMClient } from '@wise-old-man/utils';

dotenv.config();

export const client = new WOMClient({
    apiKey: process.env.API_KEY,
    userAgent: process.env.USER_AGENT
});
