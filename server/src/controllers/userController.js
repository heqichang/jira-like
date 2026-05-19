const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User } = require('../models/associations');
const { AppError } = require('../utils/errors');
const config = require('../config');
const validate = require('../middlewares/validate');

const signToken = (id) =>
  jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

exports.register = [
  body('email').isEmail().withMessage('请提供有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少6个字符'),
  body('nickname').notEmpty().withMessage('请提供昵称'),
  validate,
  async (req, res, next) => {
    try {
      const { email, password, nickname } = req.body;
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        throw new AppError('该邮箱已被注册', 409);
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.create({
        email,
        password: hashedPassword,
        nickname,
      });
      const token = signToken(user.id);
      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar },
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.login = [
  body('email').isEmail().withMessage('请提供有效的邮箱地址'),
  body('password').notEmpty().withMessage('请提供密码'),
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError('邮箱或密码错误', 401);
      }
      const token = signToken(user.id);
      res.json({
        token,
        user: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar },
      });
    } catch (err) {
      next(err);
    }
  },
];

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'nickname', 'avatar'],
    });
    if (!user) throw new AppError('用户不存在', 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = [
  body('nickname').optional().notEmpty().withMessage('昵称不能为空'),
  body('avatar').optional().isURL().withMessage('头像必须是有效的URL'),
  validate,
  async (req, res, next) => {
    try {
      const { nickname, avatar } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!user) throw new AppError('用户不存在', 404);
      if (nickname !== undefined) user.nickname = nickname;
      if (avatar !== undefined) user.avatar = avatar;
      await user.save();
      res.json({ id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar });
    } catch (err) {
      next(err);
    }
  },
];

exports.changePassword = [
  body('oldPassword').notEmpty().withMessage('请提供旧密码'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码至少6个字符'),
  validate,
  async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);
      if (!(await bcrypt.compare(oldPassword, user.password))) {
        throw new AppError('旧密码错误', 401);
      }
      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();
      res.json({ message: '密码修改成功' });
    } catch (err) {
      next(err);
    }
  },
];
