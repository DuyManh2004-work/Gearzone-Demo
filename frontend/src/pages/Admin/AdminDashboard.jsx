
import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  Search,
  Bell,
  TrendingUp,
  DollarSign,
  ClipboardList,
  CircleUserRound,
  ExternalLink,
} from "lucide-react";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000/api/orders";

const navigation = [
  { label: "Tổng quan", path: "/admin", icon: LayoutDashboard },
  { label: "Sản phẩm", path: "/admin/products", icon: Package },
  { label: "Đơn hàng", path: "/admin/orders", icon: ShoppingCart },
  { label: "Khách hàng", path: "/admin/users", icon: Users },
  { label: "Cài đặt", path: "/admin/settings", icon: Settings },
];

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) => {
  if (!date) return "--";

  return new Date(date).toLocaleDateString("vi-VN");
};

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const getStatusClass = (status) => {
  switch (status) {
    case "delivered":
      return "completed";
    case "confirmed":
      return "processing";
    case "pending":
      return "pending";
    case "shipping":
      return "shipping";
    case "cancelled":
      return "cancelled";
    default:
      return "";
  }
};

const mapOrder = (order) => {
  const items = Array.isArray(order.items) ? order.items : [];

  const productNames = items.map((item) => item.name).filter(Boolean);

  let product = productNames.slice(0, 2).join(", ");

  if (productNames.length > 2) {
    product += ` và ${productNames.length - 2} sản phẩm khác`;
  }

  return {
    id: order._id,
    customer: order.customer?.fullName || "Khách hàng",
    product: product || "Chưa có thông tin sản phẩm",
    date: formatDate(order.createdAt),
    total: formatCurrency(order.totalAmount || 0),
    status: statusLabels[order.status] || order.status || "Không xác định",
    statusClass: getStatusClass(order.status),
  };
};

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setApiError("");

        const response = await axios.get(`${API_URL}/dashboard-stats`);

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Không thể tải dữ liệu tổng quan."
          );
        }

        setDashboardData(response.data.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);

        setApiError(
          error.response?.data?.message ||
            "Không thể kết nối đến máy chủ. Hãy kiểm tra backend và API."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statistics = [
    {
      title: "Doanh thu",
      value: dashboardData
        ? formatCurrency(dashboardData.revenue)
        : "--",
      icon: DollarSign,
    },
    {
      title: "Tổng đơn hàng",
      value: dashboardData
        ? (dashboardData.totalOrders || 0).toLocaleString("vi-VN")
        : "--",
      icon: ShoppingCart,
    },
    {
      title: "Chờ xác nhận",
      value: dashboardData
        ? (dashboardData.pendingOrders || 0).toLocaleString("vi-VN")
        : "--",
      icon: ClipboardList,
    },
    {
      title: "Đang giao",
      value: dashboardData
        ? (dashboardData.shippingOrders || 0).toLocaleString("vi-VN")
        : "--",
      icon: Package,
    },
  ];

  const recentOrders = (dashboardData?.recentOrders || []).map(mapOrder);

  const filteredOrders = recentOrders.filter((order) =>
    `${order.id} ${order.customer} ${order.product}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      {sidebarOpen && (
        <button
          className="admin-sidebar-overlay"
          aria-label="Đóng menu quản trị"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""}`}
      >
        <Link to="/admin" className="admin-brand">
          <span className="admin-brand-icon">G</span>
          <span>
            <strong>GEARZONE</strong>
            <small>ADMINISTRATION</small>
          </span>
        </Link>

        <div className="admin-sidebar-label">MENU QUẢN TRỊ</div>

        <nav className="admin-navigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/admin"}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <div className="admin-profile-info">
              <strong>Quản trị viên</strong>
              <span>Administrator</span>
            </div>
          </div>

          <Link to="/" className="admin-back-store">
            <ExternalLink size={17} />
            <span>Quay lại cửa hàng</span>
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu quản trị"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="admin-breadcrumb">Quản trị /</span>
              <h1>Tổng quan</h1>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <label className="admin-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Tìm đơn hàng..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <button
              className="admin-notification"
              aria-label="Thông báo"
              title="Thông báo"
            >
              <Bell size={20} />
              <span />
            </button>

            <div className="admin-topbar-user">
              <CircleUserRound size={23} />
              <span>Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome">
            <div>
              <h2>Chào mừng trở lại!</h2>
              <p>Đây là tình hình hoạt động của cửa hàng GEARZONE.</p>
            </div>

            <span className="admin-date">
              {new Date().toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </section>

          {apiError && (
            <div
              role="alert"
              style={{
                marginBottom: 20,
                padding: 14,
                borderRadius: 8,
                background: "#fff1f0",
                color: "#b42318",
              }}
            >
              {apiError}
            </div>
          )}

          <section className="admin-statistics">
            {statistics.map((item) => {
              const Icon = item.icon;

              return (
                <article className="admin-stat-card" key={item.title}>
                  <div className="admin-stat-top">
                    <span>{item.title}</span>
                    <div className="admin-stat-icon">
                      <Icon size={21} />
                    </div>
                  </div>

                  <strong className="admin-stat-value">
                    {loading ? "Đang tải..." : item.value}
                  </strong>

                  <div className="admin-stat-change positive">
                    <TrendingUp size={15} />
                    <span>Dữ liệu từ hệ thống</span>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="admin-overview-grid">
            <article className="admin-panel admin-revenue-panel">
              <div className="admin-panel-heading">
                <div>
                  <h3>Tổng quan doanh thu</h3>
                  <p>Biểu đồ minh họa doanh thu theo tháng</p>
                </div>

                <select
                  aria-label="Khoảng thời gian doanh thu"
                  defaultValue="6"
                >
                  <option value="6">6 tháng gần đây</option>
                  <option value="12">12 tháng gần đây</option>
                </select>
              </div>

              <div className="admin-chart">
                {[
                  42, 65, 50, 78, 58, 88, 70, 96, 62, 80, 72, 100,
                ].map((height, index) => (
                  <div className="admin-chart-column" key={index}>
                    <div className="admin-chart-track">
                      <div
                        className="admin-chart-bar"
                        style={{ height: `${height}%` }}
                        title={`Tháng ${index + 1}`}
                      />
                    </div>

                    <span>
                      {[
                        "T1",
                        "T2",
                        "T3",
                        "T4",
                        "T5",
                        "T6",
                        "T7",
                        "T8",
                        "T9",
                        "T10",
                        "T11",
                        "T12",
                      ][index]}
                    </span>
                  </div>
                ))}
              </div>

              <p className="admin-demo-note">
                * Biểu đồ vẫn dùng dữ liệu minh họa, chưa kết nối doanh thu
                theo tháng.
              </p>
            </article>

            <article className="admin-panel admin-quick-panel">
              <div className="admin-panel-heading">
                <div>
                  <h3>Truy cập nhanh</h3>
                  <p>Các chức năng quản trị</p>
                </div>
              </div>

              <div className="admin-quick-links">
                <Link to="/admin/products">
                  <span className="admin-quick-icon">
                    <Package size={20} />
                  </span>
                  <span>
                    <strong>Quản lý sản phẩm</strong>
                    <small>Thêm, sửa và xóa sản phẩm</small>
                  </span>
                </Link>

                <Link to="/admin/orders">
                  <span className="admin-quick-icon">
                    <ClipboardList size={20} />
                  </span>
                  <span>
                    <strong>Quản lý đơn hàng</strong>
                    <small>Kiểm tra trạng thái đơn hàng</small>
                  </span>
                </Link>

                <Link to="/admin/users">
                  <span className="admin-quick-icon">
                    <Users size={20} />
                  </span>
                  <span>
                    <strong>Quản lý khách hàng</strong>
                    <small>Xem danh sách tài khoản</small>
                  </span>
                </Link>
              </div>
            </article>
          </section>

          <section className="admin-panel admin-orders-panel">
            <div className="admin-panel-heading">
              <div>
                <h3>Đơn hàng gần đây</h3>
                <p>Theo dõi những đơn hàng mới nhất</p>
              </div>

              <Link to="/admin/orders" className="admin-view-all">
                Xem tất cả
              </Link>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="admin-empty-state">
                        Đang tải đơn hàng...
                      </td>
                    </tr>
                  ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="admin-order-id">
                          #{order.id.slice(-6).toUpperCase()}
                        </td>

                        <td>{order.customer}</td>
                        <td>{order.product}</td>
                        <td>{order.date}</td>

                        <td className="admin-order-total">{order.total}</td>

                        <td>
                          <span
                            className={`admin-order-status ${order.statusClass}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="admin-empty-state">
                        {apiError
                          ? "Không thể tải đơn hàng. Hãy kiểm tra kết nối backend."
                          : searchTerm
                          ? "Không tìm thấy đơn hàng phù hợp."
                          : "Chưa có đơn hàng nào."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
