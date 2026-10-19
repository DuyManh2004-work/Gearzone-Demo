
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  UserRound,
  Save,
  Package,
  LogOut,
  Store,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { user, profile, updateProfile, logout } = useAuth();

  const role = String(user?.role ?? user?.vaiTro ?? user?.vaitro ?? "")
    .trim()
    .toLowerCase();

  const isAdmin = ["admin", "administrator", "quản trị viên"].includes(role);

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || user?.fullName || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (formData.fullName.trim().length < 2) {
      setIsError(true);
      setMessage("Họ và tên phải có ít nhất 2 ký tự.");
      return;
    }

    const result = updateProfile(formData);

    setIsError(!result.success);
    setMessage(
      result.success
        ? "Đã cập nhật hồ sơ demo."
        : result.message
    );
  }

  function handleLogout() {
    logout();
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-heading">
          <div>
            <p className="profile-eyebrow">TÀI KHOẢN GEARZONE</p>
            <h1>Hồ sơ của tôi</h1>
            <p>Quản lý thông tin cá nhân và mua sắm của bạn.</p>
          </div>

          <button
            type="button"
            className="profile-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar">
              <UserRound size={32} />
            </div>

            <h2>{user.fullName || formData.fullName}</h2>
            <p className="profile-email">{user.email}</p>

            <nav className="profile-nav">
              <Link to="/profile" className="profile-nav-link active">
                <UserRound size={18} />
                Hồ sơ cá nhân
              </Link>

              <Link to="/orders" className="profile-nav-link">
                <Package size={18} />
                Đơn hàng của tôi
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="profile-nav-link profile-admin-link"
                >
                  <Store size={18} />
                  <span>Quản lý cửa hàng</span>
                  <ChevronRight size={17} className="profile-admin-arrow" />
                </Link>
              )}
            </nav>
          </aside>

          <section className="profile-form-card">
            <h2>Thông tin cá nhân</h2>
            <p className="profile-form-description">
              Cập nhật thông tin liên hệ của bạn.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="profile-field">
                <label htmlFor="profile-name">Họ và tên</label>
                <input
                  id="profile-name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={user.email || ""}
                  readOnly
                />
                <small>Email chưa thể thay đổi trong bản demo.</small>
              </div>

              <div className="profile-field">
                <label htmlFor="profile-phone">Số điện thoại</label>
                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  maxLength={20}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-address">Địa chỉ giao hàng</label>
                <textarea
                  id="profile-address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  maxLength={300}
                  rows={3}
                  placeholder="Nhập địa chỉ giao hàng"
                />
              </div>

              {message && (
                <p
                  className={
                    isError
                      ? "profile-message error"
                      : "profile-message success"
                  }
                  role="status"
                >
                  {message}
                </p>
              )}

              <button type="submit" className="profile-save">
                <Save size={17} />
                Lưu thay đổi
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Profile;
