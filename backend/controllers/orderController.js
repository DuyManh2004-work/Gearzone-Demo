
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// POST /api/orders

const createOrder = async (req, res, next) => {
  try {
    const { customer, items, paymentMethod = "cod" } = req.body;

    // Kiểm tra thông tin đầu vào
    if (
      !customer ||
      !customer.fullName?.trim() ||
      !customer.phone?.trim() ||
      !customer.address?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng đang trống.",
      });
    }

    if (!["cod", "bank_transfer"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán không hợp lệ.",
      });
    }

    // Lấy thông tin và giá sản phẩm trực tiếp từ MongoDB
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const rawId = String(
        item.productId ?? item._id ?? item.id ?? ""
      );

      const quantity = Number(item.quantity);

      if (
        !rawId ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Thông tin sản phẩm hoặc số lượng không hợp lệ.",
        });
      }

      let product = null;

      if (/^[a-f\d]{24}$/i.test(rawId) &&
          mongoose.Types.ObjectId.isValid(rawId)) {
        product = await Product.findOne({
          _id: rawId,
          isActive: true,
        });
      } else if (/^\d+$/.test(rawId)) {
        product = await Product.findOne({
          id: Number(rawId),
          isActive: true,
        });
      }

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Không tìm thấy sản phẩm có mã ${rawId}.`,
        });
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Giá sản phẩm không hợp lệ.",
        });
      }

      // Nếu sản phẩm có quản lý tồn kho, kiểm tra số lượng
      if (
        Number.isFinite(product.stock) &&
        product.stock < quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" không đủ số lượng.`,
        });
      }

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: product.image || "",
        price,
        quantity,
      });

      totalAmount += price * quantity;
    }

    // Lưu đơn hàng
    const order = await Order.create({
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || "",
        address: customer.address.trim(),
      },
      items: orderItems,
      totalAmount,
      paymentMethod,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};


const getOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );

    const filter = {};

    // Lọc theo trạng thái đơn hàng
    if (req.query.status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "shipping",
        "delivered",
        "cancelled",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái đơn hàng không hợp lệ.",
        });
      }

      filter.status = req.query.status;
    }

    // Tìm theo tên, số điện thoại hoặc email khách hàng
    if (req.query.search?.trim()) {
      const keyword = req.query.search.trim().slice(0, 100);
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedKeyword, "i");

      filter.$or = [
        { "customer.fullName": regex },
        { "customer.phone": regex },
        { "customer.email": regex },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};


const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipping",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đơn hàng không hợp lệ.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công.",
      data: order,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Mã đơn hàng không hợp lệ.",
      });
    }

    next(error);
  }
};


const getOrderDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      shippingOrders,
      deliveredOrders,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "shipping" }),
      Order.countDocuments({ status: "delivered" }),

      Order.aggregate([
        { $match: { status: "delivered" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]),

      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "customer items totalAmount paymentMethod status createdAt"
        )
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        shippingOrders,
        deliveredOrders,
        revenue: revenueResult[0]?.totalRevenue || 0,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderDashboardStats,
};
