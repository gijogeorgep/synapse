import express from 'express';
import { getNotifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getNotifications);

router.route('/read-all')
    .patch(protect, markAllNotificationsRead);

router.route('/clear-all')
    .patch(protect, clearAllNotifications);

router.route('/:id/read')
    .patch(protect, markNotificationRead);

export default router;
