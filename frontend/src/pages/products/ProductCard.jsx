import { Link } from 'react-router-dom';
import { FaCartShopping, FaStar } from 'react-icons/fa6';
import useCart from '../../hooks/useCart';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function ProductCard({ product }) {
  if (!product) return null;
  const { addItem } = useCart();
  const hasDiscount = typeof product?.discountPrice === 'number' && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const imageUrl = product.images?.[0];

  const handleAddToCart = () => {
    addItem(product, 1);
  };

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-100 via-white to-orange-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Fresh produce</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">{product.name}</h3>
            </div>
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.isFeatured ? (
            <span className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-soft">
              Featured
            </span>
          ) : null}
          {!product.isPublished ? (
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-soft">
              Draft
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{product.brand}</p>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
              <FaStar className="text-amber-400" />
              <span>{Number(product.ratingAverage || 0).toFixed(1)}</span>
            </div>
          </div>
          <h3 className="line-clamp-2 text-lg font-bold text-slate-950">{product.name}</h3>
          <p className="line-clamp-2 text-sm leading-6 text-slate-500">{product.description}</p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-slate-950">{currencyFormatter.format(displayPrice)}</p>
            {hasDiscount ? (
              <p className="text-sm text-slate-500 line-through">{currencyFormatter.format(product.price)}</p>
            ) : null}
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>{product.unit || '1 pc'}</p>
            <p>{product.stock} in stock</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {product.category}
            </span>
            {product.discountPercentage ? (
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {product.discountPercentage}% off
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              <FaCartShopping />
              Add
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
