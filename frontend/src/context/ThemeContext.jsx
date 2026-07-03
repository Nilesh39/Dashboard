import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    backgroundColor: "#000000",
    primaryColor: "#E1306C",
    secondaryColor: "#F56040",
    accentColor: "#FCAF45",
    purpleColor: "#833AB4",
    blueColor: "#405DE6",
    textColor: "#FFFFFF",
    cardStyle: "glassmorphism", // glassmorphism, neon, border, solid
    fontFamily: "Inter", // Inter, Roboto, Outfit, Poppins
  });

  const applyTheme = (themeSettings) => {
    if (!themeSettings) return;
    
    setTheme(prev => ({ ...prev, ...themeSettings }));

    const root = document.documentElement;
    root.style.setProperty('--color-bg', themeSettings.backgroundColor || '#000000');
    root.style.setProperty('--color-primary', themeSettings.primaryColor || '#E1306C');
    root.style.setProperty('--color-secondary', themeSettings.secondaryColor || '#F56040');
    root.style.setProperty('--color-accent', themeSettings.accentColor || '#FCAF45');
    root.style.setProperty('--color-purple', themeSettings.purpleColor || '#833AB4');
    root.style.setProperty('--color-blue', themeSettings.blueColor || '#405DE6');
    root.style.setProperty('--color-text', themeSettings.textColor || '#FFFFFF');
    root.style.setProperty('--font-family', themeSettings.fontFamily || 'Inter');
    
    // Apply body font
    document.body.style.fontFamily = `'${themeSettings.fontFamily || 'Inter'}', sans-serif`;
    
    // Apply body background
    document.body.style.backgroundColor = themeSettings.backgroundColor || '#000000';
  };

  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Returns the exact CSS class corresponding to the active card style.
  const getCardClass = () => {
    switch (theme.cardStyle) {
      case 'neon':
        return 'card-neon';
      case 'border':
        return 'card-border';
      case 'solid':
        return 'card-solid';
      case 'glassmorphism':
      default:
        return 'card-glassmorphism';
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme, getCardClass }}>
      {children}
    </ThemeContext.Provider>
  );
};
