// pages/OAuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isProcessing) return;
    const processCallback = async () => {
      setIsProcessing(true);
      // Get parameters from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const provider = sessionStorage.getItem('oauth_provider') as 'microsoft' | 'google';

      // Validate parameters
      if (!code) {
        setError('Missing authorization code');
        return;
      }

      if (!state) {
        setError('Missing state parameter');
        return;
      }

      if (!provider) {
        setError('Missing provider information');
        return;
      }

      // Complete OAuth flow
      const result = await handleOAuthCallback(provider, code, state);

      if (result.success) {
        // Redirect to dashboard on success
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Authentication failed');
      }
    };

    processCallback();
  }, [searchParams, handleOAuthCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">
          Completing authentication...
        </h2>
        <p className="text-gray-600 mt-2">Please wait</p>
      </div>
    </div>
  );
};