
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, UserRound, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

function Header({ cartCount = 0 }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [searchText, setSearchText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  
  const handleSearch = (event) => {
    event.preventDefault();

    const keyword = searchText.trim();

    if (keyword) {
      window.location.href = `/products?search=${encodeURIComponent(keyword)}`;
    }
  };

  return (
    <header
      className={`site-header ${isHomePage ? "site-header-home" : "site-header-inner"
        }`}
    >
      <div className="header-container">
        <Link to="/" className="brand" aria-label="GEARZONE trang chủ">
          GEARZONE<span>.</span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            Trang chủ
          </NavLink>

          <NavLink to="/products" onClick={() => setMenuOpen(false)}>
            Sản phẩm
          </NavLink>

          <Link
            to="/#why-gearzone"
            onClick={() => setMenuOpen(false)}
          >
            Giới thiệu
          </Link>
        </nav>

        <div className="header-actions">

          <form
            className="search-form"
            onSubmit={handleSearch}
            role="search"
          >
            <input
              type="search"
              placeholder="Tìm sản phẩm..."
              aria-label="Tìm kiếm sản phẩm"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />

            <button type="submit" aria-label="Tìm kiếm">
              <Search size={19} strokeWidth={1.8} />
            </button>
          </form>


          
<Link
  to={user ? "/cart" : "/login"}
  className="cart-link"
  aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
  title="Giỏ hàng"
>
  <ShoppingCart size={22} />
  <span className="cart-count">{cartCount}</span>
</Link>

          <div className="header-account">
  {user ? (
    <>
      <Link to="/profile" className="header-login">
        <UserRound size={20} />
        <span>{user.fullName}</span>
      </Link>

      <button
        type="button"
        className="header-logout"
        onClick={logout}
        aria-label="Đăng xuất"
        title="Đăng xuất"
      >
        <LogOut size={18} />
      </button>
    </>
  ) : (
    <Link to="/login" className="header-login">
      <UserRound size={20} />
      <span>Đăng nhập</span>
    </Link>
  )}
</div>
        </div>
      </div>
    </header>
  );
}

export default Header;
