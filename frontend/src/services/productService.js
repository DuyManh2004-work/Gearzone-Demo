
import axios from "axios";

const API_URL = "http://localhost:5000/api/products";

// Lấy danh sách sản phẩm từ MongoDB thông qua backend.
export const getProducts = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
};


export const deleteProduct = async (id) => {
  if (!id) {
    throw new Error("Thiếu ID sản phẩm cần xóa.");
  }

  const response = await axios.delete(
    `${API_URL}/${encodeURIComponent(id)}`
  );

  return response.data;
};

// Lấy thông tin chi tiết một sản phẩm.
export const getProductById = async (id) => {
  if (!id) {
    throw new Error("Thiếu ID sản phẩm.");
  }

  const response = await axios.get(
    `${API_URL}/${encodeURIComponent(id)}`
  );

  

  return response.data;
};
