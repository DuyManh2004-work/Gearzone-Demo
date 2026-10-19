
const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Lấy danh sách sản phẩm
router.get("/", getProducts);

// Thêm sản phẩm
router.post("/", createProduct);

// Lấy chi tiết sản phẩm
router.get("/:id", getProductById);

// Cập nhật sản phẩm
router.put("/:id", updateProduct);

// Xóa mềm sản phẩm
router.delete("/:id", deleteProduct);

module.exports = router;
