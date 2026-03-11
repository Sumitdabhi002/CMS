import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../API/axios";
import Navbar from "../Components/Navbar";

function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    start_date: "",
    end_date: "",
    total_budget: "",
  });

  useEffect(() => {
    fetchProjects();
    fetchDepartments();
  }, []);

  const fetchProjects = () => {
    api
      .get("projects/")
      .then((res) => setProjects(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  const fetchDepartments = () => {
    api
      .get("departments/")
      .then((res) => setDepartments(res.data))
      .catch((err) => console.log(err));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      department: "",
      start_date: "",
      end_date: "",
      total_budget: "",
    });
    setEditingProject(null);
  };

  const handleSaveProject = async () => {
    setSaving(true);
    setError("");

    try {
      if (editingProject) {
        await api.put(`projects/${editingProject.id}/`, formData);
      } else {
        await api.post("projects/", formData);
      }

      setOpen(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      console.log(err.response?.data);
      setError("Please fill all required fields correctly.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await api.delete(`projects/${id}/`);
      fetchProjects();
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  const getStatusColor = (status) => {
    if (status === "COMPLETED") return "bg-green-500/20 text-green-400";
    if (status === "IN_PROGRESS") return "bg-yellow-500/20 text-yellow-400";
    return "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold">Manage Projects</h2>

          <button
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="px-6 py-3 rounded-xl bg-indigo-600 font-medium
                       hover:bg-indigo-500 hover:-translate-y-1
                       transition-all duration-300 active:scale-95"
          >
            + Add Project
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center">
            <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10
                           hover:-translate-y-2 transition-all duration-500 shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{project.name}</h3>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4">
                  {project.description}
                </p>

                <div className="text-sm space-y-2">
                  <p>
                    <span className="text-gray-400">Department:</span>{" "}
                    {project.department_name || project.department}
                  </p>
                  <p>
                    <span className="text-gray-400">Start:</span>{" "}
                    {project.start_date}
                  </p>
                  <p>
                    <span className="text-gray-400">End:</span>{" "}
                    {project.end_date || "-"}
                  </p>
                  <p>
                    <span className="text-gray-400">Budget:</span> ₹
                    {project.total_budget}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setFormData({
                        name: project.name,
                        description: project.description,
                        department: project.department,
                        start_date: project.start_date,
                        end_date: project.end_date || "",
                        total_budget: project.total_budget,
                      });
                      setOpen(true);
                    }}
                    className="px-3 py-1 text-sm rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-3 py-1 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-lg"
            >
              <h3 className="text-2xl font-semibold mb-6">
                {editingProject ? "Edit Project" : "Add Project"}
              </h3>

              <div className="space-y-4">
                <input
                  placeholder="Project Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                />

                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                />

                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="" className="bg-slate-900 text-white">
                    Select Department
                  </option>

                  {departments.map((dept) => (
                    <option
                      key={dept.id}
                      value={dept.id}
                      className="bg-slate-900 text-white"
                    >
                      {dept.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                />

                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                />

                <input
                  type="number"
                  placeholder="Total Budget"
                  value={formData.total_budget}
                  onChange={(e) =>
                    setFormData({ ...formData, total_budget: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                />

                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveProject}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingProject ? "Update" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageProjects;
