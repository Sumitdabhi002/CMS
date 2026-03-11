import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import AdminDashboard from "./Pages/AdminDashboard";
import ProtectedRoute from "./Routers/ProtectedRoute";
import EmployeeDashboard from "./Pages/EmployeeDashboard";
import ManageEmployees from "./Pages/ManageEmployees";
import Profile from "./Pages/Profile";
import ManageProjects from "./Pages/ManageProjects";
function App() {
  const role = localStorage.getItem("role");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/"
          element={
            role === "ADMIN" ? (
              <Navigate to="/admin" />
            ) : role === "EMPLOYEE" ? (
              <Navigate to="/employee" />
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <ManageEmployees />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/projects" element={<ManageProjects />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
