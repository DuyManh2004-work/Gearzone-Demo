
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    getOrders as fetchOrders,
    updateOrderStatus as patchOrderStatus,
} from "../../services/adminOrderService";
import { Link, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Menu,
    Search,
    CircleUserRound,
    ExternalLink,
    Eye,
    Pencil,
    X,
    ClipboardList,
    Clock3,
    Truck,
    CheckCircle2,
    XCircle,
    ChevronDown,
} from "lucide-react";
import "./AdminOrders.css";


const API_STATUS_TO_LABEL = {
    pending: "Chờ xác nhận",
    confirmed: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã hoàn thành",
    cancelled: "Đã hủy",
};

const LABEL_TO_API_STATUS = {
    "Chờ xác nhận": "pending",
    "Đang xử lý": "confirmed",
    "Đang giao": "shipping",
    "Đã hoàn thành": "delivered",
    "Đã hủy": "cancelled",
};

const mapApiOrder = (order) => ({
    // Dùng MongoDB _id để cập nhật đúng đơn hàng
    id: order._id,
    customer: order.customer?.fullName || "Khách hàng",
    email: order.customer?.email || "",
    phone: order.customer?.phone || "",
    date: order.createdAt
        ? new Date(order.createdAt).toISOString().slice(0, 10)
        : "",
    address: order.customer?.address || "",
    payment:
        order.paymentMethod === "bank_transfer"
            ? "Chuyển khoản ngân hàng"
            : "Thanh toán khi nhận hàng",
    status: API_STATUS_TO_LABEL[order.status] || "Chờ xác nhận",
    items: Array.isArray(order.items)
        ? order.items.map((item) => ({
            name: item.name || "Sản phẩm",
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
        }))
        : [],
});


const navigation = [
    { label: "Tổng quan", path: "/admin", icon: LayoutDashboard },
    { label: "Sản phẩm", path: "/admin/products", icon: Package },
    { label: "Đơn hàng", path: "/admin/orders", icon: ShoppingCart },
    { label: "Khách hàng", path: "/admin/users", icon: Users },
    { label: "Cài đặt", path: "/admin/settings", icon: Settings },
];

const statuses = [
    "Chờ xác nhận",
    "Đang xử lý",
    "Đang giao",
    "Đã hoàn thành",
    "Đã hủy",
];

const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);

const formatDate = (date) =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(`${date}T12:00:00`));

const getOrderTotal = (order) =>
    order.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

const getStatusClass = (status) => {
    const classes = {
        "Chờ xác nhận": "pending",
        "Đang xử lý": "processing",
        "Đang giao": "shipping",
        "Đã hoàn thành": "completed",
        "Đã hủy": "cancelled",
    };

    return classes[status] || "pending";
};

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingStatus, setSavingStatus] = useState(false);
    const [apiError, setApiError] = useState("");
    const [apiMessage, setApiMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Tất cả");
    const [dateFilter, setDateFilter] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [nextStatus, setNextStatus] = useState("");


    const loadOrders = useCallback(async () => {
        setLoading(true);
        setApiError("");

        try {
            const result = await fetchOrders();
            const apiOrders = Array.isArray(result.data)
                ? result.data
                : [];

            setOrders(apiOrders.map(mapApiOrder));
        } catch (error) {
            setApiError(
                error.response?.data?.message ||
                "Không thể tải đơn hàng. Hãy kiểm tra backend và kết nối API."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);


    const filteredOrders = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesSearch =
                `${order.id} ${order.customer} ${order.email} ${order.phone} ${order.items
                    .map((item) => item.name)
                    .join(" ")}`
                    .toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                statusFilter === "Tất cả" || order.status === statusFilter;

            const matchesDate = !dateFilter || order.date === dateFilter;

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [orders, searchTerm, statusFilter, dateFilter]);

    const countByStatus = (status) =>
        orders.filter((order) => order.status === status).length;


    const updateOrderStatus = async (orderId, status) => {
        const apiStatus = LABEL_TO_API_STATUS[status];

        if (!apiStatus) return;

        setSavingStatus(true);
        setApiError("");
        setApiMessage("");

        try {
            const result = await patchOrderStatus(orderId, apiStatus);

            if (!result.data) {
                throw new Error("Backend không trả về đơn hàng đã cập nhật.");
            }

            const updatedOrder = mapApiOrder(result.data);

            setOrders((current) =>
                current.map((order) =>
                    order.id === orderId ? updatedOrder : order
                )
            );

            setSelectedOrder((current) =>
                current?.id === orderId ? updatedOrder : current
            );

            setEditingOrderId(null);
            setNextStatus("");

            setApiMessage("Cập nhật trạng thái đơn hàng thành công.");
        } catch (error) {
            setApiError(
                error.response?.data?.message ||
                error.message ||
                "Không thể cập nhật trạng thái đơn hàng."
            );
        } finally {
            setSavingStatus(false);
        }
    };


    const beginStatusEdit = (order) => {
        setEditingOrderId(order.id);
        setNextStatus(order.status);
    };

    const saveStatus = (order) => {
        if (!nextStatus) return;

        if (
            nextStatus === "Đã hủy" &&
            order.status !== "Đã hủy" &&
            !window.confirm(`Bạn có chắc muốn hủy đơn hàng ${order.id}?`)
        ) {
            return;
        }

        updateOrderStatus(order.id, nextStatus);
    };

    const closeDetail = () => {
        setSelectedOrder(null);
        setEditingOrderId(null);
        setNextStatus("");
    };

    return (
        <div className="admin-dashboard admin-orders-page">
            {sidebarOpen && (
                <button
                    className="admin-sidebar-overlay"
                    aria-label="Đóng menu quản trị"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""
                    }`}
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
                            <span className="admin-breadcrumb">
                                Quản trị / Đơn hàng
                            </span>
                            <h1>Quản lý đơn hàng</h1>
                        </div>
                    </div>

                    <div className="admin-topbar-actions">
                        <div className="admin-topbar-user">
                            <CircleUserRound size={23} />
                            <span>Admin</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content admin-orders-content">
                    {apiError && (
                        <div role="alert" className="admin-api-message admin-api-error">
                            {apiError}
                        </div>
                    )}

                    {apiMessage && (
                        <div role="status" className="admin-api-message admin-api-success">
                            {apiMessage}
                        </div>
                    )}
                    <section className="admin-welcome">
                        <div>
                            <h2>Danh sách đơn hàng</h2>
                            <p>Theo dõi và quản lý đơn đặt hàng của khách hàng.</p>
                        </div>
                        <span className="admin-orders-demo-label">
                            Dữ liệu minh họa
                        </span>
                    </section>

                    <section className="admin-order-statistics">
                        <article className="admin-order-stat-card">
                            <div className="admin-order-stat-icon all">
                                <ClipboardList size={21} />
                            </div>
                            <span>Tổng đơn hàng</span>
                            <strong>{orders.length}</strong>
                            <small>Tất cả đơn hàng mẫu</small>
                        </article>

                        <article className="admin-order-stat-card">
                            <div className="admin-order-stat-icon pending">
                                <Clock3 size={21} />
                            </div>
                            <span>Chờ xác nhận</span>
                            <strong>{countByStatus("Chờ xác nhận")}</strong>
                            <small>Cần kiểm tra đơn mới</small>
                        </article>

                        <article className="admin-order-stat-card">
                            <div className="admin-order-stat-icon shipping">
                                <Truck size={21} />
                            </div>
                            <span>Đang giao</span>
                            <strong>{countByStatus("Đang giao")}</strong>
                            <small>Đơn hàng đang vận chuyển</small>
                        </article>

                        <article className="admin-order-stat-card">
                            <div className="admin-order-stat-icon completed">
                                <CheckCircle2 size={21} />
                            </div>
                            <span>Đã hoàn thành</span>
                            <strong>{countByStatus("Đã hoàn thành")}</strong>
                            <small>Đơn đã giao thành công</small>
                        </article>
                    </section>

                    <section className="admin-panel admin-orders-list-panel">
                        <div className="admin-orders-toolbar">
                            <label className="admin-orders-search">
                                <Search size={18} />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="Tìm mã đơn, khách hàng, sản phẩm..."
                                />
                            </label>

                            <select
                                aria-label="Lọc trạng thái đơn hàng"
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                            >
                                <option value="Tất cả">Tất cả trạng thái</option>
                                {statuses.map((status) => (
                                    <option value={status} key={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="admin-orders-date-filter"
                                type="date"
                                aria-label="Lọc theo ngày đặt"
                                value={dateFilter}
                                onChange={(event) => setDateFilter(event.target.value)}
                            />

                            <button
                                type="button"
                                className="admin-orders-reset-button"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("Tất cả");
                                    setDateFilter("");
                                }}
                            >
                                Xóa lọc
                            </button>
                        </div>

                        <div className="admin-orders-result">
                            Hiển thị <strong>{filteredOrders.length}</strong> trong tổng số{" "}
                            <strong>{orders.length}</strong> đơn hàng
                        </div>

                        {loading && (
                            <p className="admin-api-message">
                                Đang tải danh sách đơn hàng...
                            </p>
                        )}

                        <div className="admin-table-wrapper">
                            <table className="admin-table admin-orders-table">
                                <thead>
                                    <tr>
                                        <th>Mã đơn hàng</th>
                                        <th>Khách hàng</th>
                                        <th>Ngày đặt</th>
                                        <th>Tổng tiền</th>
                                        <th>Thanh toán</th>
                                        <th>Trạng thái</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>
                                                    <strong className="admin-order-code">
                                                        #{order.id}
                                                    </strong>
                                                    <small className="admin-order-item-count">
                                                        {order.items.reduce(
                                                            (sum, item) => sum + item.quantity,
                                                            0
                                                        )}{" "}
                                                        sản phẩm
                                                    </small>
                                                </td>

                                                <td>
                                                    <div className="admin-order-customer">
                                                        <strong>{order.customer}</strong>
                                                        <small>{order.phone}</small>
                                                    </div>
                                                </td>

                                                <td>{formatDate(order.date)}</td>

                                                <td>
                                                    <strong className="admin-order-total">
                                                        {formatPrice(getOrderTotal(order))}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="admin-order-payment">
                                                        {order.payment}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`admin-order-status ${getStatusClass(
                                                            order.status
                                                        )}`}
                                                    >
                                                        <span />
                                                        {order.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="admin-order-row-actions">
                                                        <button
                                                            type="button"
                                                            title="Xem chi tiết"
                                                            aria-label={`Xem đơn ${order.id}`}
                                                            onClick={() => setSelectedOrder(order)}
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            title="Cập nhật trạng thái"
                                                            aria-label={`Cập nhật đơn ${order.id}`}
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                beginStatusEdit(order);
                                                            }}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="admin-empty-state">
                                                Không tìm thấy đơn hàng phù hợp với bộ lọc.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-orders-table-footer">
                            <span>
                                Tổng cộng {filteredOrders.length} đơn hàng trong danh sách
                            </span>
                        </div>
                    </section>
                </div>
            </main>

            {selectedOrder && (
                <div
                    className="admin-order-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeDetail();
                    }}
                >
                    <section
                        className="admin-order-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-order-modal-title"
                    >
                        <div className="admin-order-modal-heading">
                            <div>
                                <span>CHI TIẾT ĐƠN HÀNG</span>
                                <h2 id="admin-order-modal-title">#{selectedOrder.id}</h2>
                            </div>

                            <button
                                type="button"
                                aria-label="Đóng chi tiết"
                                onClick={closeDetail}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <div className="admin-order-modal-body">
                            <div className="admin-order-detail-status">
                                <span
                                    className={`admin-order-status ${getStatusClass(
                                        selectedOrder.status
                                    )}`}
                                >
                                    <span />
                                    {selectedOrder.status}
                                </span>
                                <small>Ngày đặt: {formatDate(selectedOrder.date)}</small>
                            </div>

                            <section className="admin-order-detail-section">
                                <h3>Thông tin khách hàng</h3>
                                <div className="admin-order-detail-grid">
                                    <div>
                                        <span>Họ tên</span>
                                        <strong>{selectedOrder.customer}</strong>
                                    </div>
                                    <div>
                                        <span>Số điện thoại</span>
                                        <strong>{selectedOrder.phone}</strong>
                                    </div>
                                    <div>
                                        <span>Email</span>
                                        <strong>{selectedOrder.email}</strong>
                                    </div>
                                    <div>
                                        <span>Địa chỉ giao hàng</span>
                                        <strong>{selectedOrder.address}</strong>
                                    </div>
                                    <div>
                                        <span>Phương thức thanh toán</span>
                                        <strong>{selectedOrder.payment}</strong>
                                    </div>
                                </div>
                            </section>

                            <section className="admin-order-detail-section">
                                <h3>Sản phẩm trong đơn</h3>

                                <div className="admin-order-detail-items">
                                    {selectedOrder.items.map((item, index) => (
                                        <div
                                            className="admin-order-detail-item"
                                            key={`${item.name}-${index}`}
                                        >
                                            <div className="admin-order-detail-product-icon">
                                                <Package size={20} />
                                            </div>

                                            <div className="admin-order-detail-product-info">
                                                <strong>{item.name}</strong>
                                                <span>
                                                    {formatPrice(item.price)} × {item.quantity}
                                                </span>
                                            </div>

                                            <strong>
                                                {formatPrice(item.price * item.quantity)}
                                            </strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="admin-order-detail-total">
                                    <span>Tổng thanh toán</span>
                                    <strong>{formatPrice(getOrderTotal(selectedOrder))}</strong>
                                </div>
                            </section>

                            {selectedOrder.status !== "Đã hủy" &&
                                selectedOrder.status !== "Đã hoàn thành" && (
                                    <section className="admin-order-detail-section">
                                        <h3>Cập nhật trạng thái</h3>

                                        <div className="admin-order-status-editor">
                                            <label htmlFor="admin-order-status-select">
                                                Trạng thái đơn hàng
                                            </label>

                                            <div className="admin-order-status-select-wrap">
                                                <select
                                                    id="admin-order-status-select"
                                                    value={
                                                        editingOrderId === selectedOrder.id
                                                            ? nextStatus
                                                            : selectedOrder.status
                                                    }
                                                    onChange={(event) => {
                                                        setEditingOrderId(selectedOrder.id);
                                                        setNextStatus(event.target.value);
                                                    }}
                                                >
                                                    {statuses
                                                        .filter((status) => status !== "Đã hủy")
                                                        .map((status) => (
                                                            <option value={status} key={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    <option value="Đã hủy">Đã hủy</option>
                                                </select>
                                                <ChevronDown size={16} />
                                            </div>

                                            <button
                                                type="button"
                                                className="admin-order-save-status"
                                                onClick={() => saveStatus(selectedOrder)}
                                                disabled={
                                                    savingStatus ||
                                                    !nextStatus ||
                                                    nextStatus === selectedOrder.status
                                                }
                                            >
                                                {savingStatus ? "Đang lưu..." : "Lưu trạng thái"}
                                            </button>
                                        </div>
                                    </section>
                                )}

                            {(selectedOrder.status === "Đã hủy" ||
                                selectedOrder.status === "Đã hoàn thành") && (
                                    <p className="admin-order-final-note">
                                        {selectedOrder.status === "Đã hủy" ? (
                                            <XCircle size={18} />
                                        ) : (
                                            <CheckCircle2 size={18} />
                                        )}
                                        Đơn hàng đã {selectedOrder.status.toLowerCase()}. Không thể
                                        cập nhật trạng thái từ màn hình này.
                                    </p>
                                )}
                        </div>

                        <div className="admin-order-modal-footer">
                            <button
                                type="button"
                                className="admin-order-close-button"
                                onClick={closeDetail}
                            >
                                Đóng
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
