export interface BuildPDFOptions {
    title: string;
    tableOfContents: string;
    chapters: string;
}


export type Chapter = {
    title: string,
    subchapters: {
        title: string
        content?: string
    }[]
}

export type BookChapter = {
    title: string;
    introduction: string;
    subchapters: {
        title: string;
        content: string;
    }[];
    conclusion: string;
}

export type BookOutline = {
    booktitle: string,
    chapters: Chapter[]
}

export type BookDocument = {
    id?: string
    userId?: string
    title: string
    topicPrompt?: string | null | undefined
    audiencePrompt?: string | null | undefined
    descriptionPrompt?: string
    chapters: Chapter[]
    previewContent: BookChapter[]
    isPreviewGenerated?: boolean
    isPurchased?: true | false
    createdAt?: Date
    updatedAt?: Date
}