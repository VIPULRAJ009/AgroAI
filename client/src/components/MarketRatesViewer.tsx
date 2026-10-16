import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Loader2, ArrowUpDown, Filter, Sprout, TrendingUp, Calendar } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface MarketData {
    state: string;
    district: string;
    market: string;
    commodity: string;
    variety: string;
    arrival_date: string;
    min_price: string;
    max_price: string;
    modal_price: string;
}

/* STATIC STATES */
const ALL_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const MarketRatesViewer = () => {
    const [data, setData] = useState<MarketData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stateFilter, setStateFilter] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const toTitleCase = (str: string) =>
        str.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());

    /* --------------------------------------------------
       FETCH DATA
    ---------------------------------------------------*/
    const fetchData = async () => {
        if (!stateFilter) {
            toast.error("Please select a State to explore rates.");
            return;
        }

        try {
            setIsLoading(true);
            setHasSearched(true);

            // Accessing the API via the shared service to handle base URL and tokens if needed
            // The backend expects filters[state]=Value
            const params = {
                limit: "100",
                "filters[state]": toTitleCase(stateFilter)
            };

            const res = await api.get('/market', { params });
            const records = res.data.records || [];

            setData(records);

            if (records.length === 0) {
                toast.info("No records found for this state yet.");
            } else {
                toast.success(`Found ${records.length} market records.`);
            }

        } catch (error) {
            console.error("Fetch error:", error);
            toast.error("Failed to fetch market rates. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const [sortConfig, setSortConfig] =
        useState<{ key: keyof MarketData; direction: "asc" | "desc" } | null>(null);

    const handleSort = (key: keyof MarketData) => {
        const direction =
            sortConfig && sortConfig.key === key && sortConfig.direction === "asc"
                ? "desc"
                : "asc";

        setSortConfig({ key, direction });

        const sorted = [...data].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });

        setData(sorted);
    };


    /* --------------------------------------------------
       ANIMATION VARIANTS
    ---------------------------------------------------*/
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
        >
            {/* SEARCH / FILTER CARD */}
            <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-md overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
                            <div className="flex-1 space-y-2 w-full">
                                <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-green-600" />
                                    Select Region
                                </label>
                                <div className="relative group">
                                    <select
                                        className="w-full border-2 border-green-100 rounded-xl px-4 py-3 text-gray-700 bg-white focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all appearance-none cursor-pointer"
                                        value={stateFilter}
                                        onChange={(e) => setStateFilter(e.target.value)}
                                    >
                                        <option value="">Choose a State...</option>
                                        {ALL_STATES.map((st, i) => (
                                            <option key={i} value={st}>
                                                {st}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-green-600">
                                        <ArrowUpDown className="w-4 h-4 opacity-50" />
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="h-[50px] px-8 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto font-medium text-lg"
                                onClick={fetchData}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <Search className="w-5 h-5 mr-2" />
                                )}
                                Find Rates
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* RESULTS SECTION */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 text-green-700"
                    >
                        <div className="p-4 bg-white/50 rounded-full mb-4 animate-pulse">
                            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
                        </div>
                        <p className="text-lg font-medium animate-pulse">Fetching latest market insights...</p>
                    </motion.div>
                ) : data.length > 0 ? (
                    <motion.div
                        key="results"
                        variants={itemVariants}
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                    Market Prices
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Showing {data.length} results for {stateFilter}
                                </p>
                            </div>
                            <div className="hidden md:flex gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Live Data</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[150px]" onClick={() => handleSort("district")}>
                                            <div className="flex items-center gap-2 cursor-pointer hover:text-green-700 transition-colors">
                                                District <ArrowUpDown className="w-3 h-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("market")}>
                                            <div className="flex items-center gap-2 cursor-pointer hover:text-green-700 transition-colors">
                                                Market
                                            </div>
                                        </TableHead>
                                        <TableHead onClick={() => handleSort("commodity")}>
                                            <div className="flex items-center gap-2 cursor-pointer hover:text-green-700 transition-colors">
                                                <Sprout className="w-4 h-4 text-green-500" />
                                                Commodity
                                            </div>
                                        </TableHead>
                                        <TableHead>Variety</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                Date
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right">Min Price</TableHead>
                                        <TableHead className="text-right">Max Price</TableHead>
                                        <TableHead className="text-right font-bold text-green-700">Modal Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((row, i) => (
                                        <motion.tr
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="group hover:bg-green-50/50 transition-colors border-b last:border-0"
                                        >
                                            <TableCell className="font-medium text-gray-900">{row.district}</TableCell>
                                            <TableCell className="text-gray-600">{row.market}</TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-semibold">
                                                    {row.commodity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">{row.variety}</TableCell>
                                            <TableCell className="text-gray-500 text-sm whitespace-nowrap">{row.arrival_date}</TableCell>
                                            <TableCell className="text-right font-mono text-gray-600">₹{row.min_price}</TableCell>
                                            <TableCell className="text-right font-mono text-gray-600">₹{row.max_price}</TableCell>
                                            <TableCell className="text-right font-bold font-mono text-green-700 bg-green-50/30 group-hover:bg-green-100/30 transition-colors">
                                                ₹{row.modal_price}
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </motion.div>
                ) : hasSearched ? (
                    <motion.div
                        key="empty"
                        variants={itemVariants}
                        className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200"
                    >
                        <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700">No data found</h3>
                        <p className="text-gray-500">We couldn't find any market rates for the selected state.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="initial"
                        variants={itemVariants}
                        className="text-center py-24"
                    >
                        <div className="inline-flex p-6 rounded-full bg-green-100 mb-6">
                            <Sprout className="w-12 h-12 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to explore?</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Select your state from the menu above to instantly view the latest agricultural commodity prices in your region.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MarketRatesViewer;
