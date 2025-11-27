
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Lock, Mountain } from 'lucide-react';
// @ts-ignore
import heroImage from '../lib/hero-image.png';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminBackgroundImage } = useApp();
  const { signIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await signIn(email.trim(), password);
      
      if (error) {
        setError(error.message || 'Invalid credentials. Please check your email and password.');
        setPassword('');
        setLoading(false);
      } else {
        // Wait a moment for auth state to update, then check admin status
        setTimeout(() => {
          if (isAdmin) {
            navigate('/admin');
          } else {
            setError('Access denied. This account does not have admin privileges. Please contact your administrator.');
            setPassword('');
          }
          setLoading(false);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
      setPassword('');
      setLoading(false);
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
              <label className="text-xs font-bold text-white uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded text-gray-900 placeholder-gray-500 focus:border-urbane-gold focus:ring-2 focus:ring-urbane-gold outline-none transition-all"
                placeholder="your-email@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded text-gray-900 placeholder-gray-500 focus:border-urbane-gold focus:ring-2 focus:ring-urbane-gold outline-none transition-all"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-urbane-gold text-urbane-darkGreen font-bold py-4 rounded uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock size={16} className="mr-2" /> 
              {loading ? 'Signing in...' : 'Login Securely'}
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
