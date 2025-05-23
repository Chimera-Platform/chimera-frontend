import { useState, useEffect } from 'react';
import { checkReplicateApiKeyStatus, setReplicateApiKey } from '@/services/imageService';
import { toast } from 'sonner';

export function useReplicateApiKey() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check API key status on component mount
  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  // Function to check API key status
  const checkApiKeyStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { hasKey } = await checkReplicateApiKeyStatus();
      setHasApiKey(hasKey);
    } catch (error) {
      console.error('Error checking API key status:', error);
      setError(error);
      // Only show toast for specific errors, not for auth issues
      if (error.message !== 'Authentication token not found') {
        toast.error('Failed to check API key status');
      }
      setHasApiKey(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update API key
  const updateApiKey = async (newKey) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await setReplicateApiKey(newKey);
      setHasApiKey(true);
      toast.success('API key updated successfully');
      return true;
    } catch (error) {
      console.error('Error setting API key:', error);
      setError(error);
      toast.error(error.message || 'Failed to update API key');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hasApiKey,
    isLoading,
    error,
    checkApiKeyStatus,
    updateApiKey,
  };
}
