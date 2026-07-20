import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMagnifyingGlass,
  FaTruckFast,
  FaClock,
  FaShieldHalved,
  FaArrowRight,
  FaFire,
  FaStar,
  FaTag,
  FaBasketShopping,
  FaBolt,
  FaMobileScreen,
  FaHeadphones,
  FaGlassWater,
  FaCookieBite,
  FaCartShopping,
  FaWandMagicSparkles,
} from 'react-icons/fa6';
import productService from '../services/productService';
import ProductCard from './products/ProductCard';
import ProductSkeletonCard from '../components/products/ProductSkeletonCard';

const CATEGORIES = [
  {
    name: 'Mobiles & Accessories',
    slug: 'Mobiles & Accessories',
    icon: '📱',
    color: 'from-violet-500 to-indigo-600',
    bgLight: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    itemCount: '50+ Items',
  },
  {
    name: 'Electronics & Gadgets',
    slug: 'Electronics & Gadgets',
    icon: '🎧',
    color: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    itemCount: '120+ Items',
  },
  {
    name: 'Cold Drinks & Juices',
    slug: 'Cold Drinks & Juices',
    icon: '🥤',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    itemCount: '90+ Items',
  },
  {
    name: 'Snacks & Munchies',
    slug: 'Snacks & Munchies',
    icon: '🍿',
    color: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    itemCount: '140+ Items',
  },
  {
    name: 'Fruits & Vegetables',
    slug: 'Fruits & Vegetables',
    icon: '🍎',
    color: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    itemCount: '110+ Items',
  },
  {
    name: 'Dairy & Eggs',
    slug: 'Dairy & Eggs',
    icon: '🥛',
    color: 'from-sky-500 to-teal-600',
    bgLight: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    itemCount: '80+ Items',
  },
  {
    name: 'Personal Care & Beauty',
    slug: 'Personal Care & Beauty',
    icon: '🧴',
    color: 'from-purple-500 to-fuchsia-600',
    bgLight: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    itemCount: '95+ Items',
  },
  {
    name: 'Home & Kitchen',
    slug: 'Home & Kitchen',
    icon: '🏠',
    color: 'from-orange-500 to-yellow-600',
    bgLight: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    itemCount: '75+ Items',
  },
  {
    name: 'Bakery & Quick Meals',
    slug: 'Bakery',
    icon: '🍞',
    color: 'from-amber-600 to-orange-700',
    bgLight: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    itemCount: '65+ Items',
  },
  {
    name: 'Pantry & Oils',
    slug: 'Pantry & Oil',
    icon: '🫒',
    color: 'from-teal-600 to-emerald-700',
    bgLight: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    itemCount: '85+ Items',
  },
];

const QUICK_TAGS = [
  { label: 'Smartphones', category: 'Mobiles & Accessories' },
  { label: 'Earbuds', category: 'Electronics & Gadgets' },
  { label: 'Cold Cola', category: 'Cold Drinks & Juices' },
  { label: 'Potato Chips', category: 'Snacks & Munchies' },
  { label: 'Fresh Milk', category: 'Dairy & Eggs' },
  { label: 'Face Wash', category: 'Personal Care & Beauty' },
];

const FEATURES = [
  {
    icon: FaBolt,
    title: '10-Minute Delivery',
    desc: 'Instant superfast dispatch to your doorstep',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    icon: FaShieldHalved,
    title: '100% Genuine Products',
    desc: 'Top brands with warranty & fresh guarantee',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: FaTruckFast,
    title: 'Free Shipping Above ₹499',
    desc: 'No hidden surge fees on standard orders',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: FaClock,
    title: '24/7 Instant Support',
    desc: 'Hassle-free instant returns & quick refunds',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
];

function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productService.getFeaturedProducts(8);
        setFeaturedProducts(response.data?.data?.products || []);
      } catch (error) {
        console.error('Failed to load featured products', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION - ZEPTO/BLINKIT/FLIPKART STYLE QUICK COMMERCE HERO */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
        {/* Ambient Backlight Orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-amber-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-emerald-500/15 blur-[100px]" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-300 backdrop-blur-md animate-pulse">
              <FaBolt className="text-amber-400 text-sm" />
              <span>⚡ 10-Minute Instant Delivery Platform</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.15]">
                Electronics, Mobiles, Groceries & Cold Drinks Delivered in{' '}
                <span className="bg-gradient-to-r from-amber-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">
                  10 Mins.
                </span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Your one-stop superstore like Zepto & Flipkart. Shop smartphones, wireless earbuds, chilled drinks, crunchy snacks, fresh groceries & daily essentials at unbeatable prices.
              </p>
            </div>

            {/* HERO SEARCH BAR */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl space-y-3">
              <div className="relative flex items-center">
                <FaMagnifyingGlass className="absolute left-5 text-slate-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search iPhone, Earbuds, Cold Drinks, Chips, Milk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-white/20 bg-white/10 py-4 pl-14 pr-36 text-white placeholder-slate-400 outline-none backdrop-blur-xl transition focus:border-amber-400 focus:bg-white/15 focus:ring-4 focus:ring-amber-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 px-6 py-2.5 text-sm font-black text-slate-950 shadow-lg transition hover:brightness-110 hover:shadow-amber-500/30"
                >
                  Search
                </button>
              </div>

              {/* QUICK SUGGESTION TAGS */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-semibold">Trending:</span>
                {QUICK_TAGS.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigate(`/products?category=${encodeURIComponent(tag.category)}`)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300 transition hover:border-amber-400/50 hover:bg-white/15 hover:text-amber-300"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </form>

            {/* QUICK STATS & BADGES */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-slate-300">Live Express Hub Active</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <FaStar />
                <span>4.9 / 5 Rating</span>
                <span className="text-slate-400 font-normal">(50k+ Happy Orders)</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL MULTI-CATEGORY SHOWCASE CARD */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.8rem]">
                <img
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"
                  alt="Tech & Gadgets Express"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* FLOATING MULTI-CATEGORY BADGES */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-md">
                    <FaHeadphones className="text-amber-300" /> Electronics
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-bold text-slate-950 shadow-lg backdrop-blur-md">
                    <FaGlassWater /> Chilled Drinks
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/20 bg-slate-900/90 p-4 backdrop-blur-xl">
                  <div>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-400">
                      ⚡ Trending Super Deal
                    </span>
                    <h3 className="mt-1 text-base font-extrabold text-white">SonicBass ANC Wireless Earbuds</h3>
                    <p className="text-xs text-slate-300">Delivered in 10 minutes</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-amber-400">₹2,499</span>
                    <span className="block text-xs text-slate-400 line-through">₹3,499</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES / TRUST BAR */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${feat.color}`}>
                <Icon className="text-2xl" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{feat.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* MULTI-CATEGORY BROWSER */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <FaWandMagicSparkles />
              <span>Multi-Category Superstore</span>
            </div>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Explore All Categories
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 transition hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <span>View Full Superstore Catalog</span>
            <FaArrowRight />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${encodeURIComponent(cat.slug)}`}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-sm transition duration-300 group-hover:scale-110 ${cat.bgLight}`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {cat.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-semibold">{cat.itemCount}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* QUICK CATEGORY SPOTLIGHT BANNERS (ZEPTO / BLINKIT STYLE DEALS) */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* TECH & ELECTRONICS SPOTLIGHT */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-8 text-white shadow-xl border border-indigo-800/40">
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-black uppercase text-indigo-300 border border-indigo-400/30">
              <FaHeadphones /> 10-Min Electronics Store
            </span>
            <h3 className="text-2xl font-black leading-tight sm:text-3xl">
              Earbuds, Smartwatches & Mobile Gadgets
            </h3>
            <p className="text-sm text-slate-300 max-w-sm">
              Upgrade your tech setup with top rated wireless audio, fast power banks & smartphones.
            </p>
            <div>
              <Link
                to="/products?category=Electronics%20%26%20Gadgets"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-xs font-black text-slate-950 shadow-lg transition hover:bg-amber-300 hover:scale-105"
              >
                <span>Shop Electronics Deals</span>
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>

        {/* COLD DRINKS & SNACKS SPOTLIGHT */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-8 text-white shadow-xl">
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase text-white backdrop-blur-md">
              <FaGlassWater /> Chilled Drink & Snack Express
            </span>
            <h3 className="text-2xl font-black leading-tight sm:text-3xl">
              Chilled Soft Drinks, Energy Drinks & Snacks
            </h3>
            <p className="text-sm text-white/90 max-w-sm">
              Ice-chilled colas, iced coffee, crunchy potato chips & chocolates delivered in 10 minutes.
            </p>
            <div>
              <Link
                to="/products?category=Cold%20Drinks%20%26%20Juices"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-black text-white shadow-lg transition hover:bg-slate-900 hover:scale-105"
              >
                <span>Order Chilled Drinks</span>
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MULTI-CATEGORY PRODUCTS */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-extrabold text-orange-600 dark:text-orange-400">
              <FaFire />
              <span>Trending Across Categories</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Featured Superstore Deals
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-extrabold text-slate-700 dark:text-slate-200 transition hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-soft"
          >
            <span>Browse All Products</span>
            <FaArrowRight />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <ProductSkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* PROMOTIONAL SUPER SAVER BANNER */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
              <FaTag />
              <span>Super Quick Saver Offer</span>
            </span>
            <h2 className="text-3xl font-black sm:text-4xl leading-tight">
              Get Flat ₹150 OFF on Mobiles, Electronics, Drinks & Grocery!
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Use code <strong className="rounded border border-white/40 bg-white/20 px-2.5 py-1 font-mono text-amber-300">GROCERY150</strong> at checkout for orders above ₹1,999.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-3 rounded-full bg-slate-950 px-8 py-4 text-sm font-black text-white shadow-2xl transition hover:bg-slate-900 hover:scale-105"
              >
                <FaBasketShopping />
                <span>Start Shopping Now</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
              alt="Multi Category Shopping"
              className="mx-auto h-64 rounded-3xl object-cover shadow-2xl border-4 border-white/30 transform rotate-2 hover:rotate-0 transition duration-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
