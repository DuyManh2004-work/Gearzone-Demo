
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    setError("");
    setSubmitted(true);

    // Frontend demo: sẽ tích hợp API gửi email khi có backend.
  };

  return (
    <main className="forgot-password-page">
      <section className="forgot-password-card">
        <Link to="/login" className="forgot-back-link">
          <ArrowLeft size={18} />
          Quay lại đăng nhập
        </Link>

        {!submitted ? (
          <>
            <div className="forgot-icon">
              <Mail size={28} />
            </div>

            <span className="forgot-eyebrow">KHÔI PHỤC TÀI KHOẢN</span>
            <h1>Quên mật khẩu?</h1>
            <p className="forgot-description">
              Nhập email bạn đã đăng ký. Chúng tôi sẽ hỗ trợ bạn
              đặt lại mật khẩu.
            </p>

            <form onSubmit={handleSubmit} className="forgot-form">
              <label htmlFor="forgot-email">Địa chỉ email</label>

              <input
                id="forgot-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                required
              />

              {error && (
                <p className="forgot-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="forgot-submit-button">
                Gửi yêu cầu đặt lại mật khẩu
              </button>
            </form>

            <p className="forgot-help">
              Bạn đã nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
            </p>
          </>
        ) : (
          <div className="forgot-success" role="status">
            <div className="forgot-icon success">
              <CheckCircle2 size={30} />
            </div>

            <h1>Đã tiếp nhận yêu cầu</h1>
            <p>
              Nếu email này có tài khoản, bạn sẽ có thể nhận được
              hướng dẫn đặt lại mật khẩu sau khi hệ thống được kết nối
              với backend.
            </p>

            <button
              type="button"
              className="forgot-submit-button"
              onClick={() => setSubmitted(false)}
            >
              Thử email khác
            </button>

            <Link to="/login" className="forgot-login-link">
              Quay lại đăng nhập
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default ForgotPassword;
