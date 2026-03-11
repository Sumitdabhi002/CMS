import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../API/axios";
import Navbar from "../Components/Navbar";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("profile/")
      .then((res) => {
        setProfile(res.data);
        setEmail(res.data.email);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await api.put("profile/", { email });
      setProfile(res.data);
      setMessage("Profile updated successfully");
    } catch {
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-xl"
        >
          <h2 className="text-3xl font-bold mb-8">My Profile</h2>

          {/* Avatar */}
          <div className="flex items-center gap-6 mb-10">
            <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-bold">
              {profile.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-xl font-semibold">{profile.username}</p>
              <p className="text-gray-400">{profile.role}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">

            {/* Username */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Username
              </label>
              <input
                value={profile.username}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl
                           focus:outline-none focus:border-indigo-500
                           focus:ring-2 focus:ring-indigo-500/30 transition"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                Department
              </label>
              <input
                value={profile.department || "Not Assigned"}
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Message */}
            {message && (
              <p className="text-sm text-indigo-400">
                {message}
              </p>
            )}

            {/* Save Button */}
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-indigo-600 font-medium
                         transition-all duration-300
                         hover:bg-indigo-500 hover:-translate-y-1
                         active:scale-95
                         disabled:opacity-50
                         flex items-center justify-center"
            >
              {saving ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save Changes"
              )}
            </button>

          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Profile;
