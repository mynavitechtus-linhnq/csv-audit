import * as React from "react";
import { Language } from "./i18n";

export const LanguageContext = React.createContext<Language>("en");

export const LanguageProvider = ({
  value,
  children,
}: {
  value: Language;
  children: React.ReactNode;
}) => (
  <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
);

export const useLanguage = () => React.useContext(LanguageContext);
