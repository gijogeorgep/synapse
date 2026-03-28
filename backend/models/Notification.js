import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null
    }, // If null, it's a broadcast
    targetRole: { 
        type: String, 
        enum: ['all', 'student', 'teacher', 'admin', 'superadmin'], 
        default: 'all' 
    },
    targetClassroom: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Classroom',
        default: null
    }, // Broadcast to classroom
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['system', 'material', 'exam', 'classroom', 'general', 'announcement'], 
        default: 'general' 
    },
    link: { type: String, default: null }, // Optional URL to redirect to
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who have read it
    hiddenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Users who have cleared it
}, { timestamps: true });

// Add index for faster query performance
notificationSchema.index({ recipient: 1, targetRole: 1, targetClassroom: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
