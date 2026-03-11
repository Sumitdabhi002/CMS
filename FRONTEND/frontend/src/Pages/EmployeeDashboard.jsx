import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import api from "../API/axios";

function EmployeeDashboard() {

  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState(null);
  const [project, setProject] = useState(null);

  const [clockInTime, setClockInTime] = useState(null);
  const [timer, setTimer] = useState("00:00:00");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    getTodayAttendance();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, teamRes, projectRes] = await Promise.all([
        api.get("my-profile/"),
        api.get("my-team/"),
        api.get("my-project/")
      ]);

      setProfile(profileRes.data);
      setTeam(teamRes.data);
      setProject(projectRes.data);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getTodayAttendance = async () => {
    try {
      const res = await api.get("today-attendance/");

      if (res.data.clock_in && !res.data.clock_out) {
        setClockInTime(res.data.clock_in);
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {

    let interval;

    if (clockInTime) {

      interval = setInterval(() => {

        const start = new Date(clockInTime);
        const now = new Date();

        const diff = Math.floor((now - start) / 1000);

        const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const seconds = String(diff % 60).padStart(2, "0");

        setTimer(`${hours}:${minutes}:${seconds}`);

      }, 1000);

    }

    return () => clearInterval(interval);

  }, [clockInTime]);

  const clockIn = async () => {
    try {
      await api.post("clock-in/");
      alert("Clocked In Successfully");
      getTodayAttendance();
    } catch (error) {
      alert(error.response?.data?.error);
    }
  };

  const clockOut = async () => {
    try {
      await api.post("clock-out/");
      alert("Clocked Out Successfully");
      setClockInTime(null);
      setTimer("00:00:00");
    } catch (error) {
      alert(error.response?.data?.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        <h2 className="text-4xl font-bold mb-10">
          Employee Dashboard
        </h2>

        {/* Timer */}
        <div className="mb-10 text-center">

          <p className="text-gray-400 mb-2">
            Working Timer
          </p>

          <h1 className="text-6xl font-mono font-bold text-indigo-400">
            {timer}
          </h1>

        </div>

        {/* Profile Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">

          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-gray-400">Username</p>
            <h3 className="text-xl">{profile.username}</h3>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-gray-400">Department</p>
            <h3 className="text-xl">{profile.department}</h3>
          </div>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-gray-400">Team</p>
            <h3 className="text-xl">
              {team?.team?.length ? team.team.join(", ") : "No Team"}
            </h3>
          </div>

        </div>

        {/* Project */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-10">

          <h3 className="text-xl font-semibold mb-4">
            Assigned Project
          </h3>

          {project?.project_name ? (

            <div className="space-y-2">

              <p>Project: {project.project_name}</p>

              <p>Status: {project.status}</p>

              <p>Allocated Budget: ₹{project.allocated_budget}</p>

            </div>

          ) : (

            <p>No Project Assigned</p>

          )}

        </div>

        {/* Attendance Buttons */}
        <div className="flex gap-6 justify-center">

          <button
            onClick={clockIn}
            className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition"
          >
            Clock In
          </button>

          <button
            onClick={clockOut}
            className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition"
          >
            Clock Out
          </button>

        </div>

      </div>

    </div>
  );
}

export default EmployeeDashboard;