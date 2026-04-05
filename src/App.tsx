import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import SplashScreen from "./components/SplashScreen";
import StudentDashboard from "./components/StudentDashboard";
import ParentDashboard from "./components/ParentDashboard";
import { StudentProfile, UserRole } from "./types";
import { Sparkles, GraduationCap, Users } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profileDoc = await getDoc(doc(db, "profiles", currentUser.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data() as StudentProfile;
          setProfile(data);
          setRole("Student");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[50px] shadow-2xl border-8 border-white">
          <div className="w-24 h-24 bg-indigo-gradient text-white rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100 bouncy">
            <Sparkles className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Topper AI Guru 🏆</h1>
          <p className="text-slate-500 font-bold text-lg mb-12 leading-relaxed">Padho Smart, Bano Topper 🚀 Aapka personal AI teacher jo aapko har din kuch naya sikhayega!</p>
          <button onClick={handleLogin} className="w-full bg-indigo-gradient text-white font-black py-6 rounded-3xl shadow-2xl shadow-indigo-200 transition-all text-xl">Login with Google</button>
        </div>
      </div>
    );
  }

  return role === "Student" && profile ? <StudentDashboard profile={profile} /> : <ParentDashboard user={user} onProfileCreated={() => window.location.reload()} />;
}
