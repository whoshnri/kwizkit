"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useKindeBrowserClient, KindeIdToken } from "@kinde-oss/kinde-auth-nextjs";

type SessionContextType = {
  session: KindeIdToken | null;
  loading: boolean;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { getIdToken } = useKindeBrowserClient();
  const [session, setSession] = useState<KindeIdToken | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      try {
        const token = await getIdToken();
        if (mounted) setSession(token ?? null);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSession();
    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return context;
};
