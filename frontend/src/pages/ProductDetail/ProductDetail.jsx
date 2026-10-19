
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

import { getProductById } from "../../services/productService";
import "./ProductDetail.css";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price || 0);
}

function ProductDetail({ onAddToCart }) {
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const response = await getProductById(id);

        if (!response?.success || !response?.data) {
          throw new Error("Không tìm thấy sản phẩm.");
        }

        if (!cancelled) {
          setProduct(response.data);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết sản phẩm:", err);

        if (!cancelled) {
          setError(
            "Không thể tải sản phẩm. Sản phẩm có thể đã bị xóa hoặc API không khả dụng."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="product-detail-not-found">
        <p role="status">Đang tải thông tin sản phẩm...</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-detail-not-found">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>
          {error ||
            "Sản phẩm có thể đã bị xóa hoặc đường dẫn không hợp lệ."}
        </p>

        <Link to="/products" className="detail-back-button">
          <ArrowLeft size={18} />
          Quay lại danh sách sản phẩm
        </Link>
      </section>
    );
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
  };

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        <Link to="/products" className="detail-back-link">
          <ArrowLeft size={18} />
          Quay lại cửa hàng
        </Link>

        <div className="product-detail-layout">
          <div className="product-detail-image">
            {product.badge && (
              <span className="detail-product-badge">
                {product.badge}
              </span>
            )}

            <img
              src={product.image}
              alt={product.name}
            />
          </div>

          <div className="product-detail-info">
            <span className="detail-product-category">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <div className="detail-product-rating">
              <Star size={18} fill="currentColor" />
              <span>{product.rating ?? 0}</span>
              <span>
                ({product.reviews ?? 0} đánh giá)
              </span>
            </div>

            <div className="detail-product-prices">
              <span className="detail-product-price">
                {formatPrice(product.price)}
              </span>

              {product.oldPrice > product.price && (
                <span className="detail-product-old-price">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <p className="detail-product-description">
              {product.description ||
                `Khám phá ${product.name} tại GEARZONE. Thiết bị gaming phù hợp để nâng cấp trải nghiệm sử dụng của bạn.`}
            </p>

            <div className="detail-quantity">
              <span>Số lượng</span>

              <div className="detail-quantity-control">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  aria-label="Giảm số lượng"
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => current + 1)
                  }
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="detail-add-cart-button"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={20} />
              Thêm {quantity} sản phẩm vào giỏ hàng
            </button>

            <div className="detail-benefits">
              <div>
                <ShieldCheck size={21} />
                <span>Sản phẩm chất lượng</span>
              </div>

              <div>
                <Truck size={21} />
                <span>Hỗ trợ giao hàng</span>
              </div>

              <div>
                <RotateCcw size={21} />
                <span>Hỗ trợ đổi trả</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
