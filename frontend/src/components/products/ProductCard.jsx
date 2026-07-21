import { Link } from 'react-router-dom';
import { FaCartShopping, FaMinus, FaPlus, FaStar, FaEye } from 'react-icons/fa6';
import useCart from '../../hooks/useCart';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function ProductCard({ product, viewMode = 'compact' }) {
  if (!product) return null;
  const { items, addItem, increaseQuantity, decreaseQuantity } = useCart();

  const hasDiscount = typeof product.discountPrice === 'number' && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const imageUrl = product.images?.[0];

  const cartItem = items.find((item) => item.id === product._id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    increaseQuantity(product._id);
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    decreaseQuantity(product._id);
  };

  // Calculate discount percentage if not explicit
  const discountPercent = product.discountPercentage || 
    (hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0);

  // Horizontal / List View Card Layout
  if (viewMode === 'list') {
    return (
      <article className="group flex flex-col sm:flex-row items-center gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
        {/* Clickable Image Box */}
        <Link
          to={`/products/${product.slug}`}
          className="relative h-32 w-32 sm:h-36 sm:w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800 block cursor-pointer"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs font-bold text-slate-400">
              {product.name}
            </div>
          )}
          {discountPercent > 0 ? (
            <span className="absolute top-2 left-2 rounded-lg bg-red-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : null}
        </Link>

        {/* Product Details */}
        <div className="flex-1 space-y-1.5 min-w-0 w-full text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {product.brand || 'Fresh'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-semibold text-slate-500">
              {product.category}
            </span>
          </div>

          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-brand-600 transition">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
              <FaStar className="h-3 w-3" />
              <span>{Number(product.ratingAverage || 0).toFixed(1)}</span>
            </div>
            <span className="text-xs font-medium text-slate-400">
              Unit: {product.unit || '1 pc'}
            </span>
            <span className="text-xs font-medium text-slate-400">
              Stock: {product.stock || 0}
            </span>
          </div>
        </div>

        {/* Pricing & Action Buttons Column */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="text-left sm:text-right">
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {currencyFormatter.format(displayPrice)}
            </p>
            {hasDiscount ? (
              <p className="text-xs text-slate-400 line-through">
                {currencyFormatter.format(product.price)}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <FaEye className="h-3 w-3" />
              View
            </Link>

            {quantityInCart > 0 ? (
              <div className="flex items-center rounded-xl bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 p-1 shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 hover:bg-brand-100 shadow-sm transition"
                >
                  <FaMinus className="h-2.5 w-2.5" />
                </button>
                <span className="px-3 text-xs font-black text-slate-900 dark:text-white">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition"
                >
                  <FaPlus className="h-2.5 w-2.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
              >
                <FaCartShopping className="h-3.5 w-3.5" />
                Add
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  // Grid Card Layout (Compact Standard Grid)
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* Clickable Image Container */}
      <Link
        to={`/products/${product.slug}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50 dark:bg-slate-800 block cursor-pointer"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center">
            <p className="text-xs font-bold text-slate-400">{product.name}</p>
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {discountPercent > 0 ? (
            <span className="rounded-lg bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : (
            <span />
          )}

          {product.isFeatured ? (
            <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
              Featured
            </span>
          ) : null}
        </div>
      </Link>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-3.5 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-400">
            <span className="uppercase tracking-wider truncate">{product.brand || 'Grocery'}</span>
            <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <FaStar className="text-amber-400 h-3 w-3" />
              <span>{Number(product.ratingAverage || 0).toFixed(1)}</span>
            </div>
          </div>

          <Link to={`/products/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 hover:text-brand-600 transition">
              {product.name}
            </h3>
          </Link>

          <p className="text-[11px] font-medium text-slate-400 truncate">
            {product.unit || '1 pc'} • {product.category}
          </p>
        </div>

        {/* Bottom Price & Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-black text-slate-900 dark:text-white leading-none">
              {currencyFormatter.format(displayPrice)}
            </p>
            {hasDiscount ? (
              <p className="text-[10px] font-semibold text-slate-400 line-through mt-0.5">
                {currencyFormatter.format(product.price)}
              </p>
            ) : null}
          </div>

          {/* Action Buttons: View Details & Cart Stepper */}
          <div className="flex items-center gap-1.5">
            <Link
              to={`/products/${product.slug}`}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
              title="View full details"
            >
              <FaEye className="h-3 w-3" />
              <span>View</span>
            </Link>

            {quantityInCart > 0 ? (
              <div className="flex items-center rounded-xl bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 hover:bg-brand-100 shadow-sm transition"
                  title="Reduce quantity"
                >
                  <FaMinus className="h-2 w-2" />
                </button>
                <span className="px-1.5 text-xs font-black text-slate-900 dark:text-white">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition"
                  title="Increase quantity"
                >
                  <FaPlus className="h-2 w-2" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
              >
                <FaCartShopping className="h-3 w-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
