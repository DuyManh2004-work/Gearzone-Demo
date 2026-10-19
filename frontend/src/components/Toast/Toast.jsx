
import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import "./Toast.css";

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";
  const Icon = isError ? XCircle : CheckCircle2;

  return (
    <div
      className={`toast toast-${isError ? "error" : "success"}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <div className="toast-icon">
        <Icon size={23} />
      </div>

      <div className="toast-content">
        <strong>
          {isError ? "Có lỗi xảy ra" : "Đã thêm vào giỏ hàng"}
        </strong>

        <p>{toast.message}</p>

        {!isError && (
          <Link to="/cart" className="toast-link" onClick={onClose}>
            Xem giỏ hàng
          </Link>
        )}
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Đóng thông báo"
      >
        <X size={17} />
      </button>
    </div>
  );
}

export default Toast;
