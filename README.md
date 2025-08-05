# Booklyai Serverless Function [Archived]

⚠️ **Project Status**: This project is now archived and open-sourced. It is no longer actively maintained.

## Overview

A serverless function for generating AI ebooks. Used as backend for [Booklyai](https://github.com/drxc00/booklyai). Built with:

- AWS Lambda
- Serverless Framework
- TypeScript

## Features

- 📖 Generates book previews with first chapter
- 📚 Creates complete books with all chapters
- ✨ Uses OpenAI for content generation
- 📦 Stores PDFs in AWS S3
- ✉️ Sends email notifications via ZeptoMail
- 🏗️ Built with Serverless Framework
- 🚀 Easy deployment to AWS


## Configuration

Edit `.env` file with your settings:

```env
OPENAI_API_KEY =
AWS_S3_BUCKET_NAME = 
CUSTOM_AWS_REGION =
CUSTOM_AWS_ACCESS_KEY_ID = 
CUSTOM_AWS_SECRET_ACCESS_KEY = 
MONGODB_URI=
ZEPTO_MAIL_URL=
ZEPTO_MAIL_TOKEN
```

## Configuration

The `serverless.yml` file contains the main configuration:
- AWS region: ap-southeast-2
- Runtime: Node.js 20.x
- Timeout: 900 seconds (15 minutes)
- Chromium layer for PDF generation

## Deployment

Deploy to AWS using Serverless Framework:

```bash
npx serverless deploy
```

## Contributing

Since this project is archived, contributions are welcome but may not be actively reviewed. Please fork the repository if you wish to maintain your own version.

## License

[MIT License](LICENSE)