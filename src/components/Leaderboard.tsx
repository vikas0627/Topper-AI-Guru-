import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { StudentProfile } from "../types";
import { motion } from "motion/react";
import { Trophy, Medal, User } from "lucide-react";

export default function Leaderboard({ currentUserId }: { currentUserId: string }) {
  const [topStudents, setTopStudents] = useState<StudentProfile[]>([]);

  useEffect(() => {
    const q = query(collection(db, "profiles"), orderBy("points", "desc"), limit(10));
    return onSnapshot(q, (s) => setTopStudents(s.docs.map(d => d.data() as StudentProfile)));
  }, []);

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-indigo-50">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><Trophy className="text-amber-500" /> Leaderboard</h2>
      {topStudents.map((s, i) => (
        <div key={s.uid} className={`flex justify-between p-4 mb-2 rounded-2xl ${s.uid === currentUserId ? "bg-indigo-50" : ""}`}>
          <span>#{i+1} {s.name}</span>
          <span className="font-black text-indigo-600">{s.points} pts</span>
        </div>
      ))}
    </div>
  );
}
