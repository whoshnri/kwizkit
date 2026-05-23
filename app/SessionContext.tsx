"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { User } from "@/lib/generated/prisma/client";
import type { Question } from "@/app/dashboard/hooks/useTestMaker";
import type { AiImportMode } from "@/app/dashboard/lib/aiModal";

type GeneratedContentPayload = {
  questions: Question[];
  importMode: AiImportMode;
} | null;

type SessionContextType = {
  session: User | null;
  loading: boolean;
  onboardingRequired: boolean;
  generatedContent: GeneratedContentPayload;
  updateGeneratedContent: (newContent: GeneratedContentPayload) => void;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);



export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentPayload>(null);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json();

      const account = data?.account ?? null;
      setSession(account);
      setOnboardingRequired(Boolean(data?.onboardingRequired));
    } catch (error) {
      console.error("Error fetching session:", error);
      setSession(null);
      setOnboardingRequired(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  function updateGeneratedContent(newContent: GeneratedContentPayload) {
    setGeneratedContent(newContent);
  }

  const value = useMemo(
    () => ({
      session,
      loading,
      onboardingRequired,
      generatedContent,
      updateGeneratedContent,
      refreshSession,
    }),
    [session, loading, onboardingRequired, generatedContent, refreshSession]
  );


  return (
    <SessionContext.Provider value={value}>
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
