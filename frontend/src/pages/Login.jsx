import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance'; // ✅ Correct path

const Login = ({ setTeacher }) => {
  const [formData, setFormData] = useState({ teacherId: 'ADMIN123', name: 'nikita' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem('teacher');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/teacher/login', formData); // ✅ Use API instance
      
      if (res.data.success) {
        sessionStorage.setItem('teacher', JSON.stringify(res.data.teacher));
        setTeacher(res.data.teacher);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-indigo-600 p-10 text-center">
          <div className="inline-flex p-3 bg-white/20 rounded-2xl mb-4">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Teacher Portal</h2>
          <p className="text-indigo-100 text-sm mt-1">Facial Attendance System Login</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Teacher ID</label>
              <input
                type="text"
                placeholder="Enter Teacher ID"
                value={formData.teacherId}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Authorized Name</label>
              <input
                type="text"
                placeholder="Enter Name"
                value={formData.name}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-[0.98] transition-all disabled:bg-indigo-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Secure Access Only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;