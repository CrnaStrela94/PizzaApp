import React, { createContext, useContext, useState, ReactNode } from 'react';

type Food = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  toppings: { name: string; price: number; quantity: number }[];
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
