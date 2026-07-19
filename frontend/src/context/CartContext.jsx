import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';
import {
  AVAILABLE_COUPONS,
  calculateCheckoutTotals,
  getCouponByCode,
  normalizeCouponCode,
} from '../utils/checkout';
import useAuth from '../hooks/useAuth';

const CartContext = createContext(null);

const safeParseCart = (value) => {
  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
};

const normalizePrice = (product) => {
  const discountPrice = typeof product.discountPrice === 'number' ? product.discountPrice : null;
  const hasDiscount = discountPrice !== null && discountPrice < product.price;

  return {
    price: product.price,
    discountPrice,
    displayPrice: hasDiscount ? discountPrice : product.price,
    hasDiscount,
  };
};

const createCartItem = (product, quantity = 1) => {
  const pricing = normalizePrice(product);

  return {
    id: product._id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    unit: product.unit || '1 pc',
    image: product.images?.[0] || '',
    stock: product.stock || 0,
    quantity,
    ...pricing,
  };
};

const getStoredCart = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  return safeParseCart(window.localStorage.getItem(LOCAL_STORAGE_KEYS.cart));
};

const getStoredCouponCode = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return normalizeCouponCode(window.localStorage.getItem(LOCAL_STORAGE_KEYS.coupon));
};

function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(getStoredCart);
  const [couponCode, setCouponCode] = useState(getStoredCouponCode);
  const prevUserRef = useRef(user);

  // Auto-clear cart whenever user logs out (transition from user -> null)
  useEffect(() => {
    if (prevUserRef.current && !user) {
      setItems([]);
      setCouponCode('');
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LOCAL_STORAGE_KEYS.cart);
        window.localStorage.removeItem(LOCAL_STORAGE_KEYS.coupon);
      }
    }
    prevUserRef.current = user;
  }, [user]);

  useEffect(() => {
    if (items.length > 0) {
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.cart, JSON.stringify(items));
    } else if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_STORAGE_KEYS.cart);
    }
  }, [items]);

  useEffect(() => {
    if (couponCode) {
      window.localStorage.setItem(LOCAL_STORAGE_KEYS.coupon, couponCode);
      return;
    }

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_STORAGE_KEYS.coupon);
    }
  }, [couponCode]);

  const addItem = (product, quantity = 1) => {
    if (!product?._id) {
      return;
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product._id);

      if (existingItem) {
        return currentItems.map((item) => {
          if (item.id !== product._id) {
            return item;
          }

          const nextQuantity = Math.min(item.quantity + quantity, item.stock || Infinity);
          return { ...item, quantity: nextQuantity };
        });
      }

      return [...currentItems, createCartItem(product, quantity)];
    });
  };

  const removeItem = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const increaseQuantity = (productId) => {
    setItems((currentItems) => {
      return currentItems.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const stockLimit = item.stock || item.quantity + 1;
        const nextQuantity = Math.min(item.quantity + 1, stockLimit);
        return { ...item, quantity: nextQuantity };
      });
    });
  };

  const decreaseQuantity = (productId) => {
    setItems((currentItems) => {
      return currentItems
        .map((item) => {
          if (item.id !== productId) {
            return item;
          }

          return { ...item, quantity: Math.max(item.quantity - 1, 1) };
        })
        .filter(Boolean);
    });
  };

  const updateQuantity = (productId, quantity) => {
    const nextQuantity = Number(quantity);

    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
      return;
    }

    setItems((currentItems) => {
      return currentItems.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        const stockLimit = item.stock || nextQuantity;
        return { ...item, quantity: Math.min(nextQuantity, stockLimit) };
      });
    });
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LOCAL_STORAGE_KEYS.cart);
      window.localStorage.removeItem(LOCAL_STORAGE_KEYS.coupon);
    }
  };

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.displayPrice * item.quantity, 0);
  const originalTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const discountTotal = Math.max(originalTotal - subtotal, 0);
  const checkoutTotals = calculateCheckoutTotals({ subtotal, couponCode });

  const applyCoupon = (value) => {
    const normalizedCouponCode = normalizeCouponCode(value);
    const coupon = getCouponByCode(normalizedCouponCode);

    if (!coupon) {
      return {
        success: false,
        message: 'Invalid coupon code',
      };
    }

    if (subtotal < coupon.minSubtotal) {
      return {
        success: false,
        message: `This coupon needs a minimum order of ${coupon.minSubtotal}.`,
      };
    }

    setCouponCode(coupon.code);

    return {
      success: true,
      message: `${coupon.code} applied successfully.`,
      coupon,
    };
  };

  const removeCoupon = () => {
    setCouponCode('');
  };

  const value = useMemo(() => {
    return {
      items,
      cartCount,
      subtotal,
      originalTotal,
      discountTotal,
      couponCode,
      appliedCoupon: checkoutTotals.appliedCoupon,
      couponDiscount: checkoutTotals.couponDiscount,
      shippingFee: checkoutTotals.shippingFee,
      taxAmount: checkoutTotals.taxAmount,
      grandTotal: checkoutTotals.grandTotal,
      taxableAmount: checkoutTotals.taxableAmount,
      availableCoupons: AVAILABLE_COUPONS,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      hasItems: items.length > 0,
    };
  }, [
    items,
    cartCount,
    subtotal,
    originalTotal,
    discountTotal,
    couponCode,
    checkoutTotals,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { CartProvider, CartContext, createCartItem };
export default CartContext;
