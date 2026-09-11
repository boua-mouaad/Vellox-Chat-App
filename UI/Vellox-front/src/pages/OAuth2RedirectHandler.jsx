import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthToken } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setAuthToken(token)
        .then(() => {
          navigate('/chat', { replace: true });
        })
        .catch((err) => {
          console.error("OAuth token verification failed", err);
          navigate('/auth', { replace: true });
        });
    } else {
      navigate('/auth', { replace: true });
    }
  }, [searchParams, setAuthToken, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0B0F19] text-cyan-400">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
        <p className="text-sm font-medium text-slate-400">Authenticating with provider...</p>
      </div>
    </div>
  );
}
