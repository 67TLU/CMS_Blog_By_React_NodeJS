import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { DialogProvider } from "./context/DialogProvider.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import AnnouncementModal from "./components/modals/AnnouncementModal";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import AbilityProvider from "./ability/AbilityProvider.jsx"; 
createRoot(document.getElementById("root")).render(
  <StrictMode>
                <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
       

            <AbilityProvider>
              <DialogProvider>
                <AnnouncementModal>
                   
                  Chào mừng bạn đến với Portal News. Nội dung và tài khoản được tải từ máy chủ.

                </AnnouncementModal>
                <App></App>
              </DialogProvider>
              </AbilityProvider>
        </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
