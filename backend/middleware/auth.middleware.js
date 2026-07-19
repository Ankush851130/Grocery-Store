const AppError = require('../utils/appError');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const tokenFromHeader = authorizationHeader && authorizationHeader.startsWith('Bearer ')
      ? authorizationHeader.split(' ')[1]
      : null;
    const tokenFromCookie = req.cookies?.accessToken;
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to continue.', 401));
    }

    const decoded = verifyAccessToken(token);
    const currentUser = await User.findById(decoded.id).select('+password +refreshToken');

    if (!currentUser) {
      return next(new AppError('The user no longer exists.', 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password was changed recently. Please log in again.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token. Please log in again.', 401));
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles,
};
