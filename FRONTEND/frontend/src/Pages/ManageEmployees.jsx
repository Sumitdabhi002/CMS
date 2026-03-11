import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../API/axios";
import Navbar from "../Components/Navbar";

function ManageEmployees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api
      .get("admin/employees-overview/")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-10"
        >
          Manage Employees
        </motion.h2>

        {employees.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {employees.map((emp) => (
              <motion.div
                key={emp.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="group p-6 rounded-2xl backdrop-blur-xl bg-white/5 
                           border border-white/10 shadow-xl
                           transition-all duration-500 
                           hover:-translate-y-2 hover:shadow-indigo-500/20"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {emp.name}
                </h3>

                <p className="text-gray-400 text-sm mb-4">
                  {emp.department}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Project</span>
                    <span>
                      {emp.project || "Not Assigned"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Clock In</span>
                    <span>{emp.clock_in || "-"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Clock Out</span>
                    <span>{emp.clock_out || "-"}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-white/10">
                    <span className="text-gray-400">Today's Hours</span>
                    <span className="font-semibold text-indigo-400">
                      {emp.today_hours}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ManageEmployees;
