import React, { createContext, useContext, useState, useEffect } from "react";
import { PublicSettings } from "../types";
import { api } from "../services/api";

interface SettingsContextType {
  settings: PublicSettings;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: PublicSettings = {
  siteTitle: "MONTY GENIUS // SECURE LINK HUB",
  siteSubtitle: "All my digital tools — one secure place.",
  footerText: "Designed with ❤️ by Monty Genius",
  maintenanceMode: false,
  maintenanceMessage: "SYSTEM MAINTENANCE // MONTY GENIUS LINK HUB - Temporarily unavailable.",
  accentColor: "#00F5FF",
  rgbEffects: true,
  cardStyle: "cyber-glass",
  showDescriptions: true,
  showCategories: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSettings = async () => {
    try {
      const data = await api.getPublicSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
