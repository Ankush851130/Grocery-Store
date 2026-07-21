import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  FaArrowLeft,
  FaFilter,
  FaList,
  FaMagnifyingGlass,
  FaRotateLeft,
  FaSliders,
  FaTableCells,
  FaXmark,
} from 'react-icons/fa6';
import { Link, useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import ProductCard from '../../components/products/ProductCard';
import ProductSkeletonCard from '../../components/products/ProductSkeletonCard';

const CATEGORY_OPTIONS = [
  { label: 'All Products', value: '' },
  { label: 'Cold Drinks & Juices', value: 'Cold Drinks & Juices' },
  { label: 'Snacks & Munchies', value: 'Snacks & Munchies' },
  { label: 'Mobiles & Accessories', value: 'Mobiles & Accessories' },
  { label: 'Electronics & Gadgets', value: 'Electronics & Gadgets' },
  { label: 'Fruits & Vegetables', value: 'Fruits & Vegetables' },
  { label: 'Dairy & Eggs', value: 'Dairy & Eggs' },
  { label: 'Personal Care & Beauty', value: 'Personal Care & Beauty' },
  { label: 'Home & Kitchen', value: 'Home & Kitchen' },
];

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  brand: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  isFeatured: '',
  limit: '20',
};

const normalizeQueryValue = (value) => {
  return typeof value === 'string' ? value : '';
};

function ProductCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalProducts: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ category: '', brand: '', search: '' });

  // Display View Mode: 'compact' | 'comfort' | 'list'
  const [viewMode, setViewMode] = useState('compact');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const initialFilters = useMemo(() => {
    return {
      search: normalizeQueryValue(searchParams.get('search')),
      category: normalizeQueryValue(searchParams.get('category')),
      brand: normalizeQueryValue(searchParams.get('brand')),
      minPrice: normalizeQueryValue(searchParams.get('minPrice')),
      maxPrice: normalizeQueryValue(searchParams.get('maxPrice')),
      sortBy: normalizeQueryValue(searchParams.get('sortBy')) || DEFAULT_FILTERS.sortBy,
      sortOrder: normalizeQueryValue(searchParams.get('sortOrder')) || DEFAULT_FILTERS.sortOrder,
      isFeatured: normalizeQueryValue(searchParams.get('isFeatured')),
      limit: normalizeQueryValue(searchParams.get('limit')) || '20',
    };
  }, [searchParams]);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: initialFilters,
  });

  useEffect(() => {
    reset(initialFilters);
  }, [initialFilters, reset]);

  useEffect(() => {
    let isActive = true;

    const fetchProducts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const params = Object.fromEntries(searchParams.entries());
        if (!params.limit) params.limit = '20';

        const response = await productService.getProducts(params);
        const responseData = response.data?.data || {};

        if (!isActive) return;

        setProducts(responseData.products || []);
        setPagination(responseData.pagination || pagination);
        setSummary(responseData.filters || { category: '', brand: '', search: '' });
      } catch (requestError) {
        if (!isActive) return;
        setError('Failed to load products right now. Please try again.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [searchParams]);

  const applyFilters = (formValues) => {
    const nextParams = new URLSearchParams();

    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        nextParams.set(key, String(value));
      }
    });

    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    reset(DEFAULT_FILTERS);
    setSearchParams({ page: '1', limit: '20' });
  };

  const handleCategoryPillClick = (categoryVal) => {
    setValue('category', categoryVal);
    const nextParams = new URLSearchParams(searchParams);
    if (categoryVal) {
      nextParams.set('category', categoryVal);
    } else {
      nextParams.delete('category');
    }
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const removeFilterTag = (key) => {
    setValue(key, '');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(key);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const goToPage = (page) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(page));
    setSearchParams(nextParams);
  };

  const currentPage = Number(searchParams.get('page') || '1');
  const activeSearch = watch('search');
  const activeCategory = watch('category');
  const activeBrand = watch('brand');

  const hasActiveFilters = Boolean(
    activeSearch || activeCategory || activeBrand || 
    searchParams.get('minPrice') || searchParams.get('maxPrice') || searchParams.get('isFeatured')
  );

  return (
    <section className="space-y-6 pb-16">
      {/* Top Banner & Heading */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 sm:p-10 text-white shadow-soft">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-brand-300 transition"
            >
              <FaArrowLeft /> Back to home
            </Link>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Fresh Grocery Superstore & Catalog
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore hundreds of fresh fruits, cold beverages, snacks, mobile gadgets, and daily essentials delivered right to your doorstep.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur border border-white/15 text-center min-w-[140px]">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-300">Total Catalog</p>
              <p className="mt-1 text-3xl font-black text-white">{pagination.totalProducts}</p>
              <p className="text-[10px] text-slate-400">Products available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Category Pill Selector Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Categories
          </p>
          <span className="text-xs text-slate-400">Scroll to view all &rarr;</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = (activeCategory || '') === cat.value;
            return (
              <button
                key={cat.value || 'all'}
                type="button"
                onClick={() => handleCategoryPillClick(cat.value)}
                className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-brand-300'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls Bar: Search + Filter Drawer Toggle + View Mode Toggle */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main Search Box */}
          <form
            onSubmit={handleSubmit(applyFilters)}
            className="relative flex-1"
          >
            <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products, brands, groceries..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 pl-11 pr-24 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              {...register('search')}
            />
            {activeSearch ? (
              <button
                type="button"
                onClick={() => removeFilterTag('search')}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FaXmark className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
            >
              Search
            </button>
          </form>

          {/* Filter Drawer Toggle & View Mode Buttons */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <button
              type="button"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition ${
                showFilterDrawer || hasActiveFilters
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <FaSliders />
              <span>Filters</span>
              {hasActiveFilters ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">
                  !
                </span>
              ) : null}
            </button>

            {/* Layout View Switcher */}
            <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`flex h-8 px-2.5 items-center justify-center rounded-xl text-xs font-bold transition ${
                  viewMode === 'compact'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Compact Grid (5 cols)"
              >
                <FaTableCells className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex h-8 px-2.5 items-center justify-center rounded-xl text-xs font-bold transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <FaList className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Tags Bar */}
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active Filters:</span>

            {activeSearch ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 px-2.5 py-1 text-xs font-bold text-brand-700 dark:text-brand-300">
                Search: "{activeSearch}"
                <button type="button" onClick={() => removeFilterTag('search')}>
                  <FaXmark className="h-3 w-3 hover:text-brand-900" />
                </button>
              </span>
            ) : null}

            {activeCategory ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                Category: {activeCategory}
                <button type="button" onClick={() => removeFilterTag('category')}>
                  <FaXmark className="h-3 w-3 hover:text-indigo-900" />
                </button>
              </span>
            ) : null}

            {activeBrand ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
                Brand: {activeBrand}
                <button type="button" onClick={() => removeFilterTag('brand')}>
                  <FaXmark className="h-3 w-3 hover:text-purple-900" />
                </button>
              </span>
            ) : null}

            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-red-600 hover:underline pl-2"
            >
              Clear All
            </button>
          </div>
        ) : null}

        {/* Expandable Advanced Filter Drawer */}
        {showFilterDrawer && (
          <form
            onSubmit={handleSubmit(applyFilters)}
            className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500">Brand</span>
                <input
                  type="text"
                  placeholder="e.g. Amul, Aashirvaad"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                  {...register('brand')}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500">Min Price (₹)</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                  {...register('minPrice')}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500">Max Price (₹)</span>
                <input
                  type="number"
                  min="0"
                  placeholder="999"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                  {...register('maxPrice')}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-bold uppercase text-slate-500">Sort By</span>
                <select
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                  {...register('sortBy')}
                >
                  <option value="createdAt">Newest Arrival</option>
                  <option value="price">Price</option>
                  <option value="ratingAverage">Top Rated</option>
                  <option value="stock">Stock Quantity</option>
                  <option value="name">Product Name</option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                <FaRotateLeft className="inline mr-1" /> Reset
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
              >
                Apply Advanced Filters
              </button>
            </div>
          </form>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          {error}
        </div>
      ) : null}

      {/* Product Items Display Container */}
      <div
        className={
          viewMode === 'list'
            ? 'flex flex-col gap-3.5'
            : viewMode === 'comfort'
            ? 'grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid gap-3.5 sm:gap-4.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5'
        }
      >
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeletonCard key={`skeleton-${index}`} />
            ))
          : products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                viewMode={viewMode}
              />
            ))}
      </div>

      {/* Empty State */}
      {!isLoading && products.length === 0 && !error ? (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <FaMagnifyingGlass className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">No products match your criteria</h2>
          <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-400">
            We couldn't find any products matching your selected search terms or filters. Try resetting your filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700 transition"
          >
            Show All Products
          </button>
        </div>
      ) : null}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalProducts)} of {pagination.totalProducts} products
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="rounded-2xl bg-slate-900 text-white px-4 py-2 text-xs font-bold">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <button
              type="button"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProductCatalogPage;
