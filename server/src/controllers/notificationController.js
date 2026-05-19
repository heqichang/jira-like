const { body, param } = require('express-validator');
const { Notification, User, UserSettings } = require('../models/associations');
const { AppError } = require('../utils/errors');
const validate = require('../middlewares/validate');

const createNotification = async ({ userId, type, title, content, link, io }) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    content: content || '',
    link: link || '',
  });
  
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
  
  const settings = await UserSettings.findOne({ where: { userId } });
  if (settings && settings.emailNotificationsEnabled) {
    // Email sending would be implemented here with a service like Nodemailer
    // For now, we just mark that it should be sent
    notification.emailSent = false;
    await notification.save();
  }
  
  return notification;
};

exports.getMyNotifications = [
  validate,
  async (req, res, next) => {
    try {
      const { unreadOnly } = req.query;
      const where = { userId: req.user.id };
      if (unreadOnly === 'true') where.isRead = false;
      
      const notifications = await Notification.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 50,
      });
      
      const unreadCount = await Notification.count({
        where: { userId: req.user.id, isRead: false },
      });
      
      res.json({
        notifications,
        unreadCount,
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.markAsRead = [
  param('notificationId').isUUID().withMessage('无效的通知ID'),
  validate,
  async (req, res, next) => {
    try {
      const notification = await Notification.findOne({
        where: { id: req.params.notificationId, userId: req.user.id },
      });
      if (!notification) throw new AppError('通知不存在', 404);
      
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
      
      res.json(notification);
    } catch (err) {
      next(err);
    }
  },
];

exports.markAllAsRead = [
  validate,
  async (req, res, next) => {
    try {
      await Notification.update(
        { isRead: true, readAt: new Date() },
        { where: { userId: req.user.id, isRead: false } }
      );
      
      res.json({ message: '所有通知已标记为已读' });
    } catch (err) {
      next(err);
    }
  },
];

exports.deleteNotification = [
  param('notificationId').isUUID().withMessage('无效的通知ID'),
  validate,
  async (req, res, next) => {
    try {
      const notification = await Notification.findOne({
        where: { id: req.params.notificationId, userId: req.user.id },
      });
      if (!notification) throw new AppError('通知不存在', 404);
      
      await notification.destroy();
      res.json({ message: '通知已删除' });
    } catch (err) {
      next(err);
    }
  },
];

exports.getUnreadCount = [
  validate,
  async (req, res, next) => {
    try {
      const count = await Notification.count({
        where: { userId: req.user.id, isRead: false },
      });
      
      res.json({ unreadCount: count });
    } catch (err) {
      next(err);
    }
  },
];

exports.updateNotificationSettings = [
  body('emailNotificationsEnabled').optional().isBoolean(),
  body('pushNotificationsEnabled').optional().isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      let settings = await UserSettings.findOne({ where: { userId: req.user.id } });
      
      if (!settings) {
        settings = await UserSettings.create({
          userId: req.user.id,
          emailNotificationsEnabled: true,
          pushNotificationsEnabled: true,
        });
      }
      
      const { emailNotificationsEnabled, pushNotificationsEnabled } = req.body;
      if (emailNotificationsEnabled !== undefined) {
        settings.emailNotificationsEnabled = emailNotificationsEnabled;
      }
      if (pushNotificationsEnabled !== undefined) {
        settings.pushNotificationsEnabled = pushNotificationsEnabled;
      }
      
      await settings.save();
      res.json(settings);
    } catch (err) {
      next(err);
    }
  },
];

exports.getNotificationSettings = [
  validate,
  async (req, res, next) => {
    try {
      let settings = await UserSettings.findOne({ where: { userId: req.user.id } });
      
      if (!settings) {
        settings = await UserSettings.create({
          userId: req.user.id,
          emailNotificationsEnabled: true,
          pushNotificationsEnabled: true,
        });
      }
      
      res.json(settings);
    } catch (err) {
      next(err);
    }
  },
];

module.exports = {
  ...module.exports,
  createNotification,
};
