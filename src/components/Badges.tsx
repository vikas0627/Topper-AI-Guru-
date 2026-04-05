import React from "react";
import { motion } from "motion/react";
import { Star, Award, Zap } from "lucide-react";

export default function Badges({ badges }: { badges: string[] }) {
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-indigo-50">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3"><Award className="text-indigo-600" /> My Badges</h2>
      <div className="grid grid-cols-3 gap-4">
        {badges.map(b => (
          <div key={b} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl">
            <Star className="text-amber-500 mb-2" />
            <span className="text-[10px] font-black uppercase text-center">{b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
