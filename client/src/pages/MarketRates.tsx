import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import AgriculturalBackground from "@/components/AgriculturalBackground";
import MarketRatesViewer from "@/components/MarketRatesViewer";

const MarketRates = () => {
    return (
        <div className="min-h-screen bg-slate-50 relative">
            <AgriculturalBackground />

            <div className="relative z-10">
                <Navbar />

                {/* HERO SECTION */}
                <div className="relative overflow-hidden pb-24 pt-16 container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold text-green-900 tracking-tight mb-4 drop-shadow-sm">
                            Real-Time <span className="text-green-600">Mandi Rates</span>
                        </h1>
                        <p className="text-green-800 text-lg md:text-xl max-w-2xl mx-auto font-light">
                            Empowering farmers with transparent, up-to-date market prices across India.
                        </p>
                    </motion.div>
                </div>

                <main className="container mx-auto px-4 -mt-16 relative z-20 pb-20">
                    <MarketRatesViewer />
                </main>
            </div>
        </div>
    );
};

export default MarketRates;
