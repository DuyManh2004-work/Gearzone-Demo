
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Menu,
  X,
  Search,
  Pencil,
  Trash2,
  UserRound,
  UserCheck,
  UserX,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  CircleUserRound,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
} from "lucide-react";
import "./AdminUsers.css";

const STORAGE_KEY = "gearzone_admin_users";

const initialUsers = [
  {
    id: "user-1",
    name: "Nguyễn Minh Anh",
    email: "minhanh@example.com",
    phone: "0912345678",
    address: "Hà Nội",
    status: "Hoạt động",
    orders: 8,
    totalSpent: 12450000,
    joinedAt: "2026-08-12",
  },
  {
    id: "user-2",
    name: "Trần Hoàng Nam",
    email: "hoangnam@example.com",
    phone: "0987654321",
    address: "Bắc Ninh",
    status: "Hoạt động",
    orders: 5,
    totalSpent: 7890000,
    joinedAt: "2026-08-20",
  },
  {
    id: "user-3",
    name: "Lê Thu Hà",
    email: "thuha@example.com",
    phone: "0901122334",
    address: "Hải Phòng",
    status: "Bị khóa",
    orders: 2,
    totalSpent: 2190000,
    joinedAt: "2026-09-02",
  },
  {
    id: "user-4",
    name: "Phạm Đức Huy",
    email: "duchuy@example.com",
    phone: "0933445566",
    address: "Đà Nẵng",
    status: "Hoạt động",
    orders: 12,
    totalSpent: 18790000,
    joinedAt: "2026-09-10",
  },
  {
    id: "user-5",
    name: "Đỗ Ngọc Linh",
    email: "ngoclinh@example.com",
    phone: "0977889900",
    address: "TP. Hồ Chí Minh",
    status: "Chưa xác minh",
    orders: 0,
    totalSpent: 0,
    joinedAt: "2026-09-25",
  },
  {
    id: "user-6",
    name: "Vũ Quang Minh",
    email: "quangminh@example.com",
    phone: "0966112233",
    address: "Nam Định",
    status: "Hoạt động",
    orders: 3,
    totalSpent: 4650000,
    joinedAt: "2026-10-01",
  },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  status: "Hoạt động",
};

const statusOptions = ["Hoạt động", "Bị khóa", "Chưa xác minh"];

function readUsers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Không thể đọc dữ liệu khách hàng:", error);
  }

  return initialUsers;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function getInitials(name) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "KH"
  );
}

function AdminUsers() {
  const [users, setUsers] = useState(readUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Không thể lưu dữ liệu khách hàng:", error);
    }
  }, [users]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.includes(keyword);

      const matchesStatus =
        statusFilter === "Tất cả" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const activeCount = users.filter(
    (user) => user.status === "Hoạt động"
  ).length;

  const lockedCount = users.filter(
    (user) => user.status === "Bị khóa"
  ).length;

  const totalOrders = users.reduce(
    (total, user) => total + Number(user.orders || 0),
    0
  );

  const totalSpent = users.reduce(
    (total, user) => total + Number(user.totalSpent || 0),
    0
  );

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      status: user.status,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData(emptyForm);
    setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const address = formData.address.trim();

    if (!name || !email || !phone) {
      setFormError("Vui lòng nhập họ tên, email và số điện thoại.");
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValid) {
      setFormError("Địa chỉ email chưa hợp lệ.");
      return;
    }

    const phoneValid = /^[0-9+\s().-]{9,16}$/.test(phone);

    if (!phoneValid) {
      setFormError("Số điện thoại chưa hợp lệ.");
      return;
    }

    const duplicate = users.some(
      (user) =>
        user.id !== editingUser?.id &&
        (user.email.toLowerCase() === email || user.phone === phone)
    );

    if (duplicate) {
      setFormError("Email hoặc số điện thoại đã tồn tại.");
      return;
    }

    if (editingUser) {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name,
                email,
                phone,
                address,
                status: formData.status,
              }
            : user
        )
      );

      setNotice("Đã cập nhật thông tin khách hàng.");
    } else {
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        phone,
        address,
        status: formData.status,
        orders: 0,
        totalSpent: 0,
        joinedAt: new Date().toISOString().slice(0, 10),
      };

      setUsers((previous) => [newUser, ...previous]);
      setNotice("Đã thêm khách hàng demo.");
    }

    closeModal();
  };

  const handleDelete = (user) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa khách hàng "${user.name}" khỏi danh sách demo không?`
    );

    if (!confirmed) return;

    setUsers((previous) =>
      previous.filter((item) => item.id !== user.id)
    );

    if (viewingUser?.id === user.id) {
      setViewingUser(null);
    }

    setNotice("Đã xóa khách hàng demo.");
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Khôi phục danh sách khách hàng mẫu? Các thay đổi hiện tại sẽ bị mất."
    );

    if (!confirmed) return;

    setUsers(initialUsers);
    setSearchTerm("");
    setStatusFilter("Tất cả");
    setNotice("Đã khôi phục dữ liệu khách hàng mẫu.");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-dashboard admin-users-page">
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
        <Link to="/admin" className="admin-brand" onClick={closeSidebar}>
          <span className="admin-brand-icon">
            <ShoppingBag size={22} />
          </span>

          <span>
            <strong>GEARZONE</strong>
            <small>ADMINISTRATION</small>
          </span>

          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="Đóng menu"
            onClick={(event) => {
              event.preventDefault();
              closeSidebar();
            }}
          >
            <X size={20} />
          </button>
        </Link>

        <div className="admin-sidebar-label">MENU CHÍNH</div>

        <nav className="admin-navigation">
          <NavLink
            to="/admin"
            end
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <LayoutDashboard size={18} />
            <span>Tổng quan</span>
          </NavLink>

          <NavLink
            to="/admin/products"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <Package size={18} />
            <span>Sản phẩm</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <ShoppingCart size={18} />
            <span>Đơn hàng</span>
          </NavLink>

          <NavLink
            to="/admin/users"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <Users size={18} />
            <span>Khách hàng</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className="admin-nav-link"
            onClick={closeSidebar}
          >
            <Settings size={18} />
            <span>Cài đặt</span>
          </NavLink>
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
            <ExternalLink size={16} />
            <span>Quay lại cửa hàng</span>
          </Link>
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
              <Menu size={21} />
            </button>

            <div>
              <div className="admin-breadcrumb">
                Admin <ChevronRight size={13} /> Khách hàng
              </div>
              <h1>Quản lý khách hàng</h1>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <Link to="/" className="admin-topbar-user">
              <CircleUserRound size={19} />
              <span>Quản trị viên</span>
            </Link>
          </div>
        </header>

        <section className="admin-content admin-users-content">
          <div className="admin-users-heading">
            <div>
              <h2>Danh sách khách hàng</h2>
              <p>
                Theo dõi thông tin, trạng thái tài khoản và lịch sử mua hàng.
              </p>
            </div>

            <button
              type="button"
              className="admin-user-reset-button"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              Khôi phục dữ liệu
            </button>
          </div>

          <div className="admin-user-statistics">
            <article className="admin-user-stat-card">
              <div className="admin-user-stat-icon">
                <Users size={21} />
              </div>
              <span>Tổng khách hàng</span>
              <strong>{users.length}</strong>
              <small>Tài khoản trong dữ liệu demo</small>
            </article>

            <article className="admin-user-stat-card">
              <div className="admin-user-stat-icon active">
                <UserCheck size={21} />
              </div>
              <span>Đang hoạt động</span>
              <strong>{activeCount}</strong>
              <small>Tài khoản có trạng thái hoạt động</small>
            </article>

            <article className="admin-user-stat-card">
              <div className="admin-user-stat-icon locked">
                <UserX size={21} />
              </div>
              <span>Tài khoản bị khóa</span>
              <strong>{lockedCount}</strong>
              <small>Tài khoản đang bị khóa trong demo</small>
            </article>

            <article className="admin-user-stat-card">
              <div className="admin-user-stat-icon orders">
                <ShoppingBag size={21} />
              </div>
              <span>Tổng đơn hàng</span>
              <strong>{totalOrders}</strong>
              <small>
                Tổng chi tiêu mẫu: {formatCurrency(totalSpent)}
              </small>
            </article>
          </div>

          <section className="admin-user-panel">
            <div className="admin-user-toolbar">
              <label className="admin-user-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <select
                aria-label="Lọc trạng thái khách hàng"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-user-result">
              Hiển thị <strong>{filteredUsers.length}</strong> /{" "}
              <strong>{users.length}</strong> khách hàng
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table admin-users-table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Liên hệ</th>
                    <th>Đơn hàng</th>
                    <th>Tổng chi tiêu</th>
                    <th>Ngày tham gia</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-user-name-cell">
                          <div className="admin-user-avatar">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <strong>{user.name}</strong>
                            <span>ID: {user.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-user-contact">
                          <span>
                            <Mail size={13} />
                            {user.email}
                          </span>
                          <span>
                            <Phone size={13} />
                            {user.phone}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="admin-user-order-count">
                          {user.orders}
                        </span>
                      </td>

                      <td>
                        <strong className="admin-user-spending">
                          {formatCurrency(user.totalSpent)}
                        </strong>
                      </td>

                      <td>
                        <span className="admin-user-date">
                          {formatDate(user.joinedAt)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-user-status ${
                            user.status === "Hoạt động"
                              ? "active"
                              : user.status === "Bị khóa"
                                ? "locked"
                                : "unverified"
                          }`}
                        >
                          <span />
                          {user.status}
                        </span>
                      </td>

                      <td>
                        <div className="admin-user-actions">
                          <button
                            type="button"
                            title="Xem chi tiết"
                            aria-label={`Xem ${user.name}`}
                            onClick={() => setViewingUser(user)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Chỉnh sửa"
                            aria-label={`Sửa ${user.name}`}
                            onClick={() => openEditModal(user)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="delete"
                            title="Xóa khách hàng demo"
                            aria-label={`Xóa ${user.name}`}
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="admin-user-empty">
                  <Search size={30} />
                  <strong>Không tìm thấy khách hàng</strong>
                  <p>Hãy thử từ khóa khác hoặc thay đổi bộ lọc.</p>
                </div>
              )}
            </div>

            <div className="admin-user-table-footer">
              Dữ liệu khách hàng demo được lưu trên trình duyệt, chưa kết nối backend.
            </div>
          </section>
        </section>
      </main>

      {notice && (
        <div className="admin-user-toast" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {viewingUser && (
        <div
          className="admin-user-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setViewingUser(null);
            }
          }}
        >
          <section
            className="admin-user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-detail-title"
          >
            <div className="admin-user-modal-heading">
              <div>
                <span>THÔNG TIN KHÁCH HÀNG</span>
                <h2 id="admin-user-detail-title">Chi tiết tài khoản</h2>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setViewingUser(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-user-detail-body">
              <div className="admin-user-detail-profile">
                <div className="admin-user-detail-avatar">
                  {getInitials(viewingUser.name)}
                </div>
                <div>
                  <h3>{viewingUser.name}</h3>
                  <span>{viewingUser.email}</span>
                  <span
                    className={`admin-user-status ${
                      viewingUser.status === "Hoạt động"
                        ? "active"
                        : viewingUser.status === "Bị khóa"
                          ? "locked"
                          : "unverified"
                    }`}
                  >
                    <span />
                    {viewingUser.status}
                  </span>
                </div>
              </div>

              <div className="admin-user-detail-grid">
                <div>
                  <span>
                    <Mail size={15} /> Email
                  </span>
                  <strong>{viewingUser.email}</strong>
                </div>
                <div>
                  <span>
                    <Phone size={15} /> Số điện thoại
                  </span>
                  <strong>{viewingUser.phone}</strong>
                </div>
                <div>
                  <span>
                    <MapPin size={15} /> Địa chỉ
                  </span>
                  <strong>{viewingUser.address || "Chưa cập nhật"}</strong>
                </div>
                <div>
                  <span>
                    <CalendarDays size={15} /> Ngày tham gia
                  </span>
                  <strong>{formatDate(viewingUser.joinedAt)}</strong>
                </div>
                <div>
                  <span>
                    <ShoppingBag size={15} /> Số đơn hàng
                  </span>
                  <strong>{viewingUser.orders}</strong>
                </div>
                <div>
                  <span>
                    <UserRound size={15} /> Tổng chi tiêu mẫu
                  </span>
                  <strong>{formatCurrency(viewingUser.totalSpent)}</strong>
                </div>
              </div>

              <div className="admin-user-detail-actions">
                <button
                  type="button"
                  className="admin-user-cancel-button"
                  onClick={() => setViewingUser(null)}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="admin-user-primary-button"
                  onClick={() => {
                    const user = viewingUser;
                    setViewingUser(null);
                    openEditModal(user);
                  }}
                >
                  <Pencil size={15} />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {isModalOpen && (
        <div
          className="admin-user-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="admin-user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-modal-title"
          >
            <div className="admin-user-modal-heading">
              <div>
                <span>{editingUser ? "CẬP NHẬT" : "TẠO MỚI"}</span>
                <h2 id="admin-user-modal-title">
                  {editingUser ? "Chỉnh sửa khách hàng" : "Thêm khách hàng demo"}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-user-modal-body">
                <label className="admin-user-field">
                  <span>
                    Họ và tên <b>*</b>
                  </span>
                  <input
                    autoFocus
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Nhập họ và tên"
                    maxLength={100}
                  />
                </label>

                <label className="admin-user-field">
                  <span>
                    Email <b>*</b>
                  </span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        email: event.target.value,
                      }))
                    }
                    placeholder="example@email.com"
                    maxLength={150}
                  />
                </label>

                <label className="admin-user-field">
                  <span>
                    Số điện thoại <b>*</b>
                  </span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="Nhập số điện thoại"
                    maxLength={20}
                  />
                </label>

                <label className="admin-user-field">
                  <span>Địa chỉ</span>
                  <input
                    value={formData.address}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        address: event.target.value,
                      }))
                    }
                    placeholder="Tỉnh/thành phố"
                    maxLength={200}
                  />
                </label>

                <label className="admin-user-field">
                  <span>Trạng thái tài khoản</span>
                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        status: event.target.value,
                      }))
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                {formError && (
                  <p className="admin-user-form-error">
                    <AlertCircle size={16} />
                    {formError}
                  </p>
                )}
              </div>

              <div className="admin-user-modal-footer">
                <button
                  type="button"
                  className="admin-user-cancel-button"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="admin-user-primary-button"
                >
                  {editingUser ? "Lưu thay đổi" : "Thêm khách hàng"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
