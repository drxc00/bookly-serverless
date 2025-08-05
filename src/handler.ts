import type {
    Context,
    APIGatewayProxyStructuredResultV2,
    APIGatewayProxyEventV2,
} from "aws-lambda";
import { BookDocument, BookOutline, Chapter } from "./types";
import { connect, CREDENTIALS, getS3Client, zeptoMailClient } from "./config";
import { generateChapter, generateOutline } from "./generator";
import { buildPDF, chapterHTML, tableOfContentsHTML } from "./builder";
import { generateUUID } from "./utils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
import Book from "./mongoose-schema";
import { promises as fs } from "fs";
import path from "path";


module.exports = {
    generatePreview: async (event: APIGatewayProxyEventV2, _context: Context): Promise<APIGatewayProxyStructuredResultV2> => {

        try {
            const { userId, bookTopic, bookAudience, bookDescription } = JSON.parse(
                JSON.stringify(
                    process.env.IS_OFFLINE ? {
                        "userId": "675ed85750ccb1a651f65553",
                        "bookTopic": "History",
                        "bookAudience": "High School",
                        "bookDescription": "The history of the world"
                    } : event
                )
            );

            // Establish connection and generate outline
            const [, outline]: [void, BookOutline] = await Promise.all([
                connect(), // No return value
                generateOutline({ topic: bookTopic, audience: bookAudience, description: bookDescription }) as Promise<BookOutline>
            ]);

            const chapterOneContent = await generateChapter(outline.chapters.at(0) as Chapter);
            const [tableOfContents, chapterOneHTML] = await Promise.all([
                tableOfContentsHTML({ booktitle: outline.booktitle, chapters: outline.chapters }),
                chapterHTML(chapterOneContent)
            ]);

            const key = `${userId}/${generateUUID()}-preview.pdf`
            const pdfBufferPromise = await buildPDF({
                title: outline.booktitle,
                tableOfContents: tableOfContents,
                chapters: chapterOneHTML
            });
            const addBookPromise = Book.create({
                userId: new mongoose.Types.ObjectId(`${userId}`),
                title: outline.booktitle,
                chapters: outline.chapters,
                previewContent: [chapterOneContent],
                isPreviewGenerated: true,
                isPurchased: false,
                topicPrompt: bookTopic,
                audiencePrompt: bookAudience,
                descriptionPrompt: bookDescription,
                awsPreviewId: key,
                awsFinalId: ""
            });

            const [pdfBuffer, addBook] = await Promise.all([
                pdfBufferPromise,
                addBookPromise
            ])

            // Save to s3
            const s3Client = getS3Client();
            const saveToS3Promise = s3Client.send(
                new PutObjectCommand({
                    Bucket: CREDENTIALS.BUCKET_NAME,
                    Key: key,
                    Body: pdfBuffer,
                    ContentType: "application/pdf",
                })
            );

            await Promise.all([
                saveToS3Promise
            ]);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Book Preview Generated",
                    bookId: addBook._id
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Internal server error",
                    error: (error as Error).message as string,
                    errorStack: (error as Error).stack
                })
            };
        }
    },
    generateFinal: async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {

        try {
            const { userId, bookId, email } = JSON.parse(JSON.stringify(event));
            // Establish connection first
            // Establish connection once and reuse
            const dbConnection = connect();

            // Query database and handle errors early
            const bookPromise = dbConnection.then(() =>
                Book.findOne({ _id: bookId }, { title: 1, chapters: 1, previewContent: 1 }).lean() as Promise<BookDocument | null>
            );

            const book = await bookPromise;
            // Short circuit to return if book not found
            if (!book) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: "Book not found"
                    })
                };
            }

            // Chapters to generate the preview
            const chaptersToGenerate = book.chapters.filter((chapter: Chapter) => (
                !book.previewContent.some((preview: any) => preview.title === chapter.title)
            ));

            // Map over the chapters and generate the preview
            // Wrap in a Promise.all to wait for all the chapters to be generated
            // Then map again over the chapters and generate the HTML
            const generatedChapterContents = await Promise.all(
                chaptersToGenerate.map((chapter: Chapter) => generateChapter(chapter))
            );

            // Append the preview to the generated chapters
            const completeChapterContents = [...book.previewContent, ...generatedChapterContents];

            // Generate table of contents and chapters HTML in parallel
            const [tableOfContents, chaptersHTML] = await Promise.all([
                tableOfContentsHTML({ booktitle: book.title, chapters: book.chapters }),
                Promise.all(completeChapterContents.map(chapterHTML)).then((contents) => contents.join("")),
            ]);

            // Generate the PDF and store it in S3
            const pdfBuffer = await buildPDF({
                title: book.title,
                tableOfContents: tableOfContents,
                chapters: chaptersHTML
            });

            // Save to s3
            const key = `${userId}/${generateUUID()}-final.pdf`
            const s3Client = getS3Client();
            const saveToS3Promise = s3Client.send(
                new PutObjectCommand({
                    Bucket: CREDENTIALS.BUCKET_NAME,
                    Key: key,
                    Body: pdfBuffer,
                    ContentType: "application/pdf",
                })
            );

            // Update the database
            const updateDbPromise = Book.updateOne(
                { _id: bookId },
                { $set: { awsFinalId: key } }
            );

            // Notify user via email
            const zepto = zeptoMailClient
            const templatePath = path.join(__dirname, 'email-template.html');
            const template = await fs.readFile(templatePath, 'utf8');
            const EMAIL_BODY = template
                .replace("{{email}}", email)
                .replace("{{bookTitle}}", book.title)
                .replace("{{bookUrl}}", `${process.env.CLIENT_URL}/book/${bookId}`)
                .replace("{{bookUrlDownload}}", `https://${CREDENTIALS.BUCKET_NAME}.s3.${CREDENTIALS.REGION}.amazonaws.com/${key}`);
                
            // Use zepto to send the email
            const emailPromise = zepto.sendMail({
                "from":
                {
                    "address": "noreply@booklyai.net",
                    "name": "noreply"
                },
                "to":
                    [
                        {
                            "email_address":
                            {
                                "address": email,
                            }
                        }
                    ],
                "subject": "🎉 Your Book is Ready! 🎉",
                "htmlbody": EMAIL_BODY,
            })

            // Await all promises
            await Promise.all([saveToS3Promise, updateDbPromise, emailPromise]);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Final Book Generated"
                })
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: "Internal server error",
                    error: (error as Error).message as string
                })
            };
        }

    },
}