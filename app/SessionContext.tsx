"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useKindeBrowserClient, KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { checkAccount } from "./actions/checkAccount";
import { User } from "@prisma/client";
import { Question, Test } from "./dashboard/tests/[test-name]/page";

type SessionContextType = {
  session: User | null;
  loading: boolean;
  generatedContent: Question[] | null;
  updateGeneratedContent: (newContent: Question[] | null) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);



export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useKindeBrowserClient();
  const [session, setSession] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ generatedContent, setGeneratedContent ] = useState<Question[] | null>(null);


  useEffect(() => {
    let active = true;

    const fetchSession = async () => {
      if (!user) {
        if (active) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      try {
        const isAccount = await checkAccount(user.id);
        if (active && isAccount) {
          setSession(isAccount);
        } else if (active && !isAccount) {
          setSession(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        if (active) setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    return () => {
      active = false;
    };
  }, [user?.id]); // only re-run when user identity changes

  function updateGeneratedContent(newContent: Question[] | null) {
    console.log("Updating generated content in context:");
    // store in local storage
    localStorage.setItem("generatedContent", JSON.stringify(newContent));
    setGeneratedContent(newContent);
  }

  const value = useMemo(
    () => ({ session, loading, generatedContent, updateGeneratedContent }),
    [session, loading, generatedContent]
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
