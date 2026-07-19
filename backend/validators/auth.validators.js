const registerUserValidator = (payload) => {
  const errors = [];

  if (!payload.name || payload.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push('A valid email address is required');
  }

  if (!payload.password || payload.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  return errors;
};

const loginUserValidator = (payload) => {
  const errors = [];

  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push('A valid email address is required');
  }

  if (!payload.password) {
    errors.push('Password is required');
  }

  return errors;
};

const updatePasswordValidator = (payload) => {
  const errors = [];

  if (!payload.currentPassword) {
    errors.push('Current password is required');
  }

  if (!payload.newPassword || payload.newPassword.length < 8) {
    errors.push('New password must be at least 8 characters long');
  }

  return errors;
};

module.exports = {
  registerUserValidator,
  loginUserValidator,
  updatePasswordValidator,
};
