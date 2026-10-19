
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  CreditCard,
} from "lucide-react";
import { createOrder } from "../../services/orderService";
import "./Checkout.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price || 0);

function Checkout({ cart = [], onPlaceOrder }) {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalQuantity = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const totalPrice = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError("");

    if (cart.length === 0) {
      setError("Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const customer = {
      fullName: String(formData.get("fullName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      address: String(formData.get("address") || "").trim(),
    };

    if (
      !customer.fullName ||
      !customer.phone ||
      !customer.email ||
      !customer.address
    ) {
      setError("Vui lòng điền đầy đủ thông tin nhận hàng.");
      return;
    }

    if (!/^0\d{9}$/.test(customer.phone)) {
      setError("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await createOrder({
        customer,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item._id ?? item.id,
          quantity: Number(item.quantity),
        })),
      });

      if (!result?.success || !result?.data?._id) {
        throw new Error(result?.message || "Không thể tạo đơn hàng.");
      }

      // Chỉ xóa giỏ hàng sau khi backend xác nhận tạo đơn thành công.
      if (typeof onPlaceOrder === "function") {
        onPlaceOrder();
      }

      setOrderNumber(
        result.data.orderNumber || result.data._id
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Không thể kết nối máy chủ. Vui lòng thử lại.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderNumber) {
    return (
      <main className="checkout-page">
        <section className="checkout-success">
          <div className="checkout-success-icon">
            <CheckCircle2 size={54} />
          </div>

          <p className="checkout-eyebrow">GEARZONE ORDER</p>
          <h1>Đặt hàng thành công!</h1>
          <p className="checkout-success-description">
            Đơn hàng đã được lưu vào hệ thống. Vui lòng lưu lại mã đơn hàng.
          </p>

          <div className="checkout-order-number">
            <span>Mã đơn hàng</span>
            <strong>{orderNumber}</strong>
          </div>

          <div className="checkout-success-note">
            <Package size={20} />
            <p>
              Đơn hàng của bạn đã được tạo với trạng thái chờ xác nhận.
            </p>
          </div>

          <Link to="/products" className="checkout-primary-button">
            Tiếp tục mua sắm
          </Link>

          <Link to="/" className="checkout-back-home">
            Về trang chủ
          </Link>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <ShoppingBag size={52} />
          <h1>Chưa có sản phẩm để thanh toán</h1>
          <p>Hãy thêm sản phẩm vào giỏ hàng trước khi đặt hàng.</p>
          <Link to="/products" className="checkout-primary-button">
            Khám phá sản phẩm
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-heading">
          <p className="checkout-eyebrow">GEARZONE CHECKOUT</p>
          <h1>Thanh toán</h1>
          <p>Hoàn tất thông tin để tạo đơn hàng.</p>
        </div>

        <form className="checkout-layout" onSubmit={handleSubmit}>
          <div className="checkout-main">
            <section className="checkout-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <MapPin size={21} />
                </div>
                <div>
                  <h2>Thông tin nhận hàng</h2>
                  <p>Nhập chính xác thông tin người nhận.</p>
                </div>
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-field checkout-field-full">
                  <label htmlFor="fullName">Họ và tên *</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn An"
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="checkout-field">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0912345678"
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="0[0-9]{9}"
                    maxLength={10}
                    required
                  />
                  <small>Gồm 10 chữ số, bắt đầu bằng số 0.</small>
                </div>

                <div className="checkout-field">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ban@example.com"
                    autoComplete="email"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="checkout-field checkout-field-full">
                  <label htmlFor="address">Địa chỉ nhận hàng *</label>
                  <textarea
                    id="address"
                    name="address"
                    placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố"
                    autoComplete="street-address"
                    rows={3}
                    maxLength={300}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <CreditCard size={21} />
                </div>
                <div>
                  <h2>Phương thức thanh toán</h2>
                  <p>Chọn phương thức thanh toán.</p>
                </div>
              </div>

              <label
                className={`checkout-payment-option ${
                  paymentMethod === "cod" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <Truck size={22} />
                <span>
                  <strong>Thanh toán khi nhận hàng (COD)</strong>
                  <small>Thanh toán khi nhận sản phẩm.</small>
                </span>
              </label>

              <label
                className={`checkout-payment-option ${
                  paymentMethod === "bank_transfer" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                />
                <CreditCard size={22} />
                <span>
                  <strong>Chuyển khoản ngân hàng</strong>
                  <small>Demo, chưa tích hợp thanh toán thực tế.</small>
                </span>
              </label>
            </section>

            {error && (
              <div className="checkout-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="checkout-primary-button checkout-submit"
              disabled={submitting}
            >
              {submitting ? "Đang tạo đơn hàng..." : "Xác nhận đặt hàng"}
            </button>

            <p className="checkout-demo-disclaimer">
              Chuyển khoản hiện chỉ là lựa chọn mô phỏng, chưa phát sinh giao dịch.
            </p>
          </div>

          <aside className="checkout-summary">
            <div className="checkout-summary-heading">
              <h2>Đơn hàng của bạn</h2>
              <span>{totalQuantity} sản phẩm</span>
            </div>

            <div className="checkout-summary-items">
              {cart.map((item) => (
                <div
                  className="checkout-summary-item"
                  key={item._id ?? item.id}
                >
                  <div className="checkout-item-image">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                    />
                    <span>{item.quantity}</span>
                  </div>

                  <div className="checkout-item-info">
                    <strong>{item.name}</strong>
                    <small>Số lượng: {item.quantity}</small>
                  </div>

                  <strong className="checkout-item-price">
                    {formatPrice(
                      Number(item.price || 0) *
                        Number(item.quantity || 0)
                    )}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-summary-line">
              <span>Tạm tính</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <div className="checkout-summary-line">
              <span>Phí vận chuyển</span>
              <strong className="checkout-free-shipping">Miễn phí</strong>
            </div>

            <div className="checkout-summary-total">
              <span>Tổng thanh toán</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <p className="checkout-summary-note">
              Tổng tiền cuối cùng được backend tính lại từ dữ liệu sản phẩm.
            </p>

            <Link to="/cart" className="checkout-edit-cart">
              Quay lại giỏ hàng
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
