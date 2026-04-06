import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import ParentDashboard from "./components/ParentDashboard";
import StudentDashboard from "./components/StudentDashboard";
import SplashScreen from "./components/SplashScreen";

// ✅ सही import
import { motion, AnimatePresence } from "framer-motion";

import { LogIn, Loader2, GraduationCap, Users } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<"Student" | "Parent" | null>(null);

  // ✅ Splash fix (auto close)
  useEffect(() => {
    setTimeout(() => setShowSplash(false), 2000);
  }, []);

  // ✅ Firebase safe handling
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const profileRef = doc(db, "profiles", user.uid);

      const unsubProfile = onSnapshot(
        profileRef,
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data());
            setView("Student");
          } else {
            setView("Parent");
          }
          setLoading(false);
        },
        (error) => {
          console.error("Firestore error:", error);
          setLoading(false);
        }
      );

      return () => unsubProfile();
    });

    return () => unsubscribe();
  }, []);

  // ✅ Splash screen
  if (showSplash) {
    return <SplashScreen />;
  }

  // ✅ Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  // ✅ Login screen
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={handleLogin}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl"
        >
          Login with Google
        </button>
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Bottom Navigation */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow flex gap-4">
        <button onClick={() => setView("Student")}>
          <GraduationCap />
        </button>
        <button onClick={() => setView("Parent")}>
          <Users />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === "Parent" ? (
          <motion.div key="parent" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ParentDashboard profile={profile} />
          </motion.div>
        ) : view === "Student" && profile ? (
          <motion.div key="student" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StudentDashboard profile={profile} />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <button onClick={() => setView("Parent")}>
              Setup Profile
            </button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
