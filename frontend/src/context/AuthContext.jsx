
import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api/auth";
const PROFILE_STORAGE_KEY = "gearzone_demo_profile";

function readSavedProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

async function requestApi(path, body) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Không thể kết nối máy chủ. Hãy kiểm tra Backend đang chạy."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Máy chủ trả về dữ liệu không hợp lệ.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Yêu cầu không thành công.");
  }

  return result;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(() => readSavedProfile());

  const register = useCallback(async ({ fullName, email, password }) => {
    try {
      const result = await requestApi("/register", {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      return {
        success: true,
        message: result.message || "Đăng ký tài khoản thành công.",
        user: result.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Đăng ký thất bại.",
      };
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const result = await requestApi("/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const account = result.data?.user || result.data;

      const nextUser = {
        id: account.id || account._id,
        fullName: account.fullName || account.name,
        email: account.email,
        role: account.role || "user",
      };

      setUser(nextUser);

      const nextProfile = {
        fullName: nextUser.fullName,
        email: nextUser.email,
        phone: account.phone || "",
        address: account.address || "",
      };

      setProfile(nextProfile);

      try {
        localStorage.setItem(
          PROFILE_STORAGE_KEY,
          JSON.stringify(nextProfile)
        );
      } catch {
        // Vẫn sử dụng hồ sơ trong phiên hiện tại.
      }

      return {
        success: true,
        message: result.message || "Đăng nhập thành công.",
        user: nextUser,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Đăng nhập thất bại.",
      };
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!user) {
      return {
        success: false,
        message: "Vui lòng đăng nhập trước.",
      };
    }

    // Chưa gửi cập nhật lên Backend ở bước này.
    // Tránh giả báo thành công khi dữ liệu chưa được lưu trên máy chủ.
    return {
      success: false,
      message: "Chức năng cập nhật hồ sơ Backend sẽ được kết nối ở bước tiếp theo.",
    };
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setProfile(null);

    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
      // Không ảnh hưởng việc đăng xuất trong phiên hiện tại.
    }
  }, []);

  const value = {
    user,
    profile,
    register,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth phải được sử dụng bên trong AuthProvider."
    );
  }

  return context;
}
