const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateTrade = [
  body('pair')
    .notEmpty()
    .withMessage('Trading pair is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Invalid trading pair'),
  body('type')
    .isIn(['buy', 'sell'])
    .withMessage('Type must be buy or sell'),
  body('orderType')
    .isIn(['market', 'limit', 'stop_limit'])
    .withMessage('Invalid order type'),
  body('amount')
    .isFloat({ min: 0.00000001 })
    .withMessage('Amount must be greater than 0'),
  body('price')
    .if(body('orderType').equals('limit'))
    .isFloat({ min: 0.00000001 })
    .withMessage('Price is required for limit orders'),
  body('stopPrice')
    .if(body('orderType').equals('stop_limit'))
    .isFloat({ min: 0.00000001 })
    .withMessage('Stop price is required for stop limit orders'),
  body('limitPrice')
    .if(body('orderType').equals('stop_limit'))
    .isFloat({ min: 0.00000001 })
    .withMessage('Limit price is required for stop limit orders'),
  handleValidationErrors
];

const validateWithdrawal = [
  body('currency')
    .notEmpty()
    .withMessage('Currency is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Invalid currency'),
  body('amount')
    .isFloat({ min: 0.00000001 })
    .withMessage('Amount must be greater than 0'),
  body('address')
    .notEmpty()
    .withMessage('Address is required'),
  body('network')
    .notEmpty()
    .withMessage('Network is required'),
  handleValidationErrors
];

const validateDeposit = [
  body('currency')
    .notEmpty()
    .withMessage('Currency is required'),
  body('network')
    .notEmpty()
    .withMessage('Network is required'),
  handleValidationErrors
];

const validateChatMessage = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message too long'),
  handleValidationErrors
];

const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be asc or desc'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateTrade,
  validateWithdrawal,
  validateDeposit,
  validateChatMessage,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};