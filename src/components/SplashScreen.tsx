import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800);
    }, 3500);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
          <h1 className="text-6xl font-black text-[#FFD700] drop-shadow-lg">Topper AI Guru 🏆</h1>
          <p className="text-white mt-4 tracking-widest">Padho Smart, Bano Topper 🚀</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
