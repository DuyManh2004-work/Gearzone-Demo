
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Settings,
  Menu,
  Search,
  CircleUserRound,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  X,
  ImagePlus,
} from "lucide-react";
import "./AdminProducts.css";

const API_URL = "http://localhost:5000/api/products";

const categories = ["Chuột gaming", "Bàn phím", "Tai nghe"];

const emptyForm = {
  name: "",
  sku: "",
  category: "Chuột gaming",
  price: "",
  stock: "",
  status: "Đang bán",
  image: "",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(price) || 0);

const getSku = (id) => `GZ-${String(id).slice(-8).toUpperCase()}`;

const mapProduct = (product) => ({
  id: product._id,
  name: product.name || "",
  sku: getSku(product._id),
  category: product.category || "Chuột gaming",
  price: Number(product.price) || 0,
  stock: Number(product.stock) || 0,
  status: Number(product.stock) > 0 ? "Đang bán" : "Hết hàng",
  image: product.image || "",
});

const navigation = [
  { label: "Tổng quan", path: "/admin", icon: LayoutDashboard },
  { label: "Sản phẩm", path: "/admin/products", icon: Package },
  { label: "Đơn hàng", path: "/admin/orders", icon: ShoppingCart },
  { label: "Khách hàng", path: "/admin/users", icon: Users },
  { label: "Cài đặt", path: "/admin/settings", icon: Settings },
];

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await axios.get(API_URL, {
        params: { limit: 50 },
      });

      const data = response.data?.data;

      if (!Array.isArray(data)) {
        throw new Error("Dữ liệu sản phẩm trả về không hợp lệ.");
      }

      setProducts(data.map(mapProduct));
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);

      setPageError(
        error.response?.data?.message ||
          "Không thể tải sản phẩm. Hãy kiểm tra backend và kết nối MongoDB."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesKeyword =
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword);

      const matchesCategory =
        categoryFilter === "Tất cả" ||
        product.category === categoryFilter;

      const matchesStatus =
        statusFilter === "Tất cả" ||
        product.status === statusFilter;

      return matchesKeyword && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const totalInventoryValue = products.reduce(
    (total, product) => total + product.price * product.stock,
    0
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
      image: product.image,
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      form.price === "" ||
      form.stock === ""
    ) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price < 0) {
      setFormError("Giá sản phẩm phải là số không âm.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setFormError("Số lượng tồn kho phải là số nguyên không âm.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      category: form.category,
      price,
      stock: form.status === "Hết hàng" ? 0 : stock,
      image: form.image.trim(),
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await axios.put(`${API_URL}/${editingId}`, productData);
      } else {
        await axios.post(API_URL, productData);
      }

      closeModal();
      await loadProducts();
    } catch (error) {
      console.error("Lỗi lưu sản phẩm:", error);

      setFormError(
        error.response?.data?.message ||
          "Không thể lưu sản phẩm. Vui lòng kiểm tra backend."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`
    );

    if (!confirmed) return;

    setPageError("");

    try {
      await axios.delete(`${API_URL}/${product.id}`);
      await loadProducts();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);

      setPageError(
        error.response?.data?.message || "Không thể xóa sản phẩm."
      );
    }
  };

  return (
    <div className="admin-dashboard admin-products-page">
      {sidebarOpen && (
        <button
          className="admin-sidebar-overlay"
          aria-label="Đóng menu quản trị"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "admin-sidebar-open" : ""
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
                Quản trị / Sản phẩm
              </span>
              <h1>Quản lý sản phẩm</h1>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-topbar-user">
              <CircleUserRound size={23} />
              <span>Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-content admin-products-content">
          <section className="admin-welcome">
            <div>
              <h2>Danh sách sản phẩm</h2>
              <p>Quản lý kho hàng và thông tin sản phẩm GEARZONE.</p>
            </div>

            <button
              className="admin-product-primary-button"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Thêm sản phẩm
            </button>
          </section>

          {pageError && (
            <div className="admin-product-form-error" role="alert">
              {pageError}
              <button type="button" onClick={loadProducts}>
                Thử lại
              </button>
            </div>
          )}

          <section className="admin-product-statistics">
            <article className="admin-product-stat-card">
              <span>Tổng sản phẩm</span>
              <strong>{products.length}</strong>
              <Package size={22} />
            </article>

            <article className="admin-product-stat-card">
              <span>Tổng tồn kho</span>
              <strong>{totalStock.toLocaleString("vi-VN")}</strong>
              <ShoppingCart size={22} />
            </article>

            <article className="admin-product-stat-card">
              <span>Đang bán</span>
              <strong>
                {products.filter((item) => item.status === "Đang bán").length}
              </strong>
              <Tags size={22} />
            </article>

            <article className="admin-product-stat-card">
              <span>Giá trị tồn kho</span>
              <strong>{formatPrice(totalInventoryValue)}</strong>
              <CircleUserRound size={22} />
            </article>
          </section>

          <section className="admin-panel admin-products-panel">
            <div className="admin-products-toolbar">
              <label className="admin-products-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Tìm tên sản phẩm hoặc mã sản phẩm..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>

              <select
                aria-label="Lọc theo danh mục"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="Tất cả">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                aria-label="Lọc theo trạng thái"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Đang bán">Đang bán</option>
                <option value="Hết hàng">Hết hàng</option>
              </select>
            </div>

            <div className="admin-products-result">
              {loading
                ? "Đang tải sản phẩm..."
                : `Hiển thị ${filteredProducts.length} / ${products.length} sản phẩm`}
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table admin-products-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SKU</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="admin-empty-state">
                        Đang tải dữ liệu từ MongoDB...
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="admin-product-name-cell">
                            <div className="admin-product-thumbnail">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                />
                              ) : (
                                <Package size={22} />
                              )}
                            </div>
                            <strong>{product.name}</strong>
                          </div>
                        </td>

                        <td>{product.sku}</td>
                        <td>{product.category}</td>
                        <td className="admin-product-price">
                          {formatPrice(product.price)}
                        </td>

                        <td>
                          <span
                            className={
                              product.stock === 0
                                ? "admin-product-stock empty"
                                : product.stock <= 10
                                ? "admin-product-stock low"
                                : "admin-product-stock"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-product-status ${
                              product.status === "Đang bán"
                                ? "available"
                                : "out-of-stock"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>

                        <td>
                          <div className="admin-product-actions">
                            <button
                              type="button"
                              aria-label={`Sửa ${product.name}`}
                              title="Sửa sản phẩm"
                              onClick={() => openEditModal(product)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              className="delete"
                              aria-label={`Xóa ${product.name}`}
                              title="Xóa sản phẩm"
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="admin-empty-state">
                        Không tìm thấy sản phẩm phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {modalOpen && (
        <div
          className="admin-product-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeModal();
            }
          }}
        >
          <section
            className="admin-product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-product-modal-title"
          >
            <div className="admin-product-modal-heading">
              <div>
                <h2 id="admin-product-modal-title">
                  {editingId !== null ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <p>Nhập thông tin sản phẩm bên dưới.</p>
              </div>

              <button
                type="button"
                aria-label="Đóng biểu mẫu"
                disabled={saving}
                onClick={closeModal}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Tên sản phẩm <span>*</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Gaming Mouse X1"
                  required
                />
              </label>

              <label>
                Mã sản phẩm
                <input
                  name="sku"
                  value={
                    editingId !== null
                      ? form.sku
                      : "Mã sẽ được tạo tự động sau khi lưu"
                  }
                  readOnly
                  aria-readonly="true"
                />
              </label>

              <div className="admin-product-form-row">

                <label>
                  Trạng thái
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Đang bán">Đang bán</option>
                    <option value="Hết hàng">Hết hàng</option>
                  </select>
                </label>
              </div>

              <div className="admin-product-form-row">
                <label>
                  Giá bán (VNĐ) <span>*</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1000"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="1290000"
                    required
                  />
                </label>

                <label>
                  Số lượng tồn kho <span>*</span>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="35"
                    required
                  />
                </label>
              </div>

              <label>
                Đường dẫn hình ảnh
                <div className="admin-product-image-input">
                  <ImagePlus size={18} />
                  <input
                    name="image"
                    type="url"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </label>

              {formError && (
                <p className="admin-product-form-error" role="alert">
                  {formError}
                </p>
              )}

              <div className="admin-product-modal-actions">
                <button
                  type="button"
                  className="admin-product-cancel-button"
                  disabled={saving}
                  onClick={closeModal}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="admin-product-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Đang lưu..."
                    : editingId !== null
                    ? "Lưu thay đổi"
                    : "Thêm sản phẩm"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
