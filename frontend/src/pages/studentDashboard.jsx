import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance'; // ✅ Correct import
import { Calendar, Users, CheckCircle2, XCircle } from 'lucide-react';

const StudentDashboard = () => {
  const [allStudents, setAllStudents] = useState([]);
  const [monthlyLogs, setMonthlyLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthName = today.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await API.get('/student-dashboard'); // ✅ Use API instance
        setAllStudents(res.data.allStudents);
        setMonthlyLogs(res.data.monthlyHistory);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error", err);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Filter students based on the date clicked on the calendar
  const getStatusForDate = (dateStr) => {
    const attendanceForDate = monthlyLogs
      .filter(log => log.date === dateStr)
      .map(log => log.studentId?._id || log.studentId);

    return allStudents.map(student => ({
      ...student,
      status: attendanceForDate.includes(student._id) ? 'Present' : 'Absent'
    }));
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="inline-block">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="font-bold text-slate-600 mt-4">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  const currentViewList = getStatusForDate(selectedDate);
  const presentCount = currentViewList.filter(s => s.status === 'Present').length;
  const absentCount = currentViewList.filter(s => s.status === 'Absent').length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Analytics</h1>
          <p className="text-slate-500 font-medium">Viewing logs for {monthName} {today.getFullYear()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-emerald-600">Present Today</p>
          <p className="text-2xl font-bold text-emerald-700">{presentCount}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-rose-600">Absent Today</p>
          <p className="text-2xl font-bold text-rose-700">{absentCount}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-blue-600">Total Students</p>
          <p className="text-2xl font-bold text-blue-700">{allStudents.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-purple-600">Attendance Rate</p>
          <p className="text-2xl font-bold text-purple-700">
            {allStudents.length > 0 ? Math.round((presentCount / allStudents.length) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: INTERACTIVE CALENDAR */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-500" />
              Select Date to View Attendance
            </h2>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-black text-slate-400 pb-2">{d}</div>
            ))}
            
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const hasData = monthlyLogs.some(log => log.date === dateStr);
              const isFuture = day > today.getDate();

              return (
                <button
                  key={i}
                  disabled={isFuture}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-14 md:h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative
                    ${isFuture ? 'opacity-20 cursor-not-allowed border-transparent' : 
                      isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-700 z-10 scale-105 shadow-md' : 
                      hasData ? 'border-emerald-100 bg-emerald-50/50 text-emerald-700 hover:border-emerald-300' : 
                      'border-slate-50 bg-white text-slate-600 hover:border-slate-200'}`}
                >
                  <span className="text-sm md:text-base font-bold">{day}</span>
                  {hasData && !isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: STUDENT LIST FOR SELECTED DATE */}
        <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users size={24} className="text-indigo-400" />
              {selectedDate === today.toISOString().split('T')[0] ? 'Present Today' : `Present on ${selectedDate.split('-')[2]} ${monthName}`}
            </h2>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {currentViewList.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No students for this date</p>
            ) : (
              currentViewList.map((student) => (
                <div 
                  key={student._id} 
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all border
                    ${student.status === 'Present' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-white/40'}`}
                >
                  <div>
                    <p className={`font-bold ${student.status === 'Present' ? 'text-emerald-50' : 'text-slate-400'}`}>
                      {student.name}
                    </p>
                    <p className="text-xs opacity-60">Roll: {student.rollNo}</p>
                  </div>
                  {student.status === 'Present' ? (
                    <div className="bg-emerald-500 text-slate-900 p-1 rounded-full">
                      <CheckCircle2 size={18} />
                    </div>
                  ) : (
                    <XCircle size={20} className="text-white/10" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;