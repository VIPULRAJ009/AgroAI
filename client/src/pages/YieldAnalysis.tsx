import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, Loader2, ArrowLeft, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import AgriculturalBackground from "@/components/AgriculturalBackground";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const YieldAnalysis = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    // Use 'any' for now since we're just displaying it, but ideally interface 
    const [cropName, setCropName] = useState("");
    const [stats, setStats] = useState<{ leadingState: string; maxProduction: number; avgYield: number; maxYear: number } | null>(null);

    const calculateStatsAndForecast = (rawData: any[]) => {
        if (!rawData.length) return [];

        // 1. Calculate Stats
        let maxProd = 0;
        let leadingState = "N/A";
        let maxYear = 0;
        let totalProd = 0;

        rawData.forEach(item => {
            if (item.production > maxProd) {
                maxProd = item.production;
                leadingState = item.state;
                maxYear = item.year;
            }
            totalProd += item.production;
        });

        const avgYield = totalProd / rawData.length;
        setStats({ leadingState, maxProduction: maxProd, avgYield, maxYear });

        // 2. Forecasting till 2025
        // Simple Linear Regression (y = mx + c)
        const n = rawData.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        rawData.forEach(item => {
            sumX += item.year;
            sumY += item.production;
            sumXY += (item.year * item.production);
            sumXX += (item.year * item.year);
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const lastYear = rawData[rawData.length - 1].year;
        const forecastData = [...rawData];

        for (let year = lastYear + 1; year <= 2025; year++) {
            const predictedProd = slope * year + intercept;
            forecastData.push({
                year,
                production: predictedProd > 0 ? predictedProd : 0,
                state: "Forecasted",
                isForecast: true
            });
        }

        return forecastData;
    };

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setData([]);
        setStats(null);
        setCropName("");

        try {
            const apiUrl = import.meta.env.VITE_PRODUCTION_API_URL;
            const response = await axios.get(`${apiUrl}?crop=${searchQuery}`);

            // Expected structure: { crop: "Wheat", prediction: [{ production, state, year }, ...] }
            if (response.data && response.data.prediction) {
                // Sort by year just in case
                const sortedData = response.data.prediction.sort((a: any, b: any) => a.year - b.year);
                const processedData = calculateStatsAndForecast(sortedData);
                setData(processedData);
                setCropName(response.data.crop || searchQuery);
            } else {
                toast.error("No production data found for this crop.");
            }
        } catch (error) {
            console.error("Error fetching yield data:", error);
            toast.error("Failed to fetch yield data. Please try another crop.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative font-sans flex flex-col">
            <AgriculturalBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <Link to="/dashboard">
                            <Button variant="ghost" className="hover:bg-white/20 hover:text-white text-slate-100 mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md mb-2">Yield Analysis</h1>
                        <p className="text-slate-100 text-lg opacity-90">Verify historical production trends and forecast yields.</p>
                    </motion.div>

                    <Card className="mb-8 bg-white/90 backdrop-blur-xl border-none shadow-xl p-6 rounded-3xl">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    placeholder="Enter crop name (e.g., Wheat, Rice)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                    className="pl-10 h-12 text-lg bg-white border-slate-200 focus-visible:ring-green-500"
                                />
                            </div>
                            <Button
                                onClick={() => handleSearch()}
                                disabled={loading}
                                className="h-12 px-8 text-lg bg-green-600 hover:bg-green-700 shadow-md"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : <TrendingUp className="mr-2" />}
                                Analyze Trends
                            </Button>
                        </div>
                    </Card>

                    {data.length > 0 && stats && (
                        <div className="space-y-6">
                            {/* Highlights Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-100 shadow-lg p-6 rounded-2xl">
                                        <h3 className="text-amber-800 text-sm font-bold uppercase tracking-wider mb-2">Leading State</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-extrabold text-amber-900">{stats.leadingState}</p>
                                                <p className="text-xs text-amber-700">Highest recorded production</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-cyan-100 shadow-lg p-6 rounded-2xl">
                                        <h3 className="text-cyan-800 text-sm font-bold uppercase tracking-wider mb-2">Peak Production</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-cyan-100 text-cyan-600 rounded-full">
                                                <BarChart3 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-extrabold text-cyan-900">{(stats.maxProduction / 1000).toFixed(1)}k</p>
                                                <p className="text-xs text-cyan-700">Tonnes in {stats.maxYear}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100 shadow-lg p-6 rounded-2xl">
                                        <h3 className="text-emerald-800 text-sm font-bold uppercase tracking-wider mb-2">Avg. Annual Yield</h3>
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-extrabold text-emerald-900">{(stats.avgYield / 1000).toFixed(1)}k</p>
                                                <p className="text-xs text-emerald-700">Tonnes / Year</p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Card className="bg-white/90 backdrop-blur-xl border-none shadow-2xl rounded-3xl overflow-hidden">
                                    <CardHeader className="border-b border-slate-100 p-6 md:p-8">
                                        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                            <BarChart3 className="w-6 h-6 text-green-600" />
                                            Production Trends for {cropName} (1997 - 2025 Forecast)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 md:p-8">
                                        <div className="h-[400px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                                        </linearGradient>
                                                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="year" stroke="#64748b" tickMargin={10} />
                                                    <YAxis stroke="#64748b" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        formatter={(value: number, name: string, props: any) => [
                                                            <>
                                                                <span className="font-bold">{value.toLocaleString()} tonnes</span>
                                                                {props.payload.isForecast && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1 rounded">Forecast</span>}
                                                            </>,
                                                            "Production"
                                                        ]}
                                                        labelFormatter={(label) => `Year: ${label}`}
                                                        labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                                        itemStyle={{ color: '#166534' }}
                                                        // Custom rendering to show State
                                                        // Recharts tooltip is tricky to fully customize inline without a custom component,
                                                        // but we can append extra details if we use a custom content function.
                                                        // For simplicity, we stick to the default but adding State line:
                                                        content={({ active, payload, label }) => {
                                                            if (active && payload && payload.length) {
                                                                const dataPoint = payload[0].payload;
                                                                return (
                                                                    <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
                                                                        <p className="font-bold text-slate-800 mb-1">{label}</p>
                                                                        <p className="text-sm text-slate-600 mb-2">
                                                                            State: <span className="font-semibold text-slate-900">{dataPoint.state}</span>
                                                                        </p>
                                                                        <p className={`text-lg font-bold ${dataPoint.isForecast ? 'text-amber-600' : 'text-green-600'}`}>
                                                                            {Number(payload[0].value).toLocaleString()} <span className="text-xs text-slate-500 font-normal">tonnes</span>
                                                                        </p>
                                                                        {dataPoint.isForecast && <p className="text-xs text-amber-600 mt-1 italic">*Projected Value</p>}
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="production"
                                                        stroke="#16a34a"
                                                        strokeWidth={3}
                                                        fillOpacity={1}
                                                        fill="url(#colorProduction)"
                                                        animationDuration={1500}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 text-green-800 text-sm flex gap-2">
                                            <TrendingUp className="w-5 h-5 flex-shrink-0" />
                                            <div>
                                                <strong>Trend Insight: </strong>
                                                Data visualizes historical production up to 2015, with linear forecasting projecting yields through 2025.
                                                The forecast assumes consistent growth/decline based on historical patterns.
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    )}

                    {!loading && data.length === 0 && cropName && (
                        <div className="text-center text-white mt-12 opacity-80">
                            <p>No production data found for "{cropName}". Try a different crop name.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YieldAnalysis;
