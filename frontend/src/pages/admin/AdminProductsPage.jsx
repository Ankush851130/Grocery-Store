import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaRotateRight, FaMagnifyingGlass, FaTrashCan, FaPenToSquare, FaPlus, FaXmark } from 'react-icons/fa6';
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

  const { register, handleSubmit, reset } = useForm({
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
      const response = await adminService.getProducts(params);
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
    loadProducts();
  }, []);

  const onSubmitFilter = async (formValues) => {
    setMessage('');
    await loadProducts({
      search: formValues.search,
      category: formValues.category,
      brand: formValues.brand,
      isFeatured: formValues.isFeatured,
      isPublished: formValues.isPublished,
      page: 1,
    });
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

  return (
    <AdminSectionShell
      title="Manage products"
      description="Review catalog items, add new products, edit pricing and details, or toggle visibility."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
          >
            <FaPlus />
            Add Product
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
          >
            <FaRotateRight />
            Reset
          </button>
        </div>
      }
    >
      {/* Create Product Modal */}
      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Add New Product</h3>
                <p className="text-sm text-slate-500">Fill in the product details to add it to the catalog.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            {createError ? (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {createError}
              </div>
            ) : null}

            <form onSubmit={handleSubmitCreate(handleCreateProduct)} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Product Name *</span>
                  <input
                    type="text"
                    placeholder="e.g. Organic Strawberries"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerCreate('name', { required: 'Name is required' })}
                  />
                  {createErrors.name ? <p className="text-xs text-red-500">{createErrors.name.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Brand *</span>
                  <input
                    type="text"
                    placeholder="e.g. Fresh Farm"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerCreate('brand', { required: 'Brand is required' })}
                  />
                  {createErrors.brand ? <p className="text-xs text-red-500">{createErrors.brand.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Category *</span>
                  <input
                    type="text"
                    placeholder="e.g. Fruits & Vegetables"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerCreate('category', { required: 'Category is required' })}
                  />
                  {createErrors.category ? <p className="text-xs text-red-500">{createErrors.category.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Unit</span>
                  <input
                    type="text"
                    placeholder="e.g. 500g, 1 kg, Pack of 6"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerCreate('unit')}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Regular Price ($) *</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 4.99"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerCreate('price', { required: 'Price is required' })}
                  />
                  {createErrors.price ? <p className="text-xs text-red-500">{createErrors.price.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Discount Price ($)</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 3.99 (Optional)"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerCreate('discountPrice')}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Stock Quantity *</span>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerCreate('stock', { required: 'Stock is required' })}
                  />
                  {createErrors.stock ? <p className="text-xs text-red-500">{createErrors.stock.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Image URL</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerCreate('imageUrl')}
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-700">Description *</span>
                <textarea
                  rows="3"
                  placeholder="Detailed description of the product (minimum 20 characters)..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                  {...registerCreate('description', {
                    required: 'Description is required',
                    minLength: { value: 20, message: 'Description must be at least 20 characters' },
                  })}
                />
                {createErrors.description ? <p className="text-xs text-red-500">{createErrors.description.message}</p> : null}
              </label>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    {...registerCreate('isPublished')}
                  />
                  Publish Item Immediately
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    {...registerCreate('isFeatured')}
                  />
                  Feature on Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:opacity-70"
                >
                  {isCreating ? 'Saving...' : 'Save & Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit Product Modal */}
      {editingProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Edit Product: {editingProduct.name}</h3>
                <p className="text-sm text-slate-500">Update pricing, stock levels, or product details.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            {editError ? (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                {editError}
              </div>
            ) : null}

            <form onSubmit={handleSubmitEdit(handleUpdateProduct)} className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Product Name *</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerEdit('name', { required: 'Name is required' })}
                  />
                  {editErrors.name ? <p className="text-xs text-red-500">{editErrors.name.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Brand *</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerEdit('brand', { required: 'Brand is required' })}
                  />
                  {editErrors.brand ? <p className="text-xs text-red-500">{editErrors.brand.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Category *</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerEdit('category', { required: 'Category is required' })}
                  />
                  {editErrors.category ? <p className="text-xs text-red-500">{editErrors.category.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Unit</span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerEdit('unit')}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Regular Price ($) *</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerEdit('price', { required: 'Price is required' })}
                  />
                  {editErrors.price ? <p className="text-xs text-red-500">{editErrors.price.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Discount Price ($)</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty for no discount"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerEdit('discountPrice')}
                  />
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Stock Quantity *</span>
                  <input
                    type="number"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerEdit('stock', { required: 'Stock is required' })}
                  />
                  {editErrors.stock ? <p className="text-xs text-red-500">{editErrors.stock.message}</p> : null}
                </label>

                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Image URL</span>
                  <input
                    type="url"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                    {...registerEdit('imageUrl')}
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-sm font-semibold text-slate-700">Description *</span>
                <textarea
                  rows="3"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-brand-500"
                  {...registerEdit('description', {
                    required: 'Description is required',
                    minLength: { value: 20, message: 'Description must be at least 20 characters' },
                  })}
                />
                {editErrors.description ? <p className="text-xs text-red-500">{editErrors.description.message}</p> : null}
              </label>

              <div className="flex items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    {...registerEdit('isPublished')}
                  />
                  Published
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    {...registerEdit('isFeatured')}
                  />
                  Featured on Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:opacity-70"
                >
                  {isEditing ? 'Updating...' : 'Update Product Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Filter Form */}
      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" onSubmit={handleSubmit(onSubmitFilter)}>
        <label className="block space-y-2 xl:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Search</span>
          <div className="relative">
            <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Name, description, brand"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              {...register('search')}
            />
          </div>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Category</span>
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" {...register('category')} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Brand</span>
          <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" {...register('brand')} />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Featured</span>
          <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" {...register('isFeatured')}>
            <option value="">All</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Published</span>
          <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" {...register('isPublished')}>
            <option value="">All</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 xl:self-end"
        >
          Filter products
        </button>
      </form>

      {message ? <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div> : null}

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950">{product.name}</p>
                    <p className="text-slate-500">{product.brand} · {product.category}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{formatCurrency(product.discountPrice || product.price)}</td>
                  <td className="px-4 py-4 space-y-2">
                    <AdminBadge tone={product.isPublished ? 'success' : 'warning'}>
                      {product.isPublished ? 'Published' : 'Draft'}
                    </AdminBadge>
                    {product.isFeatured ? <AdminBadge tone="brand">Featured</AdminBadge> : null}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{product.stock}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(product)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
                      >
                        <FaPenToSquare />
                        Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(product)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                      >
                        {product.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(product)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
                      >
                        {product.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
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
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <span>Total products: {pagination.totalProducts}</span>
      </div>
    </AdminSectionShell>
  );
}

export default AdminProductsPage;
