const isNonEmptyString = (value, minLength = 1) => {
  return typeof value === 'string' && value.trim().length >= minLength;
};

const isNonNegativeNumber = (value) => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
};

const normalizeStringArray = (value) => {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    return null;
  }

  const normalized = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  return normalized;
};

const validateProductPayload = (payload, isUpdate = false) => {
  const errors = [];
  const requiredFields = ['name', 'description', 'price', 'stock', 'brand', 'category'];

  requiredFields.forEach((field) => {
    if (!isUpdate && payload[field] === undefined) {
      errors.push(`${field} is required`);
    }
  });

  if (payload.name !== undefined && !isNonEmptyString(payload.name, 2)) {
    errors.push('name must be at least 2 characters long');
  }

  if (payload.description !== undefined && !isNonEmptyString(payload.description, 20)) {
    errors.push('description must be at least 20 characters long');
  }

  if (payload.price !== undefined && !isNonNegativeNumber(Number(payload.price))) {
    errors.push('price must be a non-negative number');
  }

  if (payload.discountPrice !== undefined && payload.discountPrice !== null && !isNonNegativeNumber(Number(payload.discountPrice))) {
    errors.push('discountPrice must be a non-negative number');
  }

  if (payload.stock !== undefined && !isNonNegativeNumber(Number(payload.stock))) {
    errors.push('stock must be a non-negative number');
  }

  if (payload.brand !== undefined && !isNonEmptyString(payload.brand, 2)) {
    errors.push('brand must be at least 2 characters long');
  }

  if (payload.category !== undefined && !isNonEmptyString(payload.category, 2)) {
    errors.push('category must be at least 2 characters long');
  }

  if (payload.unit !== undefined && !isNonEmptyString(payload.unit, 1)) {
    errors.push('unit must not be empty');
  }

  if (payload.tags !== undefined) {
    const tags = normalizeStringArray(payload.tags);
    if (!tags) {
      errors.push('tags must be an array of strings');
    }
  }

  if (payload.images !== undefined) {
    const images = normalizeStringArray(payload.images);
    if (!images) {
      errors.push('images must be an array of strings');
    }
  }

  return errors;
};

module.exports = {
  validateProductPayload,
  normalizeStringArray,
};
