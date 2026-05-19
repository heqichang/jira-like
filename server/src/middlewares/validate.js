const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '参数验证失败',
      details: errors.array().map((e) => e.msg),
    });
  }
  next();
};

module.exports = validate;
