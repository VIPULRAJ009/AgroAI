import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, ScanLine } from "lucide-react";

interface LoadingScreenProps {
    isLoading: boolean;
}

const LoadingScreen = ({ isLoading }: LoadingScreenProps) => {
    const [textIndex, setTextIndex] = useState(0);

    const loadingTexts = [
        "Initializing AI...",
        "Analyzing Soil parameters...",
        "Processing Environmental Data...",
        "Fetching Recommendations..."
    ];

    useEffect(() => {
        if (!isLoading) return;

        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % loadingTexts.length);
        }, 2000); // Change text every 2 seconds

        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md"
                >
                    {/* Main Visual Container */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-8">

                        {/* Rotating Rings (Sci-Fi Effect) */}
                        <motion.div
                            className="absolute inset-0 border-2 border-green-500/20 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                        <motion.div
                            className="absolute inset-4 border border-cyan-500/20 rounded-full"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        />

                        {/* Glowing Plant Icon */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                            className="relative z-10 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                        >
                            <Sprout size={80} strokeWidth={1.5} />
                        </motion.div>

                        {/* Scanner Line */}
                        <motion.div
                            className="absolute left-0 right-0 h-1 bg-cyan-400/80 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-20"
                            initial={{ top: "0%", opacity: 0 }}
                            animate={{
                                top: ["10%", "90%", "10%"],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                width: "100%",
                                background: "linear-gradient(90deg, transparent 0%, rgba(34,211,238,1) 50%, transparent 100%)"
                            }}
                        />

                        {/* Scanning Grid Background (Subtle) */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.05)_1px,transparent_1px)] bg-[size:20px_20px] rounded-full overflow-hidden mask-image-radial-gradient" />
                    </div>

                    {/* Dynamic Loading Text */}
                    <div className="h-8 relative overflow-hidden flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={textIndex}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-cyan-400 font-mono text-lg tracking-wider"
                            >
                                {loadingTexts[textIndex]}
                                <motion.span
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                >
                                    _
                                </motion.span>
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* Loading Bar at Bottom */}
                    <div className="w-64 h-1 bg-slate-800 mt-6 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-cyan-400"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                                duration: 2, // Approximate time per step
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
