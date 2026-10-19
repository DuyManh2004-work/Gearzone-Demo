
const mongoose = require("mongoose");
const User = require("../models/User");

// GET /api/users
// Lấy danh sách khách hàng, hỗ trợ tìm kiếm và phân trang
const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const search = (req.query.search || "").trim();
    const status = req.query.status;

    const filter = { role: "user" };

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
        { phone: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (["active", "blocked"].includes(status)) {
      filter.status = status;
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email phone role status avatar authProvider createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách khách hàng:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách khách hàng.",
    });
  }
};

// GET /api/users/:id
// Xem chi tiết một khách hàng
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID khách hàng không hợp lệ.",
      });
    }

    const user = await User.findOne({
      _id: id,
      role: "user",
    })
      .select("name email phone role status avatar authProvider createdAt updatedAt")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách hàng.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết khách hàng:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin khách hàng.",
    });
  }
};

// PATCH /api/users/:id/status
// Khóa hoặc mở khóa tài khoản khách hàng
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID khách hàng không hợp lệ.",
      });
    }

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái tài khoản không hợp lệ.",
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, role: "user" },
      { $set: { status } },
      { new: true, runValidators: true }
    ).select("name email phone role status avatar authProvider createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách hàng.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        status === "blocked"
          ? "Đã khóa tài khoản khách hàng."
          : "Đã mở khóa tài khoản khách hàng.",
      data: user,
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái khách hàng:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái khách hàng.",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
};
