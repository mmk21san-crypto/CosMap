import React, { createContext, useContext, useMemo, useState } from 'react';

type CosMapContextValue = {
  attendedIds: Set<number>;
  toggleAttend: (eventId: number) => void;
  appPhase: 'splash' | 'onboarding' | 'auth' | 'profile-setup' | 'main';
  finishSplash: () => void;
  finishOnboarding: () => void;
  continueWithProvider: () => void;
  completeProfileSetup: () => void;
  logout: () => void;
};

const CosMapContext = createContext<CosMapContextValue | null>(null);

export function CosMapProvider({ children }: { children: React.ReactNode }) {
  const [attendedIds, setAttendedIds] = useState<Set<number>>(new Set([1]));
  const [appPhase, setAppPhase] = useState<'splash' | 'onboarding' | 'auth' | 'profile-setup' | 'main'>('splash');

  const value = useMemo(
    () => ({
      attendedIds,
      appPhase,
      toggleAttend: (eventId: number) => {
        setAttendedIds((prev) => {
          const next = new Set(prev);
          if (next.has(eventId)) {
            next.delete(eventId);
          } else {
            next.add(eventId);
          }
          return next;
        });
      },
      finishSplash: () => {
        setAppPhase('onboarding');
      },
      finishOnboarding: () => {
        setAppPhase('auth');
      },
      continueWithProvider: () => {
        setAppPhase('profile-setup');
      },
      completeProfileSetup: () => {
        setAppPhase('main');
      },
      logout: () => {
        setAttendedIds(new Set([1]));
        setAppPhase('auth');
      },
    }),
    [appPhase, attendedIds],
  );

  return <CosMapContext.Provider value={value}>{children}</CosMapContext.Provider>;
}

export function useCosMap() {
  const ctx = useContext(CosMapContext);
  if (!ctx) {
    throw new Error('useCosMap must be used within CosMapProvider');
  }
  return ctx;
}
