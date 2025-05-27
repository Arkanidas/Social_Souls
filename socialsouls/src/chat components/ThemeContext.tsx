import React, { useEffect, useState, createContext, useContext } from 'react';
type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};
const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {}
});
export const ThemeProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const savedTheme = localStorage.getItem('spectralTheme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('spectralTheme', newTheme ? 'dark' : 'light');
  };
  return <ThemeContext.Provider value={{
    isDark,
    toggleTheme
  }}>
      {children}
    </ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);