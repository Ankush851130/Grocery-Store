const Product = require('../models/product.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { validateProductPayload, normalizeStringArray } = require('../validators/product.validators');

const buildProductFilter = (query) => {
  const filter = { isPublished: true };

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
      { brand: { $regex: query.search, $options: 'i' } },
      { category: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.category) {
    filter.category = { $regex: query.category, $options: 'i' };
  }

  if (query.brand) {
    filter.brand = { $regex: query.brand, $options: 'i' };
  }

  if (query.isFeatured !== undefined) {
    filter.isFeatured = query.isFeatured === 'true';
  }

  if (query.isPublished !== undefined) {
    filter.isPublished = query.isPublished === 'true';
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};

    if (query.minPrice !== undefined) {
      filter.price.$gte = Number(query.minPrice);
    }

    if (query.maxPrice !== undefined) {
      filter.price.$lte = Number(query.maxPrice);
    }
  }

  return filter;
};

const buildSortConfig = (sortBy, sortOrder) => {
  const allowedFields = new Set(['createdAt', 'price', 'ratingAverage', 'stock', 'name']);
  const normalizedSortBy = allowedFields.has(sortBy) ? sortBy : 'createdAt';
  const normalizedSortOrder = sortOrder === 'asc' ? 1 : -1;

  return { [normalizedSortBy]: normalizedSortOrder };
};

const createProduct = asyncHandler(async (req, res, next) => {
  const validationErrors = validateProductPayload(req.body, false);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const payload = {
    ...req.body,
    price: Number(req.body.price),
    discountPrice: req.body.discountPrice !== undefined && req.body.discountPrice !== null
      ? Number(req.body.discountPrice)
      : null,
    stock: Number(req.body.stock),
    tags: normalizeStringArray(req.body.tags),
    images: normalizeStringArray(req.body.images),
    createdBy: req.user._id,
  };

  const product = await Product.create(payload);

  return res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: {
      product,
    },
  });
});

const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const skip = (page - 1) * limit;
  const filter = buildProductFilter(req.query);
  const sort = buildSortConfig(req.query.sortBy, req.query.sortOrder);

  const [products, totalProducts] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email role'),
    Product.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      products,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
      },
      filters: {
        search: req.query.search || '',
        category: req.query.category || '',
        brand: req.query.brand || '',
      },
    },
  });
});

const getProductBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug }).populate('createdBy', 'name email role');

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  return res.status(200).json({
    success: true,
    data: {
      product,
    },
  });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const validationErrors = validateProductPayload(req.body, true);

  if (validationErrors.length > 0) {
    return next(new AppError(validationErrors.join(', '), 400));
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  const updates = { ...req.body };

  if (updates.price !== undefined) {
    updates.price = Number(updates.price);
  }

  if (updates.discountPrice !== undefined) {
    updates.discountPrice = updates.discountPrice === null || updates.discountPrice === ''
      ? null
      : Number(updates.discountPrice);
  }

  if (updates.stock !== undefined) {
    updates.stock = Number(updates.stock);
  }

  if (updates.tags !== undefined) {
    updates.tags = normalizeStringArray(updates.tags);
  }

  if (updates.images !== undefined) {
    updates.images = normalizeStringArray(updates.images);
  }

  if (updates.name !== undefined) {
    product.name = updates.name;
  }

  Object.assign(product, updates);
  await product.save();

  return res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: {
      product,
    },
  });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  return res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);
  const products = await Product.find({ isFeatured: true, isPublished: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'name email role');

  return res.status(200).json({
    success: true,
    data: {
      products,
    },
  });
});

const getLatestProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);
  const products = await Product.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'name email role');

  return res.status(200).json({
    success: true,
    data: {
      products,
    },
  });
});

const getBestSellers = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20);
  const products = await Product.find({ isPublished: true })
    .sort({ ratingAverage: -1, ratingCount: -1 })
    .limit(limit)
    .populate('createdBy', 'name email role');

  return res.status(200).json({
    success: true,
    data: {
      products,
    },
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getLatestProducts,
  getBestSellers,
};
