
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, Mountain } from 'lucide-react';
// @ts-ignore
import heroImage from '../lib/hero-image.png';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin, adminBackgroundImage } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean inputs to prevent whitespace errors
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanUser === 'admin' && cleanPass === 'admin') {
      loginAdmin();
      navigate('/admin');
    } else {
      setError('Invalid credentials. Try username: admin, password: admin');
      // Clear password on failure for security/ux
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-urbane-darkGreen relative overflow-hidden">
      {/* Background decorative elements */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${adminBackgroundImage})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-urbane-darkGreen via-urbane-darkGreen/80 to-transparent"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-urbane-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
               <Mountain className="text-urbane-darkGreen h-8 w-8" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-300 text-sm tracking-wide uppercase">Urbane Haauz Control Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded text-sm text-center font-bold">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-widest">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded text-gray-900 placeholder-gray-500 focus:border-urbane-gold focus:ring-2 focus:ring-urbane-gold outline-none transition-all"
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded text-gray-900 placeholder-gray-500 focus:border-urbane-gold focus:ring-2 focus:ring-urbane-gold outline-none transition-all"
                placeholder="admin"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-urbane-gold text-urbane-darkGreen font-bold py-4 rounded uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center justify-center shadow-lg"
            >
              <Lock size={16} className="mr-2" /> Login Securely
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-white/40">Restricted access for authorized personnel only.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;