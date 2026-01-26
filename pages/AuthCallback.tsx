import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Completing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for OAuth tokens in the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Session error:', error);
            setStatus('Authentication failed. Redirecting...');
          } else {
            setStatus('Success! Redirecting...');
          }
        } else {
          // No tokens in URL, check if we have an existing session
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Auth error:', error);
            setStatus('Authentication failed. Redirecting...');
          } else if (data.session) {
            setStatus('Success! Redirecting...');
          }
        }

        // Redirect to home after processing
        setTimeout(() => {
          navigate('/');
        }, 500);
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('Something went wrong. Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-urbane-mist">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-urbane-gold mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;

