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
        targetRole: {
            type: String,
            enum: ['all', 'student', 'teacher', 'admin', 'superadmin'],
            default: 'all',
        },
        targetClassroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom',
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
