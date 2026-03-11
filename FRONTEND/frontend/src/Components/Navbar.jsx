import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../API/axios"; // ✅ Make sure this path is correct

function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [username, setUsername] = useState(
    localStorage.getItem("username") || "Admin"
  );
  const [role, setRole] = useState(
    localStorage.getItem("role") || "User"
  );

  // ✅ Fetch profile on mount
  useEffect(() => {
    api.get("profile/")
      .then((res) => {
        setUsername(res.data.username);
        setRole(res.data.role);

        // keep localStorage in sync
        localStorage.setItem("username", res.data.username);
        localStorage.setItem("role", res.data.role);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handelLogout = () => {
    localStorage.removeItem("refresh");
    localStorage.removeItem("access");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const initials = username
    ? username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A";

  const handleHome = () => {
    if (role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/employee");
    }
  };

  return (
    <nav className="bg-slate-900/70 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center text-white">

      {/* Left Side */}
      <div className="flex items-center gap-6">

        {/* Home Button */}
        <button
          onClick={handleHome}
          className="flex items-center gap-2 px-4 py-2 rounded-lg 
                     bg-white/5 border border-white/10
                     hover:bg-indigo-600 hover:-translate-y-1
                     transition-all duration-300 active:scale-95"
        >
          ← Home
        </button>

        <h1 className="text-xl font-semibold tracking-wide">
          Admin Panel
        </h1>
      </div>

      {/* Profile Section */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 group"
        >
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-semibold 
                          transition-all duration-300 group-hover:scale-110">
            {initials}
          </div>

          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium">{username}</p>
            <p className="text-xs text-gray-400">{role}</p>
          </div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-4 w-48 bg-slate-800 border border-white/10 
                         rounded-xl shadow-xl overflow-hidden"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-3 hover:bg-white/10 transition"
              >
                View Profile
              </button>

              <button
                onClick={handelLogout}
                className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-red-400 transition"
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

export default Navbar;
