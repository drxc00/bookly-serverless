import { BookChapter, BookOutline, BuildPDFOptions } from "./types";
import { MarkdownToHTML } from "./utils";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { promises as fs } from 'fs';
import path from "path";


export async function tableOfContentsHTML(bookOutline: BookOutline): Promise<string> {
    const { chapters } = bookOutline;

    let htmlElements: string = "";

    try {
        htmlElements += "<h1>Table of Contents</h1>\n";

        const chaptersList: string[] = [];

        for (const chapter of chapters) {
            let subChaptersList: string = "";
            // Iterate over the subchapters
            for (const subChapter of chapter.subchapters) {
                subChaptersList += `<li>${subChapter.title}</li>\n`;
            }
            // Add the chapter and its subchapters to the list
            chaptersList.push(`<div><h2>${chapter.title}</h2><ol>${subChaptersList}</ol></div>`);
        }

        htmlElements += "<ol>\n";
        htmlElements += chaptersList.map(chapter => {
            return `<li>${chapter}</li>\n`;
        }).join('');  // Join the array to create a single string of all chapters

        htmlElements += "</ol>\n"; // Close the outer <ol> tag

    } catch (error) {
        console.error(error);
    }

    return htmlElements;
}

export async function chapterHTML(chapter: BookChapter): Promise<string> {

    let chapterContent: string = "";

    chapterContent += `
        <div class="introduction">
        ${MarkdownToHTML(chapter.introduction as string)}
        </div>
    `

    for (const subChapter of chapter.subchapters) {
        chapterContent += `
            <div class="subchapter section">
            <h3>${subChapter.title}</h3>
            ${MarkdownToHTML(subChapter.content as string)}
            </div>
        `
    }

    // Conclusion
    chapterContent += `
        <div class="conclusion">
        ${MarkdownToHTML(chapter.conclusion as string)}
        </div>
    `

    return `
        <div class="chapter">
        <h2>${chapter.title}</h2>
        ${chapterContent}
        </div>
        <br />
    `
}

export async function buildPDF({
    title,
    tableOfContents,
    chapters
}: BuildPDFOptions): Promise<Uint8Array> {
    // Generate the full HTML content
    const templatePath = path.join(__dirname, 'pdf-template.html');
    const template = await fs.readFile(templatePath, 'utf8');

    // Replace placeholders with dynamic content
    const html = template
        .replace('{{pdfTitle}}', title)
        .replace('{{bookTitle}}', title)
        .replace('{{tableOfContents}}', tableOfContents)
        .replace('{{chapters}}', chapters);

    // const html = buildFullHtml({ title, tableOfContents, chapters });

    // Create a Puppeteer browser instance

    const browser = await puppeteer.launch({
        args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',  // Prevent shared memory issues
            '--single-process',         // Run in a single process
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: (
            // For testing in local
            process.env.IS_OFFLINE ?
                await require('puppeteer').executablePath() :
                await chromium.executablePath(
                    "/opt/nodejs/node_modules/@sparticuz/chromium/bin"
                )
        ),
        headless: chromium.headless || true,
    });

    const page = await browser.newPage();

    // Set the content of the page
    await page.setContent(html, {
        waitUntil: "domcontentloaded",
    });

    // Generate the PDF
    const pdfBuffer = await page.pdf({
        format: "LETTER",
        printBackground: true,
        margin: {
            top: '80px',
            right: '80px',
            bottom: '80px',
            left: '80px',
        },
        displayHeaderFooter: true, // Enable header and footer
        headerTemplate: `
            <div style="font-size:10px; text-align:left; width:100%; color:gray;">
            </div>
        `,
        footerTemplate: `
            <div style="font-size:10px; text-align:center; width:100%; color:gray;">
                Page <span class="pageNumber"></span> of <span class="totalPages"></span>
            </div>
        `,
    });
    // Close the browser
    await browser.close();
    // Return the PDF buffer
    return pdfBuffer;
}