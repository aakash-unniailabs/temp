// src/api/menuApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api/menu'; // Admin backend

export const getCategories = async () => {
  const res = await axios.get(`${BASE_URL}/menu-category`);
  return res.data;
};

export const getItemsByCategory = async (categoryId) => {
  const res = await axios.get(`http://localhost:4000/api/menu-items/category/${categoryId}`);
  return res.data;
};