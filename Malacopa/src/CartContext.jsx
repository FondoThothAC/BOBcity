/* ============================================================================
   Malacopa - Contexto del Carrito de Tickets y Contrataciones (React)
   ============================================================================
   Maneja las compras de boletos para espectáculos, zonas VIP/General,
   el proceso de cotización y los depósitos para contratar shows privados.
   ============================================================================ */

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [points, setPoints] = useState(120); // Puntos iniciales simulados

  // Cargar carrito desde localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('malacopa_carrito');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error('Error al cargar el carrito de localStorage:', e);
    }
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('malacopa_carrito', JSON.stringify(items));
  };

  const addToCart = (item) => {
    const existing = cartItems.find((i) => i.id === item.id && i.zona === item.zona);
    if (existing) {
      const updated = cartItems.map((i) =>
        i.id === item.id && i.zona === item.zona ? { ...i, cantidad: i.cantidad + (item.cantidad || 1) } : i
      );
      saveCart(updated);
    } else {
      const updated = [...cartItems, { ...item, cantidad: item.cantidad || 1 }];
      saveCart(updated);
    }
  };

  const removeFromCart = (itemId, zona) => {
    const updated = cartItems.filter((i) => !(i.id === itemId && i.zona === zona));
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Cada 10 puntos es $1 MXN de descuento
  const pointsDiscount = Math.floor(points / 10);

  const agregarPuntos = (montoCompra) => {
    const nuevosPuntos = Math.floor(montoCompra * 0.05); // Acumula el 5% en puntos
    setPoints((prev) => prev + nuevosPuntos);
  };

  const canjearPuntos = () => {
    setPoints(0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      points,
      pointsDiscount,
      addToCart,
      removeFromCart,
      clearCart,
      agregarPuntos,
      canjearPuntos
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}
