import { Chapter } from "./types";

const persona = `
You are a well respected author who is writing a book. You are known for your well written, intricate, comprehensive, and engaging content.
You can write any topic, nothing is too difficult for you. Your writing style is very professional and well thought out. You are a master of your craft.
Your books are weel detailed and well researched. You are a master of your craft.
`;

const generateChapterContentPrompt = (chapter: Chapter) => {
    const subChapterTitles = chapter.subchapters.map(sub => sub.title).join(', ');
    return `
    Write a comprehensive and engaging chapter titled "${chapter.title}" adhering to high academic and professional standards. Avoid redundant repetition of the chapter title and headings. Structure the chapter as follows:

    1. **Introduction**:
       - Capture the reader's attention with a compelling opening.
       - Clearly outline the chapter's scope and purpose.
       - Set the context for the exploration of the topic.

    2. **Subchapters**:
       - Develop a thesis-driven narrative for each subchapter (${subChapterTitles}).
       - Incorporate in-depth research, diverse perspectives, and concrete examples.
       - Balance theoretical foundations with practical applications, emphasizing critical analysis.
       - Elaborate on ideas, concepts, and theories to provide deep insights into the topic.

    3. **Formatting**:
       - Do not repeat the chapter title or any headings.
       - Use markdown to structure the content.
       - Include headings, bullet points, numbered lists, tables, code snippets, or block quotes as appropriate.
       - Predominantly use paragraphs for detailed explanations and narrative flow.

    4. **Conclusion**:
       - Summarize the chapter's key findings and insights.
       - Provide actionable recommendations or thought-provoking closing remarks.

    Ensure the content is well-written, engaging, and meticulously researched, delivering value to readers with clear, concise, and polished prose.
    `;
}

const generateOutlinePrompt = (topic: string, audience: string, description: string) => {
    return `
    Generate a comprehensive and well-researched outline for a book of the topic "${topic}" for the audience "${audience}" ${description ? `with a description of ${description}` : ""}. 
    It should have more thatn 5 chapters.
    Your output should be in JSON format and should strictly follow the outline format.
    `;
}

// Export the prompts
export const Prompts = {
    generateChapterContentPrompt,
    persona,
    generateOutlinePrompt
};