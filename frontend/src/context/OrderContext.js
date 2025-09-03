// src/context/OrderContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('restaurant-orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
      }
    }
  }, []);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('restaurant-orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: Date.now().toString(),
      status: 'Pending',
      placedAt: new Date().toISOString(),
      estimatedTime: 20 // minutes
    };
    
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    setCurrentOrder(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
    
    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder(prev => ({ ...prev, status }));
    }
  };

  const getOrderById = (orderId) => {
    return orders.find(order => order.id === orderId);
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const clearOrders = () => {
    setOrders([]);
    setCurrentOrder(null);
  };

  const value = {
    orders,
    currentOrder,
    addOrder,
    updateOrderStatus,
    getOrderById,
    getOrdersByStatus,
    clearOrders,
    setCurrentOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;