import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaFilter, FaMagnifyingGlass, FaRotateLeft } from 'react-icons/fa6';
import { Link, useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import ProductCard from '../../components/products/ProductCard';
import ProductSkeletonCard from '../../components/products/ProductSkeletonCard';

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  brand: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  isFeatured: '',
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const normalizeQueryValue = (value) => {
  return typeof value === 'string' ? value : '';
};

function ProductCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalProducts: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({ category: '', brand: '', search: '' });

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
    };
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
  } = useForm({
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
        const response = await productService.getProducts(params);
        const responseData = response.data?.data || {};

        if (!isActive) {
          return;
        }

        setProducts(responseData.products || []);
        setPagination(responseData.pagination || pagination);
        setSummary(responseData.filters || { category: '', brand: '', search: '' });
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError('Failed to load products right now. Please try again.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
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
    setSearchParams({ page: '1' });
  };

  const goToPage = (page) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(page));
    setSearchParams(nextParams);
  };

  const currentPage = Number(searchParams.get('page') || '1');
  const activeSearch = watch('search');

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
          >
            <FaArrowLeft />
            Back to home
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">Browse products</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Fresh groceries with search, filter, sort, and pagination.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              This catalog is wired to the backend product API, so the same controls will work later when we add admin product management and image uploads.
            </p>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-white px-5 py-4 shadow-soft">
          <p className="text-sm font-semibold text-slate-500">Total products</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{pagination.totalProducts}</p>
        </div>
      </div>

      <form
        className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-soft backdrop-blur"
        onSubmit={handleSubmit(applyFilters)}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <FaFilter />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Filter catalog</h2>
            <p className="text-sm text-slate-500">Use these controls to narrow the grocery inventory.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Search</span>
            <div className="relative">
              <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rice, milk, snacks..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                {...register('search')}
              />
            </div>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Category</span>
            <input
              type="text"
              placeholder="Fruits, Dairy, Snacks"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              {...register('category')}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Brand</span>
            <input
              type="text"
              placeholder="Aashirvaad, Amul"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              {...register('brand')}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Featured only</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              {...register('isFeatured')}
            >
              <option value="">All products</option>
              <option value="true">Featured</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Min price</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              {...register('minPrice')}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Max price</span>
            <input
              type="number"
              min="0"
              placeholder="999"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              {...register('maxPrice')}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Sort by</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              {...register('sortBy')}
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price</option>
              <option value="ratingAverage">Rating</option>
              <option value="stock">Stock</option>
              <option value="name">Name</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Sort order</span>
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              {...register('sortOrder')}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            {activeSearch ? (
              <>
                Showing results for <span className="font-semibold text-slate-900">{activeSearch}</span>
              </>
            ) : (
              'Use the form to narrow down your grocery catalog.'
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
            >
              <FaRotateLeft />
              Reset
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              Apply filters
            </button>
          </div>
        </div>
      </form>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => <ProductSkeletonCard key={`skeleton-${index}`} />)
          : products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>

      {!isLoading && products.length === 0 && !error ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-soft">
          <h2 className="text-2xl font-bold text-slate-950">No products found</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Try removing filters or searching for a different grocery item.
          </p>
        </div>
      ) : null}

      {pagination.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <div className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-soft">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <button
            type="button"
            disabled={currentPage >= pagination.totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-slate-500">Filters in use</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{summary.search || 'All products'}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-slate-500">Category</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{summary.category || 'Any category'}</p>
        </div>
        <div className="rounded-[1.5rem] bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-slate-500">Brand</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{summary.brand || 'Any brand'}</p>
        </div>
      </div>
    </section>
  );
}

export default ProductCatalogPage;
