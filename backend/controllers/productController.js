
const Product = require("../models/Product");

// GET /api/products
// Lấy danh sách sản phẩm đang hoạt động
const getProducts = async (req, res) => {
  try {
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 12)
    );

    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      const keyword = req.query.search.trim().slice(0, 100);

      if (keyword) {
        const escapedKeyword = keyword.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        filter.name = {
          $regex: escapedKeyword,
          $options: "i",
        };
      }
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(
          "name price oldPrice category image description stock rating reviews badge featured"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      Product.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getProducts:", error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách sản phẩm",
    });
  }
};

// GET /api/products/:id
// Lấy chi tiết sản phẩm
const getProductById = async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    return res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("getProductById:", error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin sản phẩm",
    });
  }
};

// POST /api/products
// Thêm sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      oldPrice,
      image,
      description,
      stock,
      featured,
      badge,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      price === undefined ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên, danh mục và giá hợp lệ",
      });
    }

    if (
      stock !== undefined &&
      (!Number.isInteger(Number(stock)) || Number(stock) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Số lượng tồn kho phải là số nguyên không âm",
      });
    }

    if (
      oldPrice !== undefined &&
      oldPrice !== "" &&
      (!Number.isFinite(Number(oldPrice)) || Number(oldPrice) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Giá cũ không hợp lệ",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      oldPrice:
        oldPrice === undefined || oldPrice === ""
          ? 0
          : Number(oldPrice),
      image: typeof image === "string" ? image.trim() : "",
      description:
        typeof description === "string" ? description.trim() : "",
      stock: stock === undefined || stock === "" ? 0 : Number(stock),
      featured: featured === true || featured === "true",
      badge: typeof badge === "string" ? badge.trim() : "",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("createProduct:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu sản phẩm không hợp lệ",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Không thể thêm sản phẩm",
    });
  }
};

// PUT /api/products/:id
// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    const allowedFields = [
      "name",
      "category",
      "price",
      "oldPrice",
      "image",
      "description",
      "stock",
      "featured",
      "badge",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có dữ liệu cần cập nhật",
      });
    }

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Tên sản phẩm không hợp lệ",
      });
    }

    if (
      updates.category !== undefined &&
      (typeof updates.category !== "string" ||
        !updates.category.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Danh mục sản phẩm không hợp lệ",
      });
    }

    if (updates.name !== undefined) {
      updates.name = updates.name.trim();
    }

    if (updates.category !== undefined) {
      updates.category = updates.category.trim();
    }

    for (const field of ["price", "oldPrice", "stock"]) {
      if (updates[field] !== undefined) {
        const value = updates[field];

        if (
          value === "" ||
          !Number.isFinite(Number(value)) ||
          Number(value) < 0
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} không hợp lệ`,
          });
        }

        updates[field] = Number(value);
      }
    }

    if (
      updates.stock !== undefined &&
      !Number.isInteger(updates.stock)
    ) {
      return res.status(400).json({
        success: false,
        message: "Tồn kho phải là số nguyên",
      });
    }

    if (updates.featured !== undefined) {
      if (
        updates.featured !== true &&
        updates.featured !== false &&
        updates.featured !== "true" &&
        updates.featured !== "false"
      ) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái nổi bật không hợp lệ",
        });
      }

      updates.featured = updates.featured === true ||
        updates.featured === "true";
    }

    for (const field of ["image", "description", "badge"]) {
      if (updates[field] !== undefined) {
        if (typeof updates[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `Trường ${field} phải là chuỗi ký tự`,
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm cần cập nhật",
      });
    }

    return res.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("updateProduct:", error.message);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu cập nhật không hợp lệ",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật sản phẩm",
    });
  }
};

// DELETE /api/products/:id
// Xóa mềm: giữ dữ liệu trong MongoDB nhưng ẩn khỏi cửa hàng
const deleteProduct = async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true,
      },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm cần xóa",
      });
    }

    return res.json({
      success: true,
      message: "Xóa sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("deleteProduct:", error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
