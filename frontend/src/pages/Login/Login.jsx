
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      if (!result.success) {
        setError(result.message || "Đăng nhập thất bại.");
        return;
      }

      // Điều hướng theo vai trò tài khoản
      if (result.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch {
      setError("Không thể đăng nhập. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">
          <UserRound size={28} />
        </div>

        <h1>Đăng nhập</h1>

        <p className="login-description">
          Chào mừng bạn quay lại GEARZONE.
        </p>

        <label htmlFor="login-email">Email</label>

        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
          autoComplete="email"
          placeholder="Nhập email của bạn"
          maxLength={254}
          required
        />

        <label htmlFor="login-password">Mật khẩu</label>

        <div className="login-password-wrapper">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            maxLength={128}
            required
          />

          <button
            type="button"
            className="login-password-toggle"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <div className="login-extra-links">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </div>

        <button
          type="submit"
          className="login-submit"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        <p className="login-register">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>

        <Link to="/" className="login-home-link">
          Quay lại trang chủ
        </Link>
      </form>
    </main>
  );
}

export default Login;
