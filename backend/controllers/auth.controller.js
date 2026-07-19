const User = require('../models/user.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const getCookieOptions = require('../utils/cookieOptions');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const {
  registerUserValidator,
  loginUserValidator,
  updatePasswordValidator,
} = require('../validators/auth.validators');

const buildAuthTokens = async (user) => {
  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const sendAuthResponse = async (res, user, statusCode = 200) => {
  const { accessToken, refreshToken } = await buildAuthTokens(user);
  const cookieOptions = getCookieOptions();

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message: 'Authentication successful',
    data: {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    },
  });
};

const register = asyncHandler(async (req, res, next) => {
  const validationErrors = registerUserValidator(req.body);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const { name, email, password, phone = '', avatar = '' } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new AppError('Email is already registered', 409));
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    avatar,
  });

  return sendAuthResponse(res, user, 201);
});

const login = asyncHandler(async (req, res, next) => {
  const validationErrors = loginUserValidator(req.body);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +refreshToken');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return next(new AppError('Invalid email or password', 401));
  }

  return sendAuthResponse(res, user, 200);
});

const logout = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  const cookieOptions = getCookieOptions();
  res.clearCookie('accessToken', { ...cookieOptions, maxAge: undefined });
  res.clearCookie('refreshToken', { ...cookieOptions, maxAge: undefined });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return next(new AppError('Refresh token is required', 401));
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }

  const user = await User.findById(decoded.id).select('+refreshToken +password');

  if (!user || user.refreshToken !== token) {
    return next(new AppError('Refresh token is not valid', 401));
  }

  const accessToken = signAccessToken({ id: user._id.toString(), role: user.role });
  const newRefreshToken = signRefreshToken({ id: user._id.toString(), role: user.role });

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  const cookieOptions = getCookieOptions();
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', newRefreshToken, cookieOptions);

  return res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      user: user.toSafeObject(),
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user.toSafeObject(),
    },
  });
});

const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, avatar } = req.body;
  const updates = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return next(new AppError('Name must be at least 2 characters long', 400));
    }
    updates.name = name.trim();
  }

  if (phone !== undefined) {
    updates.phone = phone;
  }

  if (avatar !== undefined) {
    updates.avatar = avatar;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toSafeObject(),
    },
  });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const validationErrors = updatePasswordValidator(req.body);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password +refreshToken');

  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 401));
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  user.refreshToken = null;
  await user.save();

  const cookieOptions = getCookieOptions();
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  return res.status(200).json({
    success: true,
    message: 'Password updated successfully. Please log in again.',
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
};
