import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Topping = { name: string; price: number; quantity: number };

export type Food = {
  id: number;
  name: string;
  description: string;
  price: number;
  basePrice?: number; // Mark basePrice as optional
  image: string;
  category: string;
  toppings: Topping[];
};

type CartContextType = {
  cart: Food[];
  addToCart: (food: Food) => void;
  updateCart: (updatedCart: Food[]) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Food[]>([]);

  const addToCart = (food: Food) => {
    setCart((prevCart) => [...prevCart, food]);
  };

  const updateCart = (updatedCart: Food[]) => {
    setCart(updatedCart);
  };

  return <CartContext.Provider value={{ cart, addToCart, updateCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;
