
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState, useCallback, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Products from "./pages/Products/Products";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Cart from "./pages/Cart/Cart";
import Toast from "./components/Toast/Toast";
import Checkout from "./pages/Checkout/Checkout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminSettings from "./pages/Admin/AdminSettings";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Mouse,
  Keyboard,
  Headphones,
  ShieldCheck,
  Truck,
  Headset,
} from "lucide-react";

import "./App.css";

// Khóa cũ: dùng để đọc lại giỏ hàng khách trước đây.
const LEGACY_STORAGE_KEY = "gearzone_cart";

// Giỏ hàng dành riêng cho khách chưa đăng nhập.
const GUEST_STORAGE_KEY = "gearzone_cart_guest";

// Tạo khóa riêng cho từng tài khoản bằng ID người dùng.
function getCartStorageKey(user) {
  const userId = user?.id || user?._id;

  if (userId) {
    return `gearzone_cart_user_${userId}`;
  }

  return GUEST_STORAGE_KEY;
}

// Đọc giỏ hàng theo khóa được chỉ định.
function readCart(storageKey) {
  try {
    let savedCart = localStorage.getItem(storageKey);

    // Giữ lại giỏ hàng cũ cho khách chưa đăng nhập.
    // Không chuyển giỏ hàng cũ sang tài khoản người dùng.
    if (!savedCart && storageKey === GUEST_STORAGE_KEY) {
      savedCart = localStorage.getItem(LEGACY_STORAGE_KEY);
    }

    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

const categories = [
  {
    id: "mouse",
    name: "Chuột gaming",
    description: "Chính xác trong từng thao tác",
    icon: Mouse,
  },
  {
    id: "keyboard",
    name: "Bàn phím",
    description: "Trải nghiệm gõ phím khác biệt",
    icon: Keyboard,
  },
  {
    id: "headset",
    name: "Tai nghe",
    description: "Đắm chìm trong âm thanh",
    icon: Headphones,
  },
];

const benefits = [
  {
    title: "Sản phẩm chất lượng",
    description: "Thông tin sản phẩm rõ ràng",
    icon: ShieldCheck,
  },
  {
    title: "Giao hàng tiện lợi",
    description: "Thông tin vận chuyển minh bạch",
    icon: Truck,
  },
  {
    title: "Hỗ trợ khách hàng",
    description: "Sẵn sàng giải đáp thắc mắc",
    icon: Headset,
  },
];

function HomePage({ onAddToCart }) {
  const slides = [
    {
      eyebrow: "GEARZONE COLLECTION",
      title: "Nâng tầm trải nghiệm.",
      highlight: "Khẳng định phong cách.",
      description:
        "Khám phá những thiết bị gaming gear dành cho góc máy của bạn.",
      button: "Khám phá sản phẩm",
      image:
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=2000&q=85",
      alt: "Không gian máy tính gaming hiện đại",
    },
    {
      eyebrow: "PRECISION IN EVERY MOVE",
      title: "Chính xác từng thao tác.",
      highlight: "Làm chủ cuộc chơi.",
      description:
        "Khám phá chuột gaming và phụ kiện giúp bạn hoàn thiện setup.",
      button: "Xem sản phẩm",
      image:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=2000&q=85",
      alt: "Chuột máy tính trên bàn làm việc",
    },
    {
      eyebrow: "YOUR SETUP, YOUR STYLE",
      title: "Không gian của bạn.",
      highlight: "Phong cách của riêng bạn.",
      description:
        "Từ bàn phím đến tai nghe, tìm thiết bị phù hợp với nhu cầu.",
      button: "Khám phá danh mục",
      image:
        "https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=2000&q=85",
      alt: "Bàn phím máy tính và góc setup",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setActiveSlide((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const previousSlide = useCallback(() => {
    setActiveSlide(
      (current) => (current - 1 + slides.length) % slides.length
    );
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <main id="home">
      <section className="hero-section">
        {slides.map((slide, index) => (
          <div
            key={slide.eyebrow}
            className={`hero-slide ${
              index === activeSlide ? "active" : ""
            }`}
            style={{ backgroundImage: `url("${slide.image}")` }}
            aria-hidden={index !== activeSlide}
          />
        ))}

        <div className="hero-overlay" />

        <div className="hero-content" key={activeSlide}>
          <span className="hero-label">
            {slides[activeSlide].eyebrow}
          </span>

          <h1>
            {slides[activeSlide].title}
            <br />
            <span>{slides[activeSlide].highlight}</span>
          </h1>

          <p>{slides[activeSlide].description}</p>

          <a href="#categories" className="primary-button">
            {slides[activeSlide].button}
            <ArrowRight size={18} />
          </a>

          <div className="hero-note">
            Tối giản trong thiết kế. Tập trung vào trải nghiệm.
          </div>
        </div>

        <button
          type="button"
          className="hero-arrow hero-arrow-left"
          onClick={previousSlide}
          aria-label="Banner trước"
        >
          <ChevronLeft size={25} />
        </button>

        <button
          type="button"
          className="hero-arrow hero-arrow-right"
          onClick={nextSlide}
          aria-label="Banner tiếp theo"
        >
          <ChevronRight size={25} />
        </button>

        <div className="hero-pagination">
          {slides.map((slide, index) => (
            <button
              key={slide.eyebrow}
              type="button"
              className={`hero-dot ${
                index === activeSlide ? "active" : ""
              }`}
              onClick={() => setActiveSlide(index)}
              aria-label={`Chuyển đến banner ${index + 1}`}
              aria-current={index === activeSlide ? "true" : undefined}
            />
          ))}
        </div>

        <div className="hero-counter">
          <span>0{activeSlide + 1}</span>
          <span className="hero-counter-divider" />
          <span>0{slides.length}</span>
        </div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              EXPLORE COLLECTION
            </span>
            <h2>Danh mục nổi bật</h2>
            <p>Tìm thiết bị phù hợp với nhu cầu của bạn.</p>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const CategoryIcon = category.icon;

            return (
              <Link
                to={`/products?category=${category.id}`}
                className="category-card"
                key={category.id}
              >
                <div className="category-icon">
                  <CategoryIcon size={34} strokeWidth={1.4} />
                </div>

                <h3>{category.name}</h3>
                <p>{category.description}</p>

                <span className="category-arrow">
                  <ArrowRight size={18} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <Products onAddToCart={onAddToCart} featuredOnly={true} />

      <section className="benefits-section" id="why-gearzone">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">WHY GEARZONE</span>
            <h2>Mua sắm đơn giản hơn</h2>
            <p>Thông tin rõ ràng, trải nghiệm thuận tiện.</p>
          </div>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit) => {
            const BenefitIcon = benefit.icon;

            return (
              <div className="benefit-item" key={benefit.title}>
                <div className="benefit-icon">
                  <BenefitIcon size={25} strokeWidth={1.5} />
                </div>

                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  // Lấy tài khoản đang đăng nhập từ AuthContext.
  const { user } = useAuth();

  // Mỗi tài khoản có một khóa giỏ hàng riêng.
  const cartStorageKey = getCartStorageKey(user);

  const [cart, setCart] = useState([]);
  const [loadedCartKey, setLoadedCartKey] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Tải giỏ hàng mỗi khi người dùng chuyển tài khoản.
  useEffect(() => {
    const savedCart = readCart(cartStorageKey);

    setCart(savedCart);
    setLoadedCartKey(cartStorageKey);
  }, [cartStorageKey]);

  // Chỉ lưu giỏ hàng sau khi đã tải đúng giỏ của tài khoản hiện tại.
  // Điều này tránh ghi đè giỏ mới bằng dữ liệu của tài khoản trước.
  useEffect(() => {
    if (loadedCartKey !== cartStorageKey) return;

    try {
      localStorage.setItem(
        cartStorageKey,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error("Không thể lưu giỏ hàng:", error);
    }
  }, [cart, cartStorageKey, loadedCartKey]);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const updateCart = useCallback((updater) => {
    setCart((previousCart) =>
      typeof updater === "function"
        ? updater(previousCart)
        : updater
    );
  }, []);

  
  // Lấy ID thống nhất cho sản phẩm từ MongoDB hoặc dữ liệu cũ.
  const getProductId = (product) => {
    const id = product?._id ?? product?.id;
    return id == null ? null : String(id);
  };

  const handleAddToCart = (product, quantity = 1) => {
    const productId = getProductId(product);

    if (productId === null) {
      console.error("Sản phẩm không có ID hợp lệ:", product);
      setToast({
        type: "error",
        message: "Không thể thêm sản phẩm vì thiếu mã sản phẩm.",
      });
      return;
    }

    const amount = Math.max(1, Number(quantity) || 1);

    updateCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => getProductId(item) === productId
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          getProductId(item) === productId
            ? {
                ...item,
                ...product,
                quantity: (Number(item.quantity) || 1) + amount,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          id: productId,
          quantity: amount,
        },
      ];
    });

    setToast({
      type: "success",
      message: `${product.name} đã được thêm vào giỏ hàng.`,
    });
  };

  const handleUpdateQuantity = (productId, quantity) => {
    const targetId = String(productId);

    updateCart((currentCart) =>
      currentCart.map((item) =>
        getProductId(item) === targetId
          ? { ...item, quantity: Math.max(1, Number(quantity) || 1) }
          : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    const targetId = String(productId);

    updateCart((currentCart) =>
      currentCart.filter(
        (item) => getProductId(item) !== targetId
      )
    );
  };


  const handlePlaceOrder = useCallback(() => {
    updateCart([]);
  }, [updateCart]);

  const cartCount = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  return (
    <div className={isAdminPage ? "app admin-app" : "app"}>
      {!isAdminPage && <Header cartCount={cartCount} />}

      <Routes>
        <Route
          path="/"
          element={<HomePage onAddToCart={handleAddToCart} />}
        />

        <Route
          path="/products"
          element={<Products onAddToCart={handleAddToCart} />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetail onAddToCart={handleAddToCart} />}
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveFromCart}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              cart={cart}
              onPlaceOrder={handlePlaceOrder}
            />
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        <Route
          path="*"
          element={
            <main className="products-section">
              <h2>Không tìm thấy trang</h2>
              <Link to="/">Quay lại trang chủ</Link>
            </main>
          }
        />
      </Routes>

      {!isAdminPage && <Toast toast={toast} onClose={closeToast} />}
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
