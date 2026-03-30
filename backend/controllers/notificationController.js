import Notification from '../models/Notification.js';
import Classroom from '../models/Classroom.js';

// @desc    Get user's notifications
// @route   GET /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        
        // Find which classrooms the user is assigned to
        const assignedClassrooms = await Classroom.find({
            $or: [{ students: userId }, { teachers: userId }]
        }, '_id');
        const classroomIds = assignedClassrooms.map(c => c._id.toString());
        
        // Include any explicitly enrolled classrooms
        if (req.user.enrolledClassrooms?.length > 0) {
            req.user.enrolledClassrooms.forEach(id => {
                if (!classroomIds.includes(id.toString())) {
                    classroomIds.push(id.toString());
                }
            });
        }
        
        const notifications = await Notification.find({
            $or: [
                { recipient: userId }, 
                { 
                  recipient: null,
                  targetRole: { $in: [userRole, 'all'] },
                  $or: [
                    { targetClassroom: null },
                    { targetClassroom: { $in: classroomIds } }
                  ]
                }
            ],
            hiddenBy: { $ne: userId }
        })
        .sort({ createdAt: -1 })
        .limit(50); // Get latest 50

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark a specific notification as read
// @route   PATCH /api/notifications/:id/read
export const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Add user to readBy array if not already present
        if (!notification.readBy.includes(req.user._id)) {
            notification.readBy.push(req.user._id);
            await notification.save();
        }

        res.json({ message: 'Notification marked as read', _id: notification._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all unread notifications as read
// @route   PATCH /api/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        // Find which classrooms the user is assigned to
        const assignedClassrooms = await Classroom.find({
            $or: [{ students: userId }, { teachers: userId }]
        }, '_id');
        const classroomIds = assignedClassrooms.map(c => c._id.toString());
        
        // Include any explicitly enrolled classrooms
        if (req.user.enrolledClassrooms?.length > 0) {
            req.user.enrolledClassrooms.forEach(id => {
                if (!classroomIds.includes(id.toString())) {
                    classroomIds.push(id.toString());
                }
            });
        }

        // Find relevant notifications that the user hasn't read yet
        const unreadNotifications = await Notification.find({
            $or: [
                { recipient: userId },
                { 
                  recipient: null,
                  targetRole: { $in: [userRole, 'all'] },
                  $or: [
                    { targetClassroom: null },
                    { targetClassroom: { $in: classroomIds } }
                  ]
                }
            ],
            readBy: { $ne: userId },
            hiddenBy: { $ne: userId }
        });

        // Add user to readBy array for all unread notifications
        const updates = unreadNotifications.map(notification => {
            notification.readBy.push(userId);
            return notification.save();
        });

        await Promise.all(updates);

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Clear all notifications for the user (soft-delete)
// @route   PATCH /api/notifications/clear-all
export const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        // Find which classrooms the user is assigned to
        const assignedClassrooms = await Classroom.find({
            $or: [{ students: userId }, { teachers: userId }]
        }, '_id');
        const classroomIds = assignedClassrooms.map(c => c._id.toString());
        
        // Include explicitly enrolled classrooms
        if (req.user.enrolledClassrooms?.length > 0) {
            req.user.enrolledClassrooms.forEach(id => {
                if (!classroomIds.includes(id.toString())) {
                    classroomIds.push(id.toString());
                }
            });
        }

        // Find all notifications that could be visible to this user and aren't already hidden
        const visibleNotifications = await Notification.find({
            $or: [
                { recipient: userId },
                { 
                  recipient: null,
                  targetRole: { $in: [userRole, 'all'] },
                  $or: [
                    { targetClassroom: null },
                    { targetClassroom: { $in: classroomIds } }
                  ]
                }
            ],
            hiddenBy: { $ne: userId }
        });

        // Add user to hiddenBy array for all visible notifications
        const updates = visibleNotifications.map(notification => {
            if (!notification.hiddenBy.includes(userId)) {
                notification.hiddenBy.push(userId);
            }
            // Also mark as read if clearing, for consistency in counts
            if (!notification.readBy.includes(userId)) {
                notification.readBy.push(userId);
            }
            return notification.save();
        });

        await Promise.all(updates);

        res.json({ message: 'All notifications cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
