import { useContext, useState, useRef, useEffect } from 'react';
import './Login.css';
import { auth, googleProvider, signInWithPopup } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { showToast, showGoogleLoginToast } from '../../utils/toastUtils';
import { FaArrowLeft } from 'react-icons/fa';
import { StoreContext } from '../../context/StoreContext';
import { useTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const { t } = useTranslation();
  const { setToken, setIsGoogleUser } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Login"); // Login | Sign Up | Verify OTP
  const [tempEmail, setTempEmail] = useState("");
  const navigate = useNavigate();
  const isLoggingIn = useRef(false);
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    otp: ""
  });

  useEffect(() => {
    showToast.dismiss();
    return () => showToast.dismiss();
  }, []);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(data => ({ ...data, [name]: value }));
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn.current) return;
    isLoggingIn.current = true;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const user = result.user;
        const token = await user.getIdToken();

        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.uid);
        localStorage.setItem("userName", user.displayName || user.email);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("isGoogleUser", "true");

        setToken(token);
        setIsGoogleUser(true);

        window.dispatchEvent(new CustomEvent('authStateChanged', {
          detail: { type: 'login', userId: user.uid, userName: user.displayName || user.email }
        }));

        showGoogleLoginToast();

        setTimeout(() => {
          const redirectUrl = localStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectUrl);
          } else {
            navigate('/');
          }
          isLoggingIn.current = false;
        }, 500);
      }
    } catch (error) {
      console.error("Google login error:", error);
      showToast.error("❌ Đăng nhập Google thất bại");
      isLoggingIn.current = false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currState === "Sign Up") {
        const res = await fetch("http://localhost:4000/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            password: data.password,
          }),
        });

        const result = await res.json();
        if (result.success) {
          showToast.success("📨 Mã OTP đã được gửi đến email");
          setTempEmail(data.email);
          setCurrState("Verify OTP");
        } else {
          showToast.error("❌ " + result.message);
        }

      } else if (currState === "Login") {
        const res = await fetch("http://localhost:4000/api/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        const result = await res.json();
        if (result.success) {
          showToast.success("✅ " + t('success'));
          localStorage.setItem("token", result.token);
          localStorage.setItem("userId", result.userId);
          localStorage.setItem("userName", result.name);
          localStorage.setItem("userEmail", result.email);
          localStorage.setItem("isGoogleUser", "false");

          setToken(result.token);
          setIsGoogleUser(false);

          window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { type: 'login', userId: result.userId, userName: result.name }
          }));

          const redirectUrl = localStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectUrl);
          } else {
            navigate('/');
          }
        } else {
          showToast.error("❌ " + result.message);
        }
      }
    } catch (err) {
      console.error(err);
      showToast.error("⚠️ Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tempEmail,
          otp: data.otp
        }),
      });

      const result = await res.json();
      if (result.success) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("userName", result.name);
        localStorage.setItem("userEmail", tempEmail);
        localStorage.setItem("isGoogleUser", "false");

        setToken(result.token);
        setIsGoogleUser(false);

        window.dispatchEvent(new CustomEvent('authStateChanged', {
          detail: { type: 'login', userId: result.userId, userName: result.name }
        }));

        showToast.success("✅ Xác thực thành công! Đang chuyển hướng...");
        await new Promise(resolve => setTimeout(resolve, 1500)); // Delay toast
        console.log("✅ OTP verified, navigating to /");
        navigate('/');


        return;
      } else {
        showToast.error("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      showToast.error("⚠️ Có lỗi xảy ra khi xác minh OTP");
    }
  };

  const handleSendResetOtp = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/user/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email })
      });
      const result = await res.json();
      if (result.success) {
        showToast.success("📨 Mã OTP đặt lại mật khẩu đã gửi đến email.");
      } else {
        showToast.error("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      showToast.error("⚠️ Gửi OTP thất bại");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          otp: data.otp,
          newPassword: data.password
        })
      });
      const result = await res.json();
      if (result.success) {
        showToast.success("✅ Đặt lại mật khẩu thành công. Đăng nhập lại.");
        setCurrState("Login");
      } else {
        showToast.error("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      showToast.error("⚠️ Đặt lại mật khẩu thất bại");
    }
  };



  return (
    <div className="login-wrapper">
      <div className="login-left">
        <h1>Orchard Perfume</h1>
        <p>{t('brandSlogan')}</p>
        <img src="bg.jpg" alt="banner" />
      </div>

      <div className="login-right">
        <div className="back-button" onClick={() => navigate('/')}>
          <FaArrowLeft style={{ marginRight: '6px' }} />
          {t('backToHome')}
        </div>

        {currState === "ForgotPassword" && (
          <form className="login-form" onSubmit={handleResetPassword} >
            <h2>Quên mật khẩu</h2>
            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              value={data.email}
              onChange={onChangeHandler}
              required
            />
            <button type="button" onClick={handleSendResetOtp} >
              Gửi mã OTP
            </button>
            <input
              type="text"
              name="otp"
              placeholder="Nhập mã OTP"
              value={data.otp}
              onChange={onChangeHandler}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu mới"
              value={data.password}
              onChange={onChangeHandler}
              required
            />
            <button type="submit">Đặt lại mật khẩu</button>
            <p><span
              onClick={() => {
                setData(prev => ({
                  ...prev,
                  otp: ""
                }));
                setCurrState("Login");
              }}
            >
              Quay về đăng nhập
            </span></p>
          </form>
        )}

        {currState === "Verify OTP" && (
          <form className="login-form" onSubmit={handleVerifyOtp}>
            <h2>Xác minh OTP</h2>
            <input
              type="text"
              name="otp"
              placeholder="Nhập mã OTP"
              value={data.otp}
              onChange={onChangeHandler}
              required
            />
            <button type="submit">Xác nhận</button>
            <p><span onClick={() => setCurrState("Login")}>Quay về đăng nhập</span></p>
          </form>
        )}

        {(currState === "Login" || currState === "Sign Up") && (
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>{currState === "Sign Up" ? t('register') : t('login')}</h2>

            <div className="login-input">
              {currState === "Sign Up" && (
                <input
                  type="text"
                  name="name"
                  placeholder={t('yourName')}
                  value={data.name}
                  onChange={onChangeHandler}
                  required
                />
              )}
              <input
                type="email"
                name="email"
                placeholder={t('email')}
                value={data.email}
                onChange={onChangeHandler}
                required
              />
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t('password')}
                  value={data.password}
                  onChange={onChangeHandler}
                  required
                />
                <span
                  className="toggle-password"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {currState === "Login" && (
                <p className="forgot-password">
                  <span
                    onClick={() => {
                      setData(prev => ({
                        ...prev,
                        otp: "",
                        password: ""
                      }));
                      setCurrState("ForgotPassword");
                    }}
                  >
                    {t('forgotPassword') || 'Quên mật khẩu?'}
                  </span>   
                </p>

              )}
            </div>

            <button type="submit">
              {currState === "Sign Up" ? t('createAccount') : t('login')}
            </button>

            <div className="login-or">
              <hr /><span>{t('or')}</span><hr />
            </div>

            <button type="button" onClick={handleGoogleLogin} className="google-login-btn">
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" />
              {t('loginWithGoogle')}
            </button>

            <div className="login-condition">
              <input type="checkbox" required />
              <p>{t('agreeTerms')}</p>
            </div>

            <p>
              {currState === "Login"
                ? <>{t('noAccount')} <span onClick={() => setCurrState("Sign Up")}>{t('register')}</span></>
                : <>{t('haveAccount')} <span onClick={() => setCurrState("Login")}>{t('login')}</span></>
              }
            </p>
          </form>
        )}
      </div>
    </div>
  );

};

export default Login;
