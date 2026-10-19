
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import "./Cart.css";

function formatPrice(price) {
  const validPrice = Number(price);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(validPrice) ? validPrice : 0);
}

function Cart({ cart = [], onUpdateQuantity, onRemove }) {
  // Bảo đảm dữ liệu đầu vào luôn là một mảng.
  const validCart = Array.isArray(cart) ? cart : [];

  const getQuantity = (item) => {
    const quantity = Number(item.quantity);
    return Number.isFinite(quantity) && quantity > 0
      ? Math.floor(quantity)
      : 1;
  };

  const getPrice = (item) => {
    const price = Number(item.price);
    return Number.isFinite(price) && price >= 0 ? price : 0;
  };

  const totalItems = validCart.reduce(
    (total, item) => total + getQuantity(item),
    0
  );

  const subtotal = validCart.reduce(
    (total, item) => total + getPrice(item) * getQuantity(item),
    0
  );

  if (validCart.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">
            <ShoppingBag size={36} strokeWidth={1.4} />
          </div>

          <h1>Giỏ hàng đang trống</h1>
          <p>
            Hãy khám phá các sản phẩm và chọn thiết bị phù hợp với bạn.
          </p>

          <Link to="/products" className="cart-continue-button">
            Khám phá sản phẩm
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <span className="section-eyebrow">YOUR SHOPPING BAG</span>
          <h1>Giỏ hàng của bạn</h1>
          <p>{totalItems} sản phẩm trong giỏ hàng</p>
        </div>

        <Link to="/products" className="cart-back-link">
          Tiếp tục mua sắm
        </Link>
      </div>

      <div className="cart-layout">
        <section className="cart-items">
          {validCart.map((item, index) => {
            const quantity = getQuantity(item);
            const price = getPrice(item);
            const productId = item.id ?? item._id;

            return (
              <article
                className="cart-item"
                key={String(productId ?? `cart-item-${index}`)}
              >
                <Link
                  to={productId ? `/products/${productId}` : "/products"}
                  className="cart-item-image"
                >
                  <img
                    src={item.image || ""}
                    alt={item.name || "Sản phẩm GEARZONE"}
                  />
                </Link>

                <div className="cart-item-info">
                  <span className="cart-item-category">
                    {item.category || "Phụ kiện gaming"}
                  </span>

                  <Link
                    to={productId ? `/products/${productId}` : "/products"}
                    className="cart-item-name"
                  >
                    {item.name || "Sản phẩm chưa có tên"}
                  </Link>

                  <span className="cart-item-price">
                    {formatPrice(price)}
                  </span>

                  <div className="cart-item-actions">
                    <div className="cart-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity?.(productId, quantity - 1)
                        }
                        disabled={quantity <= 1}
                        aria-label={`Giảm số lượng ${item.name || "sản phẩm"}`}
                      >
                        <Minus size={14} />
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity?.(productId, quantity + 1)
                        }
                        aria-label={`Tăng số lượng ${item.name || "sản phẩm"}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      className="cart-remove-button"
                      type="button"
                      onClick={() => onRemove?.(productId)}
                    >
                      <Trash2 size={15} />
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="cart-item-total">
                  {formatPrice(price * quantity)}
                </div>
              </article>
            );
          })}
        </section>

        <aside className="cart-summary">
          <h2>Tóm tắt đơn hàng</h2>

          <div className="cart-summary-row">
            <span>Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="cart-summary-row">
            <span>Vận chuyển</span>
            <span>Chưa tính</span>
          </div>

          <div className="cart-summary-divider" />

          <div className="cart-summary-total">
            <span>Tổng cộng</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <p className="cart-summary-note">
            Phí vận chuyển và các chi phí khác chưa được tính.
          </p>

          <Link to="/checkout" className="checkout-button">
            Tiến hành thanh toán
          </Link>

          <Link to="/products" className="cart-summary-back">
            Tiếp tục chọn sản phẩm
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default Cart;
