
import { Mail, MapPin, Phone, Link as LinkIcon } from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer" id="about">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="#home" className="footer-logo">
              GEARZONE<span>.</span>
            </a>

            <p>
              Khám phá những thiết bị công nghệ và gaming phù hợp
              với phong cách của bạn.
            </p>

            <div className="footer-socials">
              <a href="#facebook" aria-label="Facebook">
                <LinkIcon size={19} />
              </a>
              <a href="#instagram" aria-label="Instagram">
                <LinkIcon size={19} />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Danh mục</h3>
            <a href="#mouse">Chuột gaming</a>
            <a href="#keyboard">Bàn phím</a>
            <a href="#headset">Tai nghe</a>
            <a href="#accessories">Phụ kiện</a>
          </div>

          <div className="footer-column">
            <h3>Hỗ trợ</h3>
            <a href="#shipping">Chính sách vận chuyển</a>
            <a href="#returns">Đổi trả sản phẩm</a>
            <a href="#warranty">Chính sách bảo hành</a>
            <a href="#faq">Câu hỏi thường gặp</a>
          </div>

          <div className="footer-column footer-contact">
            <h3>Liên hệ</h3>

            <p>
              <MapPin size={17} />
              <span>Việt Nam</span>
            </p>

            <p>
              <Phone size={17} />
              <span>Thông tin điện thoại sẽ được cập nhật</span>
            </p>

            <p>
              <Mail size={17} />
              <span>support@gearzone.example</span>
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} GEARZONE. All rights reserved.
          </p>
          <p>Designed for technology lovers.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
