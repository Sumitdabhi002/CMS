import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../API/axios";
import Navbar from "../Components/Navbar";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("admin-dashboard/")
      .then((res) => setData(res.data))
      .catch((err) => console.log(err));
  }, []);

const handleDownloadReport = async () => {
  try {
    const response = await api.get("department-performance-excel/", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "department_performance_report.xlsx");

    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.log(error);
  }
};

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-10"
        >
          Admin Dashboard
        </motion.h2>

        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {[
            { label: "Total Employees", value: data.total_employees },
            { label: "Total Projects", value: data.total_projects },
            { label: "Total Budget", value: data.total_allocated_budget },
            { label: "Total Teams", value: data.total_teams },
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl
                         transition-all duration-500 hover:-translate-y-2 hover:shadow-indigo-500/20"
            >
              <p className="text-gray-400 text-sm mb-2">{item.label}</p>
              <h3 className="text-2xl font-semibold">{item.value}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-6">

          <button
            onClick={() => navigate("/admin/employees")}
            className="px-6 py-3 rounded-xl bg-indigo-600 font-medium
                       transition-all duration-300 hover:bg-indigo-500
                       hover:-translate-y-1 active:scale-95 shadow-lg"
          >
            Manage Employees
          </button>

          <button
            onClick={() => navigate("/admin/projects")}
            className="px-6 py-3 rounded-xl bg-cyan-600 font-medium
                       transition-all duration-300 hover:bg-cyan-500
                       hover:-translate-y-1 active:scale-95 shadow-lg"
          >
            Manage Projects
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-6 py-3 rounded-xl bg-emerald-600 font-medium
                       transition-all duration-300 hover:bg-emerald-500
                       hover:-translate-y-1 active:scale-95 shadow-lg"
          >
            Download Department Report
          </button>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
