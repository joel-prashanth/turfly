import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>

    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,

        style: {
          borderRadius: "16px",
          background: "#fff",
          color: "#0f172a",
          padding: "16px",
          fontWeight: "500",
        },

        success: {
          iconTheme: {
            primary: "#16a34a",
            secondary: "#ffffff",
          },
        },

        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#ffffff",
          },
        },
      }}
    />
  </StrictMode>,
);