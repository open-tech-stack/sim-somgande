// src/context/AlertContext.tsx
/**
 * Contexte d'alerte global.
 * Permet d'afficher un modal d'alerte depuis n'importe quel écran :
 *
 *   const { showAlert } = useAlert();
 *   showAlert({ title: 'Erreur', message: 'Code invalide', kind: 'error' });
 */

import AlertModal, { AlertConfig } from '@/components/ui/AlertModal';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';


interface AlertContextValue {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((next: AlertConfig) => {
    setConfig(next);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
  }, []);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setConfig(null), 200);
  }, []);

  const value = useMemo(
    () => ({ showAlert, hideAlert }),
    [showAlert, hideAlert],
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertModal
        visible={visible}
        config={config}
        onDismiss={handleDismiss}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert doit être utilisé dans <AlertProvider>');
  return ctx;
}