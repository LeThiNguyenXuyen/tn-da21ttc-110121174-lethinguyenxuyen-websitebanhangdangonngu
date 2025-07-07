import { toast } from 'react-toastify';

// Force clear all toasts
const forceClearToasts = () => {
  toast.dismiss();
  // Additional cleanup for stuck toasts
  const toastElements = document.querySelectorAll('.Toastify__toast');
  toastElements.forEach(element => {
    element.remove();
  });
};

// Utility functions for better toast management
export const showToast = {
  success: (message, options = {}) => {
    forceClearToasts(); // Force clear existing toasts
    return toast.success(message, {
      toastId: `success-${Date.now()}`,
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      containerId: "main-toast-container",
      ...options
    });
  },
  
  error: (message, options = {}) => {
    forceClearToasts(); // Force clear existing toasts
    return toast.error(message, {
      toastId: `error-${Date.now()}`,
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      containerId: "main-toast-container",
      ...options
    });
  },

  info: (message, options = {}) => {
    forceClearToasts(); // Force clear existing toasts
    return toast.info(message, {
      toastId: `info-${Date.now()}`,
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      containerId: "main-toast-container",
      ...options
    });
  },

  warning: (message, options = {}) => {
    forceClearToasts(); // Force clear existing toasts
    return toast.warning(message, {
      toastId: `warning-${Date.now()}`,
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      containerId: "main-toast-container",
      ...options
    });
  },

  dismiss: () => {
    forceClearToasts();
  }
};

// Specific toast for login success
export const showLoginSuccessToast = (message = "✅ Đăng nhập thành công") => {
  forceClearToasts();
  return toast.success(message, {
    toastId: 'login-success',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    containerId: "main-toast-container"
  });
};

// Specific toast for Google login
export const showGoogleLoginToast = (message = "✅ Đăng nhập Google thành công") => {
  forceClearToasts();
  return toast.success(message, {
    toastId: 'google-login-success',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    containerId: "main-toast-container"
  });
};
