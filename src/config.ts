import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";
import mongoose from "mongoose";
import OpenAI from "openai";
const { SendMailClient }: any = require("zeptomail");


// Config variables for AWS SDKs
export const CREDENTIALS = {
    BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME as string,
    REGION: process.env.CUSTOM_AWS_REGION as string,
    AWS_ACCESS_KEY_ID: process.env.CUSTOM_AWS_ACCESS_KEY_ID as string,
    AWS_SECRET_ACCESS_KEY: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY as string
}

// Create an instance of the S3Client
let s3Client: S3Client;
let sesClient: SESClient
export const getS3Client = (): S3Client => {
    if (!s3Client) {
        s3Client = new S3Client({
            region: CREDENTIALS.REGION,
            credentials: {
                accessKeyId: CREDENTIALS.AWS_ACCESS_KEY_ID,
                secretAccessKey: CREDENTIALS.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Client;
};

export const getSESClient = (): SESClient => {
    if (!sesClient) {
        sesClient = new SESClient({
            region: CREDENTIALS.REGION,
            credentials: {
                accessKeyId: CREDENTIALS.AWS_ACCESS_KEY_ID,
                secretAccessKey: CREDENTIALS.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    return sesClient
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Mongoose client
const mongoUrl: any = process.env.MONGODB_URI;
export const connect = async () => {
    if (mongoose.connections[0].readyState) return;

    try {
        await mongoose.connect(mongoUrl);
    } catch (err) {
        throw new Error("Error With Database Connection: " + err);
    }
}

export const zeptoMailClient = new SendMailClient({
    url: process.env.ZEPTO_MAIL_URL,
    token: process.env.ZEPTO_MAIL_TOKEN
});
