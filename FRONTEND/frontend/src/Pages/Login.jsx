import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      const profileResponse = await axios.get(
        "http://127.0.0.1:8000/api/my-profile/",
        {
          headers: {
            Authorization: `Bearer ${response.data.access}`,
          },
        },
      );

      const role = profileResponse.data.role;
      localStorage.setItem("role", role);

      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 
                   rounded-3xl shadow-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Welcome Back
        </h2>

        {/* Username */}
        <div className="relative mb-6">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder=""
            className="peer w-full px-4 pt-6 pb-2 bg-transparent 
               border border-white/20 rounded-xl text-white
               focus:outline-none focus:border-indigo-500
               focus:ring-2 focus:ring-indigo-500/30
               transition-all duration-300"
          />

          <label
            className="absolute left-4 top-2 text-sm text-indigo-400
               transition-all duration-300
               peer-placeholder-shown:top-4
               peer-placeholder-shown:text-base
               peer-placeholder-shown:text-gray-400
               peer-focus:top-2
               peer-focus:text-sm
               peer-focus:text-indigo-400"
          >
            Username
          </label>
        </div>

        {/* Password */}
        <div className="relative mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="peer w-full px-4 pt-6 pb-2 bg-transparent 
               border border-white/20 rounded-xl text-white
               placeholder:text-transparent
               focus:outline-none focus:border-indigo-500
               focus:ring-2 focus:ring-indigo-500/30
               transition-all duration-300"
          />

          <label
            className="absolute left-4 top-2 text-sm text-indigo-400
               transition-all duration-300
               peer-placeholder-shown:top-4
               peer-placeholder-shown:text-base
               peer-placeholder-shown:text-gray-400
               peer-focus:top-2
               peer-focus:text-sm
               peer-focus:text-indigo-400"
          >
            Password
          </label>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm mb-4 text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold
                     transition-all duration-300
                     hover:bg-indigo-500 hover:-translate-y-1
                     active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center"
        >
          {loading ? (
            <div
              className="h-5 w-5 border-2 border-white border-t-transparent 
                            rounded-full animate-spin"
            ></div>
          ) : (
            "Login"
          )}
        </button>
      </motion.div>
    </div>
  );
}

export default Login;
