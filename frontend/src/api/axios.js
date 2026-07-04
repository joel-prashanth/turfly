import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
});

// Globally suppress "Access denied" toasts — 403 means role mismatch, not a user error.
// Individual catch blocks still run but shouldn't surface this message.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    // 401 = not authenticated (expected for guests / token expiry — ProtectedRoute handles redirect)
    // 403 = wrong role (expected for role-gated routes)
    // Neither should show a toast — they're routing concerns, not user errors.
    if (status === 401 || status === 403) {
      error._silent = true;
    }
    return Promise.reject(error);
  },
);

// Call this in every catch block instead of toast.error directly.
// Skips the toast for silent (role-mismatch) errors.
export const toastError = (error, fallback = "Something went wrong") => {
  if (error?._silent) return;
  toast.error(error?.response?.data?.message || fallback);
};

export default api;
