import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, recentAttendance: [] });
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchStats = async () => {
    try {
      console.log("Attempting to fetch stats...");
      const res = await axios.get('http://localhost:5000/api/stats');
      
      console.log("Data received from server:", res.data); // CHECK THIS IN F12
      setStats(res.data);
    } catch (err) {
      console.error("API Error:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchStats();
}, []);

  if (loading) return <div className="p-10 text-center font-medium text-slate-500">Loading Stats...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Welcome back, Nikita</h1>
        <p className="text-slate-500">Here is what's happening today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Enrolled</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
          <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Present Today</p>
            <h3 className="text-3xl font-bold text-slate-800">{stats.presentToday}</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-slate-400" />
            Recent Activity
          </h3>
        </div>
        <div className="p-0">
          {stats.recentAttendance.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Roll No</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentAttendance.map((record) => (
                  <tr key={record._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{record.studentId?.name}</td>
                    <td className="px-6 py-4 text-slate-500">{record.studentId?.rollNo}</td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-slate-400 italic">No attendance records found for today.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;