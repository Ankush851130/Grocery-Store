import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { FaRotateRight, FaMagnifyingGlass, FaTrashCan, FaPenToSquare, FaPlus, FaXmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import adminService from '../../services/adminService';
import productService from '../../services/productService';
import AdminSectionShell from '../../components/admin/AdminSectionShell';
import AdminBadge from '../../components/admin/AdminBadge';
import { formatCurrency } from '../../utils/checkout';

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalProducts: 0, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editError, setEditError] = useState('');

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isCreateOpen || editingProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateOpen, editingProduct]);

  const { register, handleSubmit, reset, getValues } = useForm({
    defaultValues: { search: '', category: '', brand: '', isFeatured: '', isPublished: '' },
  });

  // Create Product Form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      stock: '',
      brand: '',
      category: '',
      unit: '1 pc',
      imageUrl: '',
      isFeatured: false,
      isPublished: true,
    },
  });

  // Edit Product Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: isEditing },
  } = useForm();

  const [createError, setCreateError] = useState('');

  const loadProducts = async (params = {}) => {
    setIsLoading(true);

    try {
      const currentFilterValues = getValues();
      const queryParams = {
        page: params.page !== undefined ? params.page : pagination.page,
        limit: params.limit !== undefined ? params.limit : pagination.limit,
        search: params.search !== undefined ? params.search : currentFilterValues.search,
        category: params.category !== undefined ? params.category : currentFilterValues.category,
        brand: params.brand !== undefined ? params.brand : currentFilterValues.brand,
        isFeatured: params.isFeatured !== undefined ? params.isFeatured : currentFilterValues.isFeatured,
        isPublished: params.isPublished !== undefined ? params.isPublished : currentFilterValues.isPublished,
      };

      const response = await adminService.getProducts(queryParams);
      const responseData = response.data?.data || {};
      setProducts(responseData.products || []);
      setPagination(responseData.pagination || pagination);
    } catch (error) {
      setMessage('Unable to load products right now.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts({ page: 1, limit: 10 });
  }, []);

  const onSubmitFilter = async (formValues) => {
    setMessage('');
    await loadProducts({
      ...formValues,
      page: 1,
      limit: pagination.limit,
    });
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    await loadProducts({ page: newPage });
  };

  const handleLimitChange = async (newLimit) => {
    const limitNum = Number(newLimit);
    await loadProducts({ page: 1, limit: limitNum });
  };

  const handleCreateProduct = async (formData) => {
    setCreateError('');
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        brand: formData.brand,
        category: formData.category,
        unit: formData.unit || '1 pc',
        images: formData.imageUrl
          ? [formData.imageUrl]
          : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
        isFeatured: Boolean(formData.isFeatured),
        isPublished: Boolean(formData.isPublished),
      };

      if (formData.discountPrice !== '' && formData.discountPrice !== null && formData.discountPrice !== undefined) {
        payload.discountPrice = Number(formData.discountPrice);
      }

      await productService.createProduct(payload);
      setIsCreateOpen(false);
      resetCreate();
      reset({ search: '', category: '', brand: '', isFeatured: '', isPublished: '' });
      await loadProducts({ page: 1 });
      setMessage('Product created successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create product.';
      setCreateError(msg);
    }
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    setEditError('');
    resetEdit({
      name: product.name || '',
      brand: product.brand || '',
      category: product.category || '',
      unit: product.unit || '1 pc',
      price: product.price || '',
      discountPrice: product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : '',
      stock: product.stock !== undefined ? product.stock : '',
      imageUrl: product.images?.[0] || '',
      description: product.description || '',
      isFeatured: Boolean(product.isFeatured),
      isPublished: Boolean(product.isPublished),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProduct = async (formData) => {
    if (!editingProduct) return;
    setEditError('');

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        brand: formData.brand,
        category: formData.category,
        unit: formData.unit || '1 pc',
        images: formData.imageUrl ? [formData.imageUrl] : editingProduct.images,
        isFeatured: Boolean(formData.isFeatured),
        isPublished: Boolean(formData.isPublished),
      };

      if (formData.discountPrice !== '' && formData.discountPrice !== null && formData.discountPrice !== undefined) {
        payload.discountPrice = Number(formData.discountPrice);
      } else {
        payload.discountPrice = null;
      }

      await productService.updateProduct(editingProduct._id, payload);
      setEditingProduct(null);
      await loadProducts({ page: pagination.page });
      setMessage(`Product "${formData.name}" updated successfully!`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update product.';
      setEditError(msg);
    }
  };

  const handleReset = async () => {
    reset({ search: '', category: '', brand: '', isFeatured: '', isPublished: '' });
    await loadProducts({ page: 1 });
  };

  const handleTogglePublish = async (product) => {
    await productService.updateProduct(product._id, { isPublished: !product.isPublished });
    await loadProducts({ page: pagination.page });
    setMessage('Product publish status updated successfully.');
  };

  const handleToggleFeatured = async (product) => {
    await productService.updateProduct(product._id, { isFeatured: !product.isFeatured });
    await loadProducts({ page: pagination.page });
    setMessage('Product featured status updated successfully.');
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    await productService.deleteProduct(product._id);
    await loadProducts({ page: pagination.page });
    setMessage('Product deleted successfully.');
  };

  const inputStyle =
    'w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/40';

  return (
    <AdminSectionShell
      title="Manage products"
      description="Review catalog items, add new products, edit pricing and details, or toggle visibility."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:brightness-110"
          >
            <FaPlus />
            Add Product
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <FaRotateRight />
            Reset
          </button>
        </div>
      }
    >
      {/* Create Product Modal */}
      {isCreateOpen
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white">Add New Product</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the product details to add it to the catalog.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <FaXmark className="text-lg" />
                  </button>
                </div>

                {createError ? (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-600 dark:text-red-400">
                    {createError}
                  </div>
                ) : null}

                <form onSubmit={handleSubmitCreate(handleCreateProduct)} className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Product Name *</span>
                      <input
                        type="text"
                        placeholder="e.g. SonicBass Wireless Earbuds"
                        className={inputStyle}
                        {...registerCreate('name', { required: 'Name is required' })}
                      />
                      {createErrors.name ? <p className="text-xs text-red-500">{createErrors.name.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Brand *</span>
                      <input
                        type="text"
                        placeholder="e.g. SonicAudio"
                        className={inputStyle}
                        {...registerCreate('brand', { required: 'Brand is required' })}
                      />
                      {createErrors.brand ? <p className="text-xs text-red-500">{createErrors.brand.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category *</span>
                      <select className={inputStyle} {...registerCreate('category', { required: 'Category is required' })}>
                        <option value="">Select Category</option>
                        <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                        <option value="Mobiles & Accessories">Mobiles & Accessories</option>
                        <option value="Cold Drinks & Juices">Cold Drinks & Juices</option>
                        <option value="Snacks & Munchies">Snacks & Munchies</option>
                        <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                        <option value="Dairy & Eggs">Dairy & Eggs</option>
                        <option value="Personal Care & Beauty">Personal Care & Beauty</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Bakery">Bakery & Quick Meals</option>
                        <option value="Pantry & Oil">Pantry & Oils</option>
                      </select>
                      {createErrors.category ? <p className="text-xs text-red-500">{createErrors.category.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Unit</span>
                      <input
                        type="text"
                        placeholder="e.g. 1 Unit, Pack of 6"
                        className={inputStyle}
                        {...registerCreate('unit')}
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Regular Price (₹) *</span>
                      <input
                        type="number"
                        step="1"
                        placeholder="e.g. 3499"
                        className={inputStyle}
                        {...registerCreate('price', { required: 'Price is required' })}
                      />
                      {createErrors.price ? <p className="text-xs text-red-500">{createErrors.price.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Discount Price (₹)</span>
                      <input
                        type="number"
                        step="1"
                        placeholder="e.g. 2499 (Optional)"
                        className={inputStyle}
                        {...registerCreate('discountPrice')}
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Stock Quantity *</span>
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        className={inputStyle}
                        {...registerCreate('stock', { required: 'Stock is required' })}
                      />
                      {createErrors.stock ? <p className="text-xs text-red-500">{createErrors.stock.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Image URL</span>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        className={inputStyle}
                        {...registerCreate('imageUrl')}
                      />
                    </label>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Description *</span>
                    <textarea
                      rows="3"
                      placeholder="Detailed description of the product (minimum 20 characters)..."
                      className={inputStyle}
                      {...registerCreate('description', {
                        required: 'Description is required',
                        minLength: { value: 20, message: 'Description must be at least 20 characters' },
                      })}
                    />
                    {createErrors.description ? <p className="text-xs text-red-500">{createErrors.description.message}</p> : null}
                  </label>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        {...registerCreate('isPublished')}
                      />
                      Publish Item Immediately
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        {...registerCreate('isFeatured')}
                      />
                      Feature on Homepage
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-indigo-700 disabled:opacity-70"
                    >
                      {isCreating ? 'Saving...' : 'Save & Publish Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {/* Edit Product Modal */}
      {editingProduct
        ? createPortal(
            <div key={editingProduct._id} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950 dark:text-white">Edit Product: {editingProduct.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update pricing, stock levels, or product details.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <FaXmark className="text-lg" />
                  </button>
                </div>

                {editError ? (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-4 text-sm font-semibold text-red-600 dark:text-red-400">
                    {editError}
                  </div>
                ) : null}

                <form onSubmit={handleSubmitEdit(handleUpdateProduct)} className="mt-4 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Product Name *</span>
                      <input
                        type="text"
                        className={inputStyle}
                        {...registerEdit('name', { required: 'Name is required' })}
                      />
                      {editErrors.name ? <p className="text-xs text-red-500">{editErrors.name.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Brand *</span>
                      <input
                        type="text"
                        className={inputStyle}
                        {...registerEdit('brand', { required: 'Brand is required' })}
                      />
                      {editErrors.brand ? <p className="text-xs text-red-500">{editErrors.brand.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category *</span>
                      <select className={inputStyle} {...registerEdit('category', { required: 'Category is required' })}>
                        <option value="">Select Category</option>
                        <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                        <option value="Mobiles & Accessories">Mobiles & Accessories</option>
                        <option value="Cold Drinks & Juices">Cold Drinks & Juices</option>
                        <option value="Snacks & Munchies">Snacks & Munchies</option>
                        <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                        <option value="Dairy & Eggs">Dairy & Eggs</option>
                        <option value="Personal Care & Beauty">Personal Care & Beauty</option>
                        <option value="Home & Kitchen">Home & Kitchen</option>
                        <option value="Bakery">Bakery & Quick Meals</option>
                        <option value="Pantry & Oil">Pantry & Oils</option>
                      </select>
                      {editErrors.category ? <p className="text-xs text-red-500">{editErrors.category.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Unit</span>
                      <input
                        type="text"
                        className={inputStyle}
                        {...registerEdit('unit')}
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Regular Price (₹) *</span>
                      <input
                        type="number"
                        step="1"
                        className={inputStyle}
                        {...registerEdit('price', { required: 'Price is required' })}
                      />
                      {editErrors.price ? <p className="text-xs text-red-500">{editErrors.price.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Discount Price (₹)</span>
                      <input
                        type="number"
                        step="1"
                        placeholder="Leave empty for no discount"
                        className={inputStyle}
                        {...registerEdit('discountPrice')}
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Stock Quantity *</span>
                      <input
                        type="number"
                        className={inputStyle}
                        {...registerEdit('stock', { required: 'Stock is required' })}
                      />
                      {editErrors.stock ? <p className="text-xs text-red-500">{editErrors.stock.message}</p> : null}
                    </label>

                    <label className="block space-y-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Image URL</span>
                      <input
                        type="url"
                        className={inputStyle}
                        {...registerEdit('imageUrl')}
                      />
                    </label>
                  </div>

                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Description *</span>
                    <textarea
                      rows="3"
                      className={inputStyle}
                      {...registerEdit('description', {
                        required: 'Description is required',
                        minLength: { value: 20, message: 'Description must be at least 20 characters' },
                      })}
                    />
                    {editErrors.description ? <p className="text-xs text-red-500">{editErrors.description.message}</p> : null}
                  </label>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        {...registerEdit('isPublished')}
                      />
                      Published
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        {...registerEdit('isFeatured')}
                      />
                      Featured on Homepage
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isEditing}
                      className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-indigo-700 disabled:opacity-70"
                    >
                      {isEditing ? 'Updating...' : 'Update Product Details'}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      {/* Filter Form */}
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={handleSubmit(onSubmitFilter)}>
        <label className="block space-y-2 xl:col-span-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Search</span>
          <div className="relative">
            <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Name, description, brand"
              className={inputStyle}
              {...register('search')}
            />
          </div>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category</span>
          <input className={inputStyle} {...register('category')} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Brand</span>
          <input className={inputStyle} {...register('brand')} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Featured</span>
          <select className={inputStyle} {...register('isFeatured')}>
            <option value="">All</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Published</span>
          <select className={inputStyle} {...register('isPublished')}>
            <option value="">All</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-indigo-700 xl:self-end"
        >
          Filter products
        </button>
      </form>

      {message ? <div className="mt-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 p-4 text-sm font-semibold text-indigo-700 dark:text-indigo-300">{message}</div> : null}

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950 dark:text-white">{product.name}</p>
                    <p className="text-slate-500 dark:text-slate-400">{product.brand} · {product.category}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatCurrency(product.discountPrice || product.price)}</td>
                  <td className="px-4 py-4 space-y-2">
                    <AdminBadge tone={product.isPublished ? 'success' : 'warning'}>
                      {product.isPublished ? 'Published' : 'Draft'}
                    </AdminBadge>
                    {product.isFeatured ? <AdminBadge tone="brand">Featured</AdminBadge> : null}
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{product.stock}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(product)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition hover:bg-indigo-100"
                      >
                        <FaPenToSquare />
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(product)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:border-indigo-400"
                      >
                        {product.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(product)}
                        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:border-indigo-400"
                      >
                        {product.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 transition hover:bg-red-100 dark:hover:bg-red-900/60"
                      >
                        <FaTrashCan />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !products.length ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between shadow-soft">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <span>
            Showing <strong className="font-bold text-slate-900 dark:text-white">{pagination.totalProducts === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}</strong>–<strong className="font-bold text-slate-900 dark:text-white">{Math.min(pagination.page * pagination.limit, pagination.totalProducts)}</strong> of <strong className="font-bold text-slate-900 dark:text-white">{pagination.totalProducts}</strong> products
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Show per page:</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none transition focus:border-indigo-500"
            >
              <option value="10">10 items</option>
              <option value="20">20 items</option>
              <option value="50">50 items</option>
              <option value="100">100 items (All)</option>
            </select>
          </div>
        </div>

        {/* Page navigation controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <FaChevronLeft className="text-[10px]" /> Prev
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
            .map((p, idx, arr) => {
              const prevPage = arr[idx - 1];
              const showEllipsis = prevPage && p - prevPage > 1;

              return (
                <span key={p} className="flex items-center gap-1">
                  {showEllipsis ? <span className="px-1 text-xs text-slate-400">...</span> : null}
                  <button
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition ${
                      p === pagination.page
                        ? 'bg-indigo-600 text-white shadow-soft font-black'
                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              );
            })}

          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || isLoading}
            onClick={() => handlePageChange(pagination.page + 1)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Next <FaChevronRight className="text-[10px]" />
          </button>
        </div>
      </div>
    </AdminSectionShell>
  );
}

export default AdminProductsPage;
