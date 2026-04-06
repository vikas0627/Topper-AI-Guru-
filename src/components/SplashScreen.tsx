import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ सही import

type Props = {
  onComplete?: () => void; // ✅ optional बनाया
};

export default function SplashScreen({ onComplete }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setIsVisible(false);

      const timer2 = setTimeout(() => {
        if (onComplete) onComplete(); // ✅ safe call
      }, 500);

      return () => clearTimeout(timer2);
    }, 2000); // ✅ 2 sec enough

    return () => clearTimeout(timer1);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
        >
          <h1 className="text-5xl font-black text-yellow-400">
            Topper AI Guru 🏆
          </h1>
          <p className="text-white mt-4">
            Padho Smart, Bano Topper 🚀
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
