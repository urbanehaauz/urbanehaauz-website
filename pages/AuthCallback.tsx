import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          navigate('/#/');
          return;
        }

        if (data.session) {
          // Successful authentication, redirect to home
          navigate('/#/');
        } else {
          navigate('/#/');
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/#/');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-urbane-mist">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-urbane-gold mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

