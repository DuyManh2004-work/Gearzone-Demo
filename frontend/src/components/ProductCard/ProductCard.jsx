
import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import "./ProductCard.css";

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

function ProductCard({ product, onAddToCart }) {
 const detailUrl = `/products/${product.id ?? product._id}`;

  return (
    <article className="product-card">
      {/* Ảnh sản phẩm */}
      <div className="product-image-wrap">
        {product.badge && (
          <span className="product-badge">
            {product.badge}
          </span>
        )}

        <Link
          to={detailUrl}
          className="product-image-link"
          aria-label={`Xem chi tiết ${product.name}`}
        >
          <img
            className="product-image"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        </Link>

        {/* Nút thêm vào giỏ hàng */}
        <button
          className="product-quick-add"
          type="button"
          onClick={() => onAddToCart(product)}
          aria-label={`Thêm ${product.name} vào giỏ hàng`}
          title="Thêm vào giỏ hàng"
        >
          <ShoppingCart size={18} />
        </button>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="product-info">
        <Link
          to={detailUrl}
          className="product-info-link"
          aria-label={`Xem chi tiết ${product.name}`}
        >
          <span className="product-category">
            {product.category}
          </span>

          <h3 className="product-name">
            {product.name}
          </h3>

          <div className="product-rating">
            <Star size={15} fill="currentColor" />
            <span>{product.rating ?? 0}</span>

            <span className="product-reviews">
              ({product.reviews ?? 0} đánh giá)
            </span>
          </div>

          <div className="product-pricing">
            <span className="product-price">
              {formatPrice(product.price)}
            </span>

            {product.oldPrice > product.price && (
              <span className="product-old-price">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
        </Link>

        {/* Nút này không chuyển sang trang chi tiết */}
        <button
          className="product-add-button"
          type="button"
          onClick={() => onAddToCart(product)}
        >
          <ShoppingCart size={17} />
          Thêm vào giỏ hàng
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
