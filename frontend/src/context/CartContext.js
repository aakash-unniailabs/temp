import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart.cartItems || []);
        setTableNumber(parsedCart.tableNumber || '');
        setPaymentMethod(parsedCart.paymentMethod || 'Cash');
        // Recalculate total price
        const total = (parsedCart.cartItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalPrice(total);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    const cartData = {
      cartItems,
      tableNumber,
      paymentMethod
    };
    localStorage.setItem('restaurant-cart', JSON.stringify(cartData));
  }, [cartItems, tableNumber, paymentMethod]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        const updatedItems = prevItems.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
        return updatedItems;
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
    setTotalPrice((prevTotal) => prevTotal + parseFloat(item.price));
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === itemId);
      if (!itemToRemove) return prevItems;
      setTotalPrice((prevTotal) => prevTotal - (itemToRemove.price * itemToRemove.quantity));
      return prevItems.filter((item) => item.id !== itemId);
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.id === itemId) {
          const oldQuantity = item.quantity;
          const priceDiff = (newQuantity - oldQuantity) * item.price;
          setTotalPrice((prevTotal) => prevTotal + priceDiff);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setTotalPrice(0);
  };

  // Helper functions for compatibility
  const getTotalPrice = () => totalPrice;
  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);
  const getItemQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  // Alias for backward compatibility
  const items = cartItems;

  return (
    <CartContext.Provider value={{
      cartItems,
      items,
      totalPrice,
      tableNumber,
      paymentMethod,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setTableNumber,
      setPaymentMethod,
      getTotalPrice,
      getTotalItems,
      getItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => {
  return useContext(CartContext);
};