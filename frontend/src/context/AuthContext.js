import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    console.log('🔄 Loading auth data from localStorage...');
    console.log('Saved token:', savedToken ? 'Found' : 'Not found');
    console.log('Saved user:', savedUser ? 'Found' : 'Not found');

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('✅ Loaded user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user'); // Remove corrupted data
      }
    }

    setLoading(false);
  }, []);

  // Custom setUser that also saves to localStorage
  const updateUser = (userData) => {
    console.log('💾 Updating user data:', userData);
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  // Custom setToken that also saves to localStorage
  const updateToken = (tokenData) => {
    console.log('🔑 Updating token:', tokenData ? 'Set' : 'Cleared');
    setToken(tokenData);
    if (tokenData) {
      localStorage.setItem('token', tokenData);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Logout function
  const logout = () => {
    console.log('🚪 Logging out user');
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      setToken: updateToken,
      setUser: updateUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
