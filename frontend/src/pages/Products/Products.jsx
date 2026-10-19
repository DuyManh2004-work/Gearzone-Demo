
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Mouse,
  Keyboard,
  Headphones,
  Sparkles,
} from "lucide-react";

import { getProducts } from "../../services/productService";
import ProductCard from "../../components/ProductCard/ProductCard";
import "./Products.css";

const categories = [
  "Tất cả",
  "Chuột gaming",
  "Bàn phím",
  "Tai nghe",
];

const categorySlugs = {
  mouse: "Chuột gaming",
  keyboard: "Bàn phím",
  headset: "Tai nghe",
};

const categoryIds = {
  "Chuột gaming": "mouse",
  "Bàn phím": "keyboard",
  "Tai nghe": "headset",
};

const banners = {
  "Tất cả": {
    title: "Khám phá thiết bị gaming",
    description:
      "Tìm thiết bị phù hợp để hoàn thiện góc gaming của bạn.",
    className: "banner-all",
    icon: Sparkles,
  },
  "Chuột gaming": {
    title: "Chính xác trong từng thao tác",
    description:
      "Khám phá những mẫu chuột gaming dành cho bạn.",
    className: "banner-mouse",
    icon: Mouse,
  },
  "Bàn phím": {
    title: "Tạo nên trải nghiệm gõ phím khác biệt",
    description:
      "Tìm bàn phím phù hợp với phong cách của bạn.",
    className: "banner-keyboard",
    icon: Keyboard,
  },
  "Tai nghe": {
    title: "Đắm chìm trong thế giới âm thanh",
    description:
      "Khám phá tai nghe dành cho chơi game và giải trí.",
    className: "banner-headset",
    icon: Headphones,
  },
};

function Products({ onAddToCart, featuredOnly = false }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchText, setSearchText] = useState(
    searchParams.get("search") || ""
  );
  const [sortOrder, setSortOrder] = useState("featured");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Lấy danh sách sản phẩm từ Node.js API.
  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getProducts({ limit: 50 });

        // Hỗ trợ cấu trúc API { success: true, data: [...] }.
        const productList = response?.data;

        if (
          response?.success === false ||
          !Array.isArray(productList)
        ) {
          throw new Error(
            "API không trả về danh sách sản phẩm hợp lệ."
          );
        }

        if (!cancelled) {
          setProducts(productList);
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);

        if (!cancelled) {
          setError(
            "Không thể tải sản phẩm. Hãy kiểm tra backend và API."
          );
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  // Đồng bộ từ khóa tìm kiếm với URL.
  useEffect(() => {
    setSearchText(searchParams.get("search") || "");
  }, [searchParams]);

  const categoryParam = searchParams.get("category") || "";

  const selectedCategory = featuredOnly
    ? "Tất cả"
    : categorySlugs[categoryParam] || "Tất cả";

  const updateSearchParams = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchChange = (value) => {
    setSearchText(value);
    updateSearchParams("search", value.trim());
  };

  const handleCategoryChange = (category) => {
    const categoryId = categoryIds[category] || "";
    updateSearchParams("category", categoryId);
  };

  // Tìm kiếm, lọc và sắp xếp ngay trên dữ liệu API.
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      if (featuredOnly) {
        return (
          product.featured === true ||
          product.isFeatured === true
        );
      }

      const productName = String(product.name || "");

      const matchesSearch = productName
        .toLowerCase()
        .includes(searchText.trim().toLowerCase());

      const matchesCategory =
        selectedCategory === "Tất cả" ||
        String(product.category || "").toLowerCase() ===
          selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (!featuredOnly && sortOrder === "price-asc") {
      result = [...result].sort(
        (a, b) => Number(a.price || 0) - Number(b.price || 0)
      );
    } else if (!featuredOnly && sortOrder === "price-desc") {
      result = [...result].sort(
        (a, b) => Number(b.price || 0) - Number(a.price || 0)
      );
    } else if (!featuredOnly && sortOrder === "name") {
      result = [...result].sort((a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || ""),
          "vi"
        )
      );
    }

    return result;
  }, [
    products,
    featuredOnly,
    searchText,
    selectedCategory,
    sortOrder,
  ]);

  const clearFilters = () => {
    setSearchText("");
    setSortOrder("featured");
    setSearchParams({}, { replace: true });
  };

  const currentBanner = banners[selectedCategory] || banners["Tất cả"];
  const BannerIcon = currentBanner.icon;

  return (
    <section className="products-section" id="products">
      {loading && (
        <p role="status">Đang tải sản phẩm...</p>
      )}

      {error && (
        <div role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="products-heading">
        <div>
          <span className="section-eyebrow">
            GEARZONE STORE
          </span>

          <h2>
            {featuredOnly
              ? "Sản phẩm nổi bật"
              : selectedCategory === "Tất cả"
                ? "Tất cả sản phẩm"
                : selectedCategory}
          </h2>

          <p>
            {featuredOnly
              ? "Những thiết bị gaming được tuyển chọn dành cho bạn."
              : "Khám phá thiết bị gaming phù hợp với nhu cầu của bạn."}
          </p>
        </div>

        <span className="products-count">
          {filteredProducts.length} sản phẩm
        </span>
      </div>

      {!featuredOnly && (
        <>
          <div className="products-toolbar">
            <div className="products-search">
              <Search size={18} />

              <input
                type="search"
                value={searchText}
                onChange={(event) =>
                  handleSearchChange(event.target.value)
                }
                placeholder="Tìm tên sản phẩm..."
                aria-label="Tìm tên sản phẩm"
              />
            </div>

            <div className="products-sort">
              <label htmlFor="product-sort">
                Sắp xếp:
              </label>

              <select
                id="product-sort"
                value={sortOrder}
                onChange={(event) =>
                  setSortOrder(event.target.value)
                }
              >
                <option value="featured">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name">Tên A–Z</option>
              </select>
            </div>
          </div>

          <div
            className="category-filters"
            aria-label="Lọc danh mục"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "category-filter active"
                    : "category-filter"
                }
                onClick={() => handleCategoryChange(category)}
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>

          <div
            className={`category-banner ${currentBanner.className}`}
            key={selectedCategory}
          >
            <div className="category-banner-content">
              <h3>{currentBanner.title}</h3>
              <p>{currentBanner.description}</p>

              <a
                href="#product-list"
                className="category-banner-button"
              >
                Khám phá sản phẩm
                <span aria-hidden="true"> →</span>
              </a>
            </div>

            <div
              className="category-banner-art"
              aria-hidden="true"
            >
              <div className="category-banner-circle">
                <BannerIcon
                  className="category-banner-icon"
                  strokeWidth={1.2}
                />
              </div>

              <span className="category-banner-decoration">
                GZ
              </span>
            </div>
          </div>
        </>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="products-grid" id="product-list">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id ?? product._id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="products-empty">
          <Search size={34} />

          <h3>
            {featuredOnly
              ? "Chưa có sản phẩm nổi bật"
              : "Không tìm thấy sản phẩm"}
          </h3>

          <p>
            {featuredOnly
              ? "Hiện chưa có sản phẩm nào được đánh dấu nổi bật."
              : "Hãy thử từ khóa khác hoặc chọn danh mục khác."}
          </p>

          {!featuredOnly && (
            <button type="button" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default Products;
