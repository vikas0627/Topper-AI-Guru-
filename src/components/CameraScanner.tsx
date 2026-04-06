import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, X, RefreshCcw, Check, Loader2, Sparkles, BookOpen, FileText } from "lucide-react";
import { analyzeImage, solveHomework } from "../services/geminiService";

interface CameraScannerProps {
  onClose: () => void;
  onResult: (result: any, type: string) => void;
  studentName: string;
}

export default function CameraScanner({ onClose, onResult, studentName }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanType, setScanType] = useState<"book" | "homework">("book");

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Camera access denied. Please enable it in settings.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    setIsAnalyzing(true);
    try {
      const base64Data = capturedImage.split(",")[1];
      let result;
      
      if (scanType === "homework") {
        result = await solveHomework(base64Data, "image/jpeg");
      } else {
        const prompt = `Analyze this book page for ${studentName}. Summarize the main topics and explain them simply in Hindi (Hinglish).`;
        result = await analyzeImage(base64Data, "image/jpeg", prompt);
      }
      
      onResult(result, scanType);
    } catch (error) {
      console.error(error);
      alert("AI analysis failed. Please try again with a clearer photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-md flex justify-between items-center mb-6 px-4">
        <h2 className="text-white text-2xl font-black flex items-center gap-2">
          <Camera className="w-8 h-8 text-indigo-400" /> AI Scanner
        </h2>
        <button onClick={onClose} className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-full max-w-md aspect-[3/4] bg-slate-900 rounded-[40px] overflow-hidden border-4 border-white/20 shadow-2xl">
        {!capturedImage ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-white/50 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-xl" />
              </div>
            </div>
          </>
        ) : (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-indigo-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin mb-6 text-indigo-300" />
            <h3 className="text-2xl font-black mb-2">AI Analyzing...</h3>
            <p className="font-bold text-indigo-100">Ma'am/Sir, main aapka kaam check kar rahi hoon. Bas ek minute!</p>
            <motion.div 
              initial={{ y: 0 }} 
              animate={{ y: [0, 200, 0] }} 
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.8)]"
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-md mt-8 space-y-6">
        {!capturedImage ? (
          <>
            <div className="flex gap-4 p-2 bg-white/10 rounded-3xl">
              <button 
                onClick={() => setScanType("book")}
                className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${scanType === "book" ? "bg-white text-indigo-600" : "text-white hover:bg-white/5"}`}
              >
                <BookOpen className="w-5 h-5" /> Book Page
              </button>
              <button 
                onClick={() => setScanType("homework")}
                className={`flex-1 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${scanType === "homework" ? "bg-white text-indigo-600" : "text-white hover:bg-white/5"}`}
              >
                <FileText className="w-5 h-5" /> Homework
              </button>
            </div>
            <button 
              onClick={capturePhoto}
              className="w-full h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all active:scale-95"
            >
              <div className="w-16 h-16 border-4 border-slate-900 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full" />
              </div>
            </button>
          </>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={() => { setCapturedImage(null); startCamera(); }}
              className="flex-1 bg-white/10 text-white font-black py-5 rounded-3xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
            >
              <RefreshCcw className="w-6 h-6" /> Retake
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex-[2] bg-indigo-gradient text-white font-black py-5 rounded-3xl flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all"
            >
              <Sparkles className="w-6 h-6" /> Analyze with AI
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
