import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCartShopping, FaStar } from 'react-icons/fa6';
import { Link, useParams } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import productService from '../../services/productService';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function ProductDetailsPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await productService.getProductBySlug(slug);
        if (!isActive) {
          return;
        }

        setProduct(response.data?.data?.product || null);
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setError('We could not load this product right now.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isActive = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-soft">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="aspect-square animate-pulse rounded-[1.75rem] bg-slate-200" />
          <div className="space-y-4">
            <div className="h-4 w-24 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-10 w-3/4 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-6 w-1/2 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-4 w-full rounded-full bg-slate-200 animate-pulse" />
            <div className="h-4 w-5/6 rounded-full bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-soft">
        <h1 className="text-2xl font-bold">Product unavailable</h1>
        <p className="mt-2">{error}</p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <FaArrowLeft />
          Back to products
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const hasDiscount = typeof product.discountPrice === 'number' && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const imageUrl = product.images?.[0];

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  return (
    <section className="space-y-6">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
      >
        <FaArrowLeft />
        Back to products
      </Link>

      <div className="grid gap-8 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-soft lg:grid-cols-[1fr_1fr] lg:p-8">
        <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-100 via-white to-orange-50">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center p-8 text-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Grocery pick</p>
                <h1 className="mt-3 text-4xl font-black text-slate-950">{product.name}</h1>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">{product.brand}</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                {product.category}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                {product.unit || '1 pc'}
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-700">
                <FaStar className="text-amber-400" />
                <span>{Number(product.ratingAverage || 0).toFixed(1)}</span>
                <span className="text-slate-400">({product.ratingCount || 0})</span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-slate-50 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">Price</p>
                <p className="text-3xl font-black text-slate-950">{currencyFormatter.format(displayPrice)}</p>
                {hasDiscount ? (
                  <p className="text-sm text-slate-500 line-through">{currencyFormatter.format(product.price)}</p>
                ) : null}
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>{product.stock} available</p>
                <p>{product.isPublished ? 'Published' : 'Draft'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-950">Product details</h2>
            <p className="text-base leading-7 text-slate-600">{product.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white p-4 shadow-soft">
              <p className="text-sm font-semibold text-slate-500">Tags</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.tags?.length ? (
                  product.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No tags added yet</span>
                )}
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-white p-4 shadow-soft">
              <p className="text-sm font-semibold text-slate-500">Catalog meta</p>
              <div className="mt-2 space-y-2 text-sm text-slate-600">
                <p>Slug: {product.slug}</p>
                <p>Discount: {product.discountPercentage || 0}%</p>
                <p>Created by: {product.createdBy?.name || 'Unknown'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              <span className="inline-flex items-center gap-2">
                <FaCartShopping />
                Add to cart
              </span>
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
            >
              Save for later
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
