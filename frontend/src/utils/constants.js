export const APP_NAME = import.meta.env.VITE_APP_NAME || 'QuickKart Superstore';
export const DEFAULT_PAGE_SIZE = 12;
export const LOCAL_STORAGE_KEYS = {
  cart: 'grocery_cart_items',
  wishlist: 'grocery_wishlist_items',
  auth: 'grocery_auth_state',
  coupon: 'grocery_cart_coupon',
  checkoutAddresses: 'grocery_checkout_addresses',
  checkoutSelectedAddressId: 'grocery_checkout_selected_address_id',
};
