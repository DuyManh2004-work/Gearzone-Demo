
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();

    setError("");
    setSuccess("");

    if (fullName.length < 2) {
      setError("Họ và tên phải có ít nhất 2 ký tự.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Mật khẩu cần có ít nhất 8 ký tự.");
      return;
    }

    if (
      !/[a-zA-Z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      setError("Mật khẩu cần có chữ cái và chữ số.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        fullName,
        email,
        password: formData.password,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess("Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch {
      setError("Không thể đăng ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <div className="register-icon">
          <UserRound size={28} />
        </div>

        <h1>Tạo tài khoản</h1>

        <p className="register-description">
          Tham gia GEARZONE để khám phá thế giới gaming gear.
        </p>

        <div className="register-field">
          <label htmlFor="register-name">Họ và tên</label>
          <input
            id="register-name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            maxLength={100}
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        <div className="register-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            maxLength={254}
            placeholder="example@email.com"
            required
          />
        </div>

        <div className="register-field">
          <label htmlFor="register-password">Mật khẩu</label>

          <div className="register-password-wrapper">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              placeholder="Ít nhất 8 ký tự"
              required
            />

            <button
              type="button"
              className="register-password-toggle"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <p className="register-hint">
            Dùng ít nhất 8 ký tự, gồm chữ cái và chữ số.
          </p>
        </div>

        <div className="register-field">
          <label htmlFor="register-confirm-password">
            Xác nhận mật khẩu
          </label>

          <div className="register-password-wrapper">
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              maxLength={128}
              placeholder="Nhập lại mật khẩu"
              required
            />

            <button
              type="button"
              className="register-password-toggle"
              aria-label={
                showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
              }
              onClick={() =>
                setShowConfirmPassword((value) => !value)
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="register-message" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p
            className="register-message register-message-success"
            role="status"
          >
            {success}
          </p>
        )}

        <button
          type="submit"
          className="register-submit"
          disabled={loading}
        >
          {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>

        <p className="register-login">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>

        <Link to="/" className="register-home-link">
          Quay lại trang chủ
        </Link>
      </form>
    </main>
  );
}

export default Register;
