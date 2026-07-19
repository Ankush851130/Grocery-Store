import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaMagnifyingGlass,
  FaTruckFast,
  FaLeaf,
  FaClock,
  FaShieldHalved,
  FaArrowRight,
  FaFire,
  FaStar,
  FaTag,
  FaBasketShopping,
} from 'react-icons/fa6';
import productService from '../services/productService';
import ProductCard from './products/ProductCard';
import ProductSkeletonCard from '../components/products/ProductSkeletonCard';

const CATEGORIES = [
  {
    name: 'Fruits & Vegetables',
    slug: 'Fruits & Vegetables',
    icon: '🍎',
    color: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50 text-emerald-700',
    itemCount: '120+ Items',
  },
  {
    name: 'Dairy & Eggs',
    slug: 'Dairy & Eggs',
    icon: '🥛',
    color: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50 text-blue-700',
    itemCount: '85+ Items',
  },
  {
    name: 'Bakery & Bread',
    slug: 'Bakery',
    icon: '🍞',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50 text-amber-700',
    itemCount: '60+ Items',
  },
  {
    name: 'Pantry & Oils',
    slug: 'Pantry & Oil',
    icon: '🫒',
    color: 'from-teal-500 to-emerald-700',
    bgLight: 'bg-teal-50 text-teal-700',
    itemCount: '140+ Items',
  },
  {
    name: 'Cold Beverages',
    slug: 'Beverages',
    icon: '🧃',
    color: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50 text-orange-700',
    itemCount: '90+ Items',
  },
  {
    name: 'Gourmet Snacks',
    slug: 'Snacks & Sweets',
    icon: '🍫',
    color: 'from-purple-500 to-pink-600',
    bgLight: 'bg-purple-50 text-purple-700',
    itemCount: '110+ Items',
  },
];

const FEATURES = [
  {
    icon: FaTruckFast,
    title: 'Free Express Shipping',
    desc: 'Free delivery on all orders above ₹999',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: FaLeaf,
    title: '100% Organic & Farm Fresh',
    desc: 'Directly sourced from certified local farms',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: FaClock,
    title: '30-Minute Delivery',
    desc: 'Superfast doorstep delivery in your city',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: FaShieldHalved,
    title: 'Secure Online Payments',
    desc: 'Instant UPI, Cards & Cash on Delivery',
    color: 'bg-blue-50 text-blue-600',
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
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
        {/* Glowing Background Orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-teal-500/20 blur-[100px]" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md">
              <FaLeaf className="text-emerald-400" />
              <span>100% Organic & Farm Fresh Groceries</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl leading-[1.15]">
                Freshness You Can Taste, Delivered in <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">30 Mins.</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Shop farm-fresh vegetables, organic fruits, artisan bakery goods, and everyday kitchen essentials at unmatched prices.
              </p>
            </div>

            {/* HERO SEARCH BAR */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
              <div className="relative flex items-center">
                <FaMagnifyingGlass className="absolute left-5 text-slate-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search fresh apples, milk, artisan bread..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-white/20 bg-white/10 py-4 pl-14 pr-36 text-white placeholder-slate-400 outline-none backdrop-blur-xl transition focus:border-emerald-400 focus:bg-white/15 focus:ring-4 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/30"
                >
                  Search
                </button>
              </div>
            </form>

            {/* QUICK STATS & BADGES */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium text-slate-300">Live Delivery Active</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <FaStar />
                <span>4.9 / 5 Rating</span>
                <span className="text-slate-400 font-normal">(12k+ Reviews)</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL CARD */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                  alt="Fresh organic basket"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/20 bg-slate-900/80 p-4 backdrop-blur-md">
                  <div>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                      ⚡ Today's Special
                    </span>
                    <h3 className="mt-1 text-base font-bold text-white">Organic Harvest Basket</h3>
                    <p className="text-xs text-slate-300">Fresh Fruits & Veggies Pack</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-400">₹399</span>
                    <span className="block text-xs text-slate-400 line-through">₹599</span>
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
              className="flex items-center gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${feat.color}`}>
                <Icon className="text-2xl" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{feat.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* CATEGORIES BROWSER */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Explore Catalog</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Shop by Category</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
          >
            <span>View All Categories</span>
            <FaArrowRight />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${encodeURIComponent(cat.slug)}`}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition duration-300 group-hover:scale-110">
                {cat.icon}
              </div>
              <h3 className="mt-4 font-bold text-slate-900 group-hover:text-emerald-600 transition">{cat.name}</h3>
              <p className="mt-1 text-xs text-slate-400 font-medium">{cat.itemCount}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
              <FaFire />
              <span>Trending Deals</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Featured Fresh Products</h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 shadow-soft"
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

      {/* PROMOTIONAL BANNER / SUPER SAVER */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <FaTag />
              <span>Super Saver Offer</span>
            </span>
            <h2 className="text-3xl font-black sm:text-4xl leading-tight">
              Get Flat ₹150 OFF on Your First Order!
            </h2>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              Use code <strong className="rounded border border-white/40 bg-white/20 px-2 py-0.5 font-mono">GROCERY150</strong> at checkout for orders above ₹2000.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-3 rounded-full bg-slate-950 px-8 py-4 text-sm font-bold text-white shadow-2xl transition hover:bg-slate-900 hover:scale-105"
              >
                <FaBasketShopping />
                <span>Start Shopping Now</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80"
              alt="Fresh bananas and fruits"
              className="mx-auto h-64 rounded-3xl object-cover shadow-2xl border-4 border-white/30 transform rotate-2 hover:rotate-0 transition duration-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
