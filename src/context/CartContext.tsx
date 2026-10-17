'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  weight_grams: number;
  stock: number;
  is_preorder: boolean;
  po_lead_days: number;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalWeightGrams: number;
  totalWeightKg: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('denish_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      // ignore
    }
    setIsHydrated(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('denish_cart', JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalWeightGrams = items.reduce((acc, item) => acc + item.product.weight_grams * item.quantity, 0);
  const totalWeightKg = Number((totalWeightGrams / 1000).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        totalWeightGrams,
        totalWeightKg,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
