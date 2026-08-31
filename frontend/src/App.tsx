import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PatientFeedPage } from "./pages/PatientFeedPage";
import { DoctorListingPage } from "./pages/DoctorListingPage";
import { DoctorDetailPage } from "./pages/DoctorDetailPage";
import { HospitalListingPage } from "./pages/HospitalListingPage";
import { HospitalDetailPage } from "./pages/HospitalDetailPage";
import { MyAppointmentsPage } from "./pages/MyAppointmentsPage";
import { DoctorDashboardPage } from "./pages/DoctorDashboardPage";
import { DoctorAppointmentsPage } from "./pages/DoctorAppointmentsPage";
import { DoctorContentManagePage } from "./pages/DoctorContentManagePage";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public & Discovery Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/feed" element={<PatientFeedPage />} />
                <Route path="/doctors" element={<DoctorListingPage />} />
                <Route path="/doctors/:id" element={<DoctorDetailPage />} />
                <Route path="/hospitals" element={<HospitalListingPage />} />
                <Route path="/hospitals/:id" element={<HospitalDetailPage />} />

                {/* Patient Routes */}
                <Route
                  path="/my-appointments"
                  element={
                    <ProtectedRoute patientOnly>
                      <MyAppointmentsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Portal Routes */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute doctorOnly>
                      <DoctorDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/appointments"
                  element={
                    <ProtectedRoute doctorOnly>
                      <DoctorAppointmentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/content"
                  element={
                    <ProtectedRoute doctorOnly>
                      <DoctorContentManagePage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;