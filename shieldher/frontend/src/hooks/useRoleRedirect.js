import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useRoleRedirect = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'user') {
        navigate('/user');
      } else if (currentUser.role === 'guardian') {
        navigate('/guardian');
      }
    }
  }, [currentUser, navigate]);
};
