
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  X,
  Bell,
  Store,
  Truck,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  CircleUserRound,
  ExternalLink,
} from "lucide-react";
import "./AdminSettings.css";

const STORAGE_KEY = "gearzone_admin_settings";

const defaultSettings = {
  storeName: "GEARZONE",
  storeEmail: "support@gearzone.vn",
  storePhone: "0901234567",
  storeAddress: "Hà Nội, Việt Nam",
  currency: "VND",
  shippingFee: "30000",
  freeShippingFrom: "1000000",
  minimumOrder: "100000",
  defaultOrderStatus: "pending",
  emailNotifications: true,
  orderNotifications: true,
  maintenanceMode: false,
};

function getInitialSettings() {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);

    if (savedSettings) {
      return {
        ...defaultSettings,
        ...JSON.parse(savedSettings),
      };
    }
  } catch (error) {
    console.error("Không thể đọc cài đặt:", error);
  }

  return { ...defaultSettings };
}

function AdminSettings() {
  const [settings, setSettings] = useState(getInitialSettings);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!settings.storeName.trim()) {
      setMessageType("error");
      setMessage("Vui lòng nhập tên cửa hàng.");
      return;
    }

    if (
      settings.storeEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.storeEmail)
    ) {
      setMessageType("error");
      setMessage("Email liên hệ không hợp lệ.");
      return;
    }

    const numericFields = [
      ["shippingFee", "Phí vận chuyển"],
      ["freeShippingFrom", "Mức miễn phí vận chuyển"],
      ["minimumOrder", "Giá trị đơn hàng tối thiểu"],
    ];

    for (const [field, label] of numericFields) {
      if (
        settings[field] === "" ||
        !Number.isFinite(Number(settings[field])) ||
        Number(settings[field]) < 0
      ) {
        setMessageType("error");
        setMessage(`${label} phải là số không âm.`);
        return;
      }
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setMessageType("success");
      setMessage("Đã lưu cài đặt thành công.");
    } catch (error) {
      console.error("Không thể lưu cài đặt:", error);
      setMessageType("error");
      setMessage("Không thể lưu cài đặt trên trình duyệt.");
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Bạn có muốn khôi phục toàn bộ cài đặt về mặc định không?"
    );

    if (!confirmed) return;

    setSettings({ ...defaultSettings });

    try {
      localStorage.removeItem(STORAGE_KEY);
      setMessageType("success");
      setMessage("Đã khôi phục cài đặt mặc định.");
    } catch (error) {
      console.error("Không thể khôi phục cài đặt:", error);
      setMessageType("error");
      setMessage("Không thể khôi phục cài đặt.");
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-dashboard admin-settings-page">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          aria-label="Đóng menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <Package size={23} />
          </div>

          <div>
            <h2>GEARZONE</h2>
            <span>ADMINISTRATION</span>
          </div>

          <button
            type="button"
            className="admin-settings-close-sidebar"
            aria-label="Đóng menu"
            onClick={closeSidebar}
          >
            <X size={21} />
          </button>
        </div>

        <div className="admin-sidebar-label">MENU CHÍNH</div>

        <nav className="admin-navigation">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <LayoutDashboard size={19} />
            <span>Tổng quan</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <Package size={19} />
            <span>Sản phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <ShoppingCart size={19} />
            <span>Đơn hàng</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <Users size={19} />
            <span>Khách hàng</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <Settings size={19} />
            <span>Cài đặt</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-bottom">
          <Link to="/" className="admin-back-store">
            <ExternalLink size={17} />
            <span>Xem cửa hàng</span>
          </Link>

          <div className="admin-profile">
            <div className="admin-avatar">
              <CircleUserRound size={23} />
            </div>

            <div className="admin-profile-info">
              <strong>Quản trị viên</strong>
              <span>Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-menu"
              aria-label="Mở menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <div className="admin-breadcrumb">
                Quản trị / <span>Cài đặt</span>
              </div>
              <h1>Cài đặt hệ thống</h1>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-topbar-user">
              <CircleUserRound size={19} />
              <span>Quản trị viên</span>
            </div>
          </div>
        </header>

        <div className="admin-content admin-settings-content">
          <div className="admin-settings-intro">
            <div>
              <h2>Thiết lập cửa hàng</h2>
              <p>
                Quản lý thông tin, đơn hàng và các tùy chọn của GEARZONE.
              </p>
            </div>

            <span className="admin-settings-local-badge">
              <ShieldCheck size={15} />
              Cài đặt trên trình duyệt
            </span>
          </div>

          <form onSubmit={handleSave}>
            <section className="admin-settings-card">
              <div className="admin-settings-card-heading">
                <div className="admin-settings-section-icon store">
                  <Store size={21} />
                </div>

                <div>
                  <h3>Thông tin cửa hàng</h3>
                  <p>Thông tin cơ bản để khách hàng liên hệ với cửa hàng.</p>
                </div>
              </div>

              <div className="admin-settings-form-grid">
                <div className="admin-settings-field">
                  <label htmlFor="storeName">Tên cửa hàng *</label>
                  <input
                    id="storeName"
                    name="storeName"
                    value={settings.storeName}
                    onChange={handleChange}
                    placeholder="Nhập tên cửa hàng"
                    required
                  />
                </div>

                <div className="admin-settings-field">
                  <label htmlFor="storeEmail">Email liên hệ</label>
                  <input
                    id="storeEmail"
                    name="storeEmail"
                    type="email"
                    value={settings.storeEmail}
                    onChange={handleChange}
                    placeholder="support@example.com"
                  />
                </div>

                <div className="admin-settings-field">
                  <label htmlFor="storePhone">Số điện thoại</label>
                  <input
                    id="storePhone"
                    name="storePhone"
                    type="tel"
                    value={settings.storePhone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="admin-settings-field">
                  <label htmlFor="storeAddress">Địa chỉ cửa hàng</label>
                  <input
                    id="storeAddress"
                    name="storeAddress"
                    value={settings.storeAddress}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                <div className="admin-settings-field">
                  <label htmlFor="currency">Đơn vị tiền tệ</label>
                  <select
                    id="currency"
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                  >
                    <option value="VND">VND - Việt Nam đồng</option>
                  </select>
                  <small>Đơn vị tiền tệ đang sử dụng trong cửa hàng.</small>
                </div>
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-card-heading">
                <div className="admin-settings-section-icon shipping">
                  <Truck size={21} />
                </div>

                <div>
                  <h3>Cài đặt đơn hàng và vận chuyển</h3>
                  <p>Thiết lập các giá trị mặc định cho đơn hàng.</p>
                </div>
              </div>

              <div className="admin-settings-form-grid">
                <div className="admin-settings-field">
                  <label htmlFor="shippingFee">Phí vận chuyển (₫)</label>
                  <input
                    id="shippingFee"
                    name="shippingFee"
                    type="number"
                    min="0"
                    step="1000"
                    value={settings.shippingFee}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-settings-field">
                  <label htmlFor="freeShippingFrom">
                    Miễn phí vận chuyển từ (₫)
                  </label>
                  <input
                    id="freeShippingFrom"
                    name="freeShippingFrom"
                    type="number"
                    min="0"
                    step="1000"
                    value={settings.freeShippingFrom}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-settings-field">
                  <label htmlFor="minimumOrder">
                    Giá trị đơn hàng tối thiểu (₫)
                  </label>
                  <input
                    id="minimumOrder"
                    name="minimumOrder"
                    type="number"
                    min="0"
                    step="1000"
                    value={settings.minimumOrder}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-settings-field">
                  <label htmlFor="defaultOrderStatus">
                    Trạng thái đơn hàng mặc định
                  </label>
                  <select
                    id="defaultOrderStatus"
                    name="defaultOrderStatus"
                    value={settings.defaultOrderStatus}
                    onChange={handleChange}
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                  </select>
                  <small>
                    Đây là thiết lập giao diện; cần tích hợp backend để áp dụng
                    cho đơn hàng thực tế.
                  </small>
                </div>
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-card-heading">
                <div className="admin-settings-section-icon notifications">
                  <Bell size={21} />
                </div>

                <div>
                  <h3>Thông báo và hệ thống</h3>
                  <p>Tùy chỉnh các tùy chọn hiển thị của trang quản trị.</p>
                </div>
              </div>

              <div className="admin-settings-options">
                <div className="admin-settings-option">
                  <div className="admin-settings-option-text">
                    <strong>Thông báo qua email</strong>
                    <span>
                      Cho phép bật tùy chọn thông báo email trong cấu hình.
                    </span>
                  </div>

                  <label className="admin-settings-switch">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                    />
                    <span className="admin-settings-switch-slider" />
                  </label>
                </div>

                <div className="admin-settings-option">
                  <div className="admin-settings-option-text">
                    <strong>Thông báo đơn hàng</strong>
                    <span>
                      Bật tùy chọn theo dõi đơn hàng trong hệ thống.
                    </span>
                  </div>

                  <label className="admin-settings-switch">
                    <input
                      type="checkbox"
                      name="orderNotifications"
                      checked={settings.orderNotifications}
                      onChange={handleChange}
                    />
                    <span className="admin-settings-switch-slider" />
                  </label>
                </div>

                <div className="admin-settings-option">
                  <div className="admin-settings-option-text">
                    <strong>Chế độ bảo trì</strong>
                    <span>
                      Lưu lựa chọn bảo trì để sử dụng khi tích hợp backend.
                    </span>
                  </div>

                  <label className="admin-settings-switch">
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleChange}
                    />
                    <span className="admin-settings-switch-slider" />
                  </label>
                </div>
              </div>

              {settings.maintenanceMode && (
                <div className="admin-settings-warning">
                  <AlertTriangle size={18} />
                  <p>
                    Chế độ bảo trì đang được bật trong cấu hình demo. Trạng
                    thái này chưa tự động khóa cửa hàng đối với khách hàng.
                  </p>
                </div>
              )}
            </section>

            <div className="admin-settings-actions">
              <button
                type="button"
                className="admin-settings-reset-button"
                onClick={handleReset}
              >
                <RotateCcw size={17} />
                Khôi phục mặc định
              </button>

              <button type="submit" className="admin-settings-save-button">
                <Save size={17} />
                Lưu cài đặt
              </button>
            </div>
          </form>
        </div>
      </main>

      {message && (
        <div
          className={`admin-settings-toast ${
            messageType === "error" ? "error" : "success"
          }`}
          role="status"
        >
          {messageType === "error" ? (
            <AlertTriangle size={19} />
          ) : (
            <CheckCircle2 size={19} />
          )}
          <span>{message}</span>

          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setMessage("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
