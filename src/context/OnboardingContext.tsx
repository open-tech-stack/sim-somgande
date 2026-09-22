/**
 * Gère l'affichage du Welcome.
 *
 * - null  : la valeur n'est pas encore chargée.
 * - false : le Welcome doit être affiché.
 * - true  : le Welcome a déjà été vu.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { welcomeStorage } from '@/services/storage.service';

interface OnboardingContextValue {
  welcomeSeen: boolean | null;
  markWelcomeSeen: () => void;
  resetWelcome: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadWelcomeState = async () => {
      try {
        const seen = await welcomeStorage.get();

        if (mounted) {
          setWelcomeSeen(seen);
        }
      } catch {
        // En cas d'erreur, on affiche le Welcome par sécurité.
        if (mounted) {
          setWelcomeSeen(false);
        }
      }
    };

    void loadWelcomeState();

    return () => {
      mounted = false;
    };
  }, []);

  const markWelcomeSeen = useCallback(() => {
    // Mise à jour immédiate de l'état local.
    setWelcomeSeen(true);

    // Sauvegarde persistante en arrière-plan.
    void welcomeStorage.setSeen();
  }, []);

  const resetWelcome = useCallback(() => {
    // Utile pendant les tests.
    setWelcomeSeen(false);

    void welcomeStorage.reset();
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      welcomeSeen,
      markWelcomeSeen,
      resetWelcome,
    }),
    [welcomeSeen, markWelcomeSeen, resetWelcome],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error(
      'useOnboarding doit être utilisé dans <OnboardingProvider>',
    );
  }

  return context;
}