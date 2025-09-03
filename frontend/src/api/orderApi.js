import axios from "axios";

// Customer backend API (existing)
const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Admin backend API (new)
const ADMIN_API = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    'Content-Type': 'application/json',
  }
});

// Existing customer backend functions
export const placeOrder = (orderData) => API.post("/orders", orderData);
export const getOrders = () => API.get("/orders");
export const getLatestOrder = (params) => API.get("/orders/latest", { params });
export const cancelOrder = (id) => API.put(`/orders/cancel/${id}`);

// NEW: Submit order to admin backend
export const submitOrderToAdmin = async (orderData) => {
  try {
    console.log('Submitting order to admin backend:', orderData);

    // Get customer name from orderData or localStorage
    const savedUser = localStorage.getItem('user');
    let customerName = 'Customer App'; // fallback

    if (orderData.customerName) {
      customerName = orderData.customerName;
    } else if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        customerName = parsedUser.name || 'Customer App';
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Transform customer order data to admin backend format
    const adminOrderData = {
      table_number: orderData.tableNumber?.replace('Table ', '') || '1', // Extract number from "Table 1"
      customer_name: customerName, // Use actual customer name
      order_type: 'Customer', // Indicates this came from customer app
      items: orderData.items.map(item => ({
        item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.price) * item.quantity
      })),
      tax: calculateTax(orderData.items), // Calculate 5% tax
      total_amount: calculateTotal(orderData.items)
    };

    console.log('Transformed order data for admin:', adminOrderData);

    const response = await ADMIN_API.post('/orders', adminOrderData);

    if (response.data.success) {
      console.log('✅ Order successfully sent to admin backend:', response.data.order);
      return response.data.order;
    } else {
      throw new Error('Failed to create order in admin backend');
    }
  } catch (error) {
    console.error('❌ Error submitting order to admin backend:', error);

    // Log more details about the error
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    throw error;
  }
};

// Helper function to calculate tax (5%)
const calculateTax = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  return subtotal * 0.05; // 5% tax
};

// Helper function to calculate total (subtotal + tax + service fee)
const calculateTotal = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax
  const serviceFee = 12; // Fixed service fee
  return subtotal + tax + serviceFee;
};

// Get all orders from admin backend (optional - for debugging)
export const getOrdersFromAdmin = async () => {
  try {
    const response = await ADMIN_API.get('/orders');
    return response.data.orders || [];
  } catch (error) {
    console.error('Error fetching orders from admin backend:', error);
    throw error;
  }
};