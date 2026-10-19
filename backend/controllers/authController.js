
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Kiểm tra email theo định dạng cơ bản
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body || {};

    // 1. Kiểm tra dữ liệu đầu vào
    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin hợp lệ.",
      });
    }

    const name = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Họ tên phải có từ 2 đến 100 ký tự.",
      });
    }

    if (
      normalizedEmail.length > 254 ||
      !isValidEmail(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ.",
      });
    }

    if (
      password.length < 8 ||
      password.length > 128 ||
      !/[a-zA-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu cần có 8–128 ký tự, gồm chữ cái và chữ số.",
      });
    }

    // 2. Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email này đã được đăng ký.",
      });
    }

    // 3. Mã hóa mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Tạo tài khoản thông thường, không nhận role từ client
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      status: "active",
      authProvider: "local",
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản thành công.",
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Trường hợp hai yêu cầu đăng ký trùng email gần như đồng thời
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email này đã được đăng ký.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Thông tin đăng ký chưa hợp lệ.",
      });
    }

    console.error("Lỗi đăng ký:", error);

    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại.",
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // 1. Kiểm tra dữ liệu
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length > 254 ||
      !isValidEmail(normalizedEmail) ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: "Thông tin đăng nhập không hợp lệ.",
      });
    }

    // 2. Tìm tài khoản và lấy password đã mã hóa
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (
      !user ||
      user.authProvider !== "local" ||
      !user.password
    ) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    // 3. So sánh mật khẩu
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác.",
      });
    }

    // 4. Từ chối tài khoản bị khóa
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản hiện đang bị khóa.",
      });
    }

    // 5. Kiểm tra cấu hình JWT
    if (!process.env.JWT_SECRET) {
      console.error("Thiếu JWT_SECRET trong file .env");

      return res.status(500).json({
        success: false,
        message: "Máy chủ chưa được cấu hình xác thực.",
      });
    }

    // 6. Tạo token hết hạn sau 1 ngày
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // 7. Trả dữ liệu an toàn, không trả password
    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công.",
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          avatar: user.avatar || "",
        },
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);

    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi máy chủ. Vui lòng thử lại.",
    });
  }
};

module.exports = {
  register,
  login,
};
