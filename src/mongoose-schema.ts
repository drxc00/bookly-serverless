import mongoose, { Schema } from "mongoose";

const SubchapterSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: false },  // Optional content, per the type definition
});

const ChapterSchema = new Schema({
    title: { type: String, required: true },
    subchapters: { type: [SubchapterSchema], required: true }, // Array of subchapters
});

const BookChapterSchema = new Schema({
    title: { type: String, required: true },
    introduction: { type: String, required: true },
    subchapters: {
        type: [SubchapterSchema],
        required: true
    },
    conclusion: { type: String, required: true },
});

const BookSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, unique: true },
    topicPrompt: { type: String, required: false },  // optional, based on your type
    audiencePrompt: { type: String, required: false },  // optional, based on your type
    descriptionPrompt: { type: String, required: false },  // optional, based on your type
    chapters: { type: [ChapterSchema], required: true },
    previewContent: { type: [BookChapterSchema], required: true },
    isPreviewGenerated: { type: Boolean, default: false },
    isPurchased: { type: Boolean, default: false },
    awsPreviewId: { type: String, required: false },
    awsFinalId: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { collection: 'Books' });

// Export the model
export default mongoose.models.Books || mongoose.model("Books", BookSchema);
