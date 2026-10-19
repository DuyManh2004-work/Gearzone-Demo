
import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

// Lấy danh sách đơn hàng từ backend
export const getOrders = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
};

// Cập nhật trạng thái đơn hàng trong MongoDB
export const updateOrderStatus = async (orderId, status) => {
  const response = await axios.patch(
    `${API_URL}/${orderId}/status`,
    { status }
  );

  return response.data;
};
