import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import stringWidth from 'string-width';
import { v4 as uuidv4 } from 'uuid';

export function MarkdownToHTML(markdownContent: string): string {
    // Convert markdown to HTML
    const rawHtml = remark()
        .use(remarkParse)
        .use(remarkGfm, { stringLength: stringWidth })
        .use(remarkHtml) // Use the remark-html plugin to convert to HTML
        .processSync(markdownContent) // Process the markdown
        .toString(); // Convert the AST to raw HTML string
    return rawHtml
}

export function generateUUID(): string {
    return uuidv4();
}