import mongoose from 'mongoose';

const announcementSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        targetType: {
            type: String,
            enum: ['all', 'role', 'classroom'],
            default: 'all',
        },
        targetId: {
            type: String, // Can be a role (student/teacher) or classroom ID
            default: null,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
