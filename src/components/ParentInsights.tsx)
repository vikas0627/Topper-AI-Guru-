import React, { useEffect, useState } from "react";
import { StudentProfile } from "../types";
import { getParentReport } from "../services/geminiService";
import { Brain, Lightbulb, Heart, Sparkles } from "lucide-react";

export default function ParentInsights({ profile }: { profile: StudentProfile }) {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    getParentReport(profile.name, profile.class, profile.points, profile.level, profile.streak, profile.weakTopics)
      .then(setReport);
  }, [profile]);

  return (
    <div className="space-y-8">
      <div className="bg-indigo-gradient p-8 rounded-[40px] text-white shadow-xl">
        <h2 className="text-2xl font-black mb-4 flex items-center gap-3"><Brain /> AI Report</h2>
        <p className="font-bold">{report?.summary}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border-4 border-orange-50 shadow-xl">
          <h3 className="font-black mb-4 flex items-center gap-2"><Lightbulb className="text-orange-500" /> Advice</h3>
          <p className="text-slate-600 font-bold">{report?.advice}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border-4 border-purple-50 shadow-xl">
          <h3 className="font-black mb-4 flex items-center gap-2"><Heart className="text-purple-500" /> Motivation</h3>
          <p className="text-slate-600 font-bold italic">"{report?.motivation}"</p>
        </div>
      </div>
    </div>
  );
}
