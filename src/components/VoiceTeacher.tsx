import React, { useState, useEffect } from "react";
import { StudyTask, StudentProfile } from "../types";
import { getLessonContent, getStoryModeLesson, evaluateAnswer } from "../services/geminiService";
import { voiceService } from "../services/voiceService";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Play, CheckCircle, ArrowRight, BookOpen, Sparkles, X, RotateCcw, Loader2 } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

export default function VoiceTeacher({ task, profile, onClose }: { task: StudyTask, profile: StudentProfile, onClose: () => void }) {
  const [step, setStep] = useState<"intro" | "explaining" | "questioning" | "finished">("intro");
  const [lesson, setLesson] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startLesson = async () => {
    setLoading(true);
    try {
      let data;
      if (task.mode === "StoryMode") {
        data = await getStoryModeLesson(task.topic, task.subject, profile.class, profile.name, profile.personality);
      } else {
        data = await getLessonContent(task.topic, task.subject, profile.class, profile.personality);
      }
      setLesson(data);
      setStep("explaining");
      await voiceService.speak(data.explanation);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!studentAnswer) return;
    setLoading(true);
    try {
      const result = await evaluateAnswer(lesson.questions[currentQuestionIndex].question, studentAnswer, profile.personality);
      setFeedback(result.feedback);
      await voiceService.speak(result.feedback);

      if (result.isCorrect) {
        if (currentQuestionIndex < lesson.questions.length - 1) {
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
            setStudentAnswer("");
            setFeedback(null);
          }, 3000);
        } else {
          finishLesson();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const finishLesson = async () => {
    setStep("finished");
    const points = 50;
    const xp = 100;
    
    await voiceService.speak(`Shabaash ${profile.name}! Aapne ye topic complete kar liya hai. Aapko ${points} points mile hain!`);
    
    const profileRef = doc(db, "profiles", profile.uid);
    await updateDoc(profileRef, {
      points: increment(points),
      xp: increment(xp),
      level: Math.floor((profile.xp + xp) / 1000) + 1,
      streak: increment(1),
      lastStudyDate: new Date().toISOString().split("T")[0]
    });

    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, { status: "Completed" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-indigo-900/95 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl overflow-hidden relative border-8 border-white/20">
        <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all">
          <X className="w-6 h-6" />
        </button>

        <div className="p-12 text-center">
          {step === "intro" && (
            <div className="space-y-8">
              <div className="w-24 h-24 bg-indigo-gradient text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl bouncy">
                <BookOpen className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-black text-slate-900">Chalo Padhte Hain!</h2>
              <p className="text-xl font-bold text-slate-500">Topic: <span className="text-indigo-600">{task.topic}</span></p>
              <button onClick={startLesson} disabled={loading} className="w-full bg-indigo-gradient text-white font-black py-6 rounded-3xl text-2xl shadow-2xl shadow-indigo-200">
                {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : "Start Lesson 🚀"}
              </button>
            </div>
          )}

          {step === "explaining" && (
            <div className="space-y-8">
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-20" />
                <div className="relative w-48 h-48 bg-indigo-100 rounded-full flex items-center justify-center border-8 border-white shadow-inner">
                  <Sparkles className="w-24 h-24 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">AI Teacher samjha rahi hai...</h3>
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 max-h-48 overflow-y-auto text-left">
                <p className="font-bold text-slate-600 leading-relaxed">{lesson?.explanation}</p>
              </div>
              <button onClick={() => setStep("questioning")} className="w-full bg-indigo-gradient text-white font-black py-5 rounded-3xl text-xl">
                Samajh aa gaya! Sawal puchiye 🙋‍♂️
              </button>
            </div>
          )}

          {step === "questioning" && (
            <div className="space-y-8">
              <div className="bg-amber-50 p-6 rounded-3xl border-4 border-amber-100">
                <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Question {currentQuestionIndex + 1}</span>
                <p className="text-2xl font-black text-slate-900 mt-2">{lesson?.questions[currentQuestionIndex].question}</p>
              </div>

              <div className="relative">
                <textarea
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Apna jawab yahan likhein ya mic use karein..."
                  className="w-full p-6 bg-slate-50 border-4 border-slate-100 rounded-3xl font-bold text-lg outline-none focus:border-indigo-300 h-32"
                />
                <button
                  onClick={async () => {
                    setIsListening(true);
                    const text = await voiceService.listen();
                    setStudentAnswer(text);
                    setIsListening(false);
                  }}
                  className={`absolute bottom-4 right-4 p-4 rounded-2xl shadow-lg transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-indigo-600"}`}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>

              {feedback && (
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 text-indigo-700 font-bold">
                  {feedback}
                </motion.div>
              )}

              <button onClick={handleAnswer} disabled={loading || !studentAnswer} className="w-full bg-indigo-gradient text-white font-black py-5 rounded-3xl text-xl flex items-center justify-center gap-3">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle className="w-6 h-6" /> Submit Answer</>}
              </button>
            </div>
          )}

          {step === "finished" && (
            <div className="space-y-8">
              <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle className="w-20 h-20" />
              </div>
              <h2 className="text-4xl font-black text-slate-900">Shabaash! 🏆</h2>
              <p className="text-xl font-bold text-slate-500">Aapne "{task.topic}" topic successfully complete kar liya hai.</p>
              <div className="flex gap-4 p-6 bg-indigo-50 rounded-3xl">
                <div className="flex-1 text-center">
                  <p className="text-xs font-black text-indigo-400 uppercase">Points Earned</p>
                  <p className="text-3xl font-black text-indigo-700">+50</p>
                </div>
                <div className="w-px bg-indigo-200" />
                <div className="flex-1 text-center">
                  <p className="text-xs font-black text-indigo-400 uppercase">XP Gained</p>
                  <p className="text-3xl font-black text-indigo-700">+100</p>
                </div>
              </div>
              <button onClick={onClose} className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl text-xl">
                Dashboard par wapas chalein
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
