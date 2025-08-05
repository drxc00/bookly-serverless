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

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/bookly-serverless.git
cd bookly-serverless
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

## Configuration

Edit `.env` file with your settings:

```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
EMAIL_FROM=your@email.com
# Other required variables...
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