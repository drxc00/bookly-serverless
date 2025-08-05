import { openai } from "./config";
import { Prompts } from "./prompts";
import { BookChapter, BookOutline, Chapter } from "./types";


export async function generateChapter(chapter: Chapter, retries = 2): Promise<BookChapter> {
    let chapterContent;
    // Ensures that the chapterContent is a valid JSON object
    // Retires to generate the chapter if the JSON parsing fails
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: Prompts.persona },
                { role: "user", content: Prompts.generateChapterContentPrompt(chapter) },
            ],
            temperature: 0.3,
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "chapter_content_schema",
                    schema: {
                        type: "object",
                        properties: {
                            title: { type: "string", description: "The title of the chapter" },
                            introduction: { type: "string", description: "The introduction of the chapter" },
                            subchapters: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        title: { type: "string", description: "The title of the subchapter" },
                                        content: { type: "string", description: "The markdown content/paragraphs of the subchapter" },
                                    },
                                },
                            },
                            conclusion: { type: "string", description: "The conclusion of the chapter" },
                        },
                    },
                },
            },
        });
        chapterContent = JSON.parse(completion.choices[0].message.content as string);
    } catch (error) {
        if (error instanceof SyntaxError && error.message.includes('JSON.parse')) {
            // Retries to generate the chapter again and checks the remaining retries.
            // This will prevent infinite recursion.
            if (retries > 0) {
                return await generateChapter(chapter, retries - 1);
            } else {
                return { title: '', introduction: '', subchapters: [], conclusion: '' }; // Fallback value
            }
        } else {
            console.error('An unexpected error occurred:', error);
            throw error; // Re-throw the error if it's not JSON-related
        }
    }
    return chapterContent;
}

interface GenerateOutlineOptions {
    topic: string;
    audience: string;
    description?: string;
}

export async function generateOutline({
    topic,
    audience,
    description
}: GenerateOutlineOptions): Promise<BookOutline> {
    // Construct the prompt to generate the outline
    const outlinePrompt = Prompts.generateOutlinePrompt(topic, audience, description as string);

    // Invokes the OpenAI API to generate the outline
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: Prompts.persona }, // Set The Persona Of the Model
            { role: "user", content: outlinePrompt } // Set The Prompt
        ],
        // We enable response formatting, specifically the JSON schema format
        // The schema defines the structure of the response
        // We detine properties and their respective types, as well as descriptions-
        // -to provide context to the llm.
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "book_outline_schema",
                schema: {
                    type: "object",
                    properties: {
                        booktitle: {
                            type: "string",
                            description: "The title of the book"
                        },
                        chapters: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: {
                                        type: "string",
                                        description: "The title of the chapter"
                                    },
                                    subchapters: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                title: {
                                                    type: "string",
                                                    description: "The title of the subchapter"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }
    });

    // Extract the outline from the response and return as a string.
    return JSON.parse(completion.choices[0].message.content as string);
}