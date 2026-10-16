import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowLeft, Download, Sprout, Droplets, Wind, Beaker, ShoppingBag, AlertCircle, Info, Loader2, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import api from "@/services/api";
import { toast } from "sonner";
import AgriculturalBackground from "@/components/AgriculturalBackground";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { TrendingUp } from "lucide-react";

// Map crops to Unsplash images
const cropImages: Record<string, string> = {
  rice: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?q=80&w=800&auto=format&fit=crop",
  maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=800&auto=format&fit=crop",
  chickpea: "https://images.unsplash.com/photo-1515543904379-3d757afe72e?q=80&w=800&auto=format&fit=crop",
  kidneybeans: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=800&auto=format&fit=crop",
  pigeonpeas: "https://images.unsplash.com/photo-1599579112558-8120689b7878?q=80&w=800&auto=format&fit=crop",
  mothbeans: "https://images.unsplash.com/photo-1599579112558-8120689b7878?q=80&w=800&auto=format&fit=crop",
  mungbean: "https://images.unsplash.com/photo-1515543904379-3d757afe72e?q=80&w=800&auto=format&fit=crop",
  blackgram: "https://images.unsplash.com/photo-1515543904379-3d757afe72e?q=80&w=800&auto=format&fit=crop",
  lentil: "https://images.unsplash.com/photo-1515543904379-3d757afe72e?q=80&w=800&auto=format&fit=crop",
  pomegranate: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?q=80&w=800&auto=format&fit=crop",
  banana: "https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=800&auto=format&fit=crop",
  mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop",
  grapes: "https://images.unsplash.com/photo-1537640538965-1756fb179c26?q=80&w=800&auto=format&fit=crop",
  watermelon: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop",
  muskmelon: "https://images.unsplash.com/photo-1598025362874-49480f044805?q=80&w=800&auto=format&fit=crop",
  apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=800&auto=format&fit=crop",
  orange: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=800&auto=format&fit=crop",
  papaya: "https://images.unsplash.com/photo-1617117833203-c91b06061dad?q=80&w=800&auto=format&fit=crop",
  coconut: "https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?q=80&w=800&auto=format&fit=crop",
  cotton: "https://images.unsplash.com/photo-1615485500920-3c4f2dae2184?q=80&w=800&auto=format&fit=crop",
  jute: "https://images.unsplash.com/photo-1615485500920-3c4f2dae2184?q=80&w=800&auto=format&fit=crop",
  coffee: "https://images.unsplash.com/photo-1552346989-e069318e20a5?q=80&w=800&auto=format&fit=crop",
};

// Fertilizer Data (Using Unsplash images for reliability)
const fertilizerData: Record<string, { image: string; npk: string; type: string; description: string }> = {
  "Urea": {
    image: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=800&auto=format&fit=crop", // White powder/granules
    npk: "46-0-0",
    type: "Synthetic",
    description: "High nitrogen fertilizer for promoting green leafy growth."
  },
  "DAP": {
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=800&auto=format&fit=crop", // Granules
    npk: "18-46-0",
    type: "Synthetic",
    description: "Excellent source of phosphorus and nitrogen for root development."
  },
  "14-35-14": {
    image: "https://images.unsplash.com/photo-1563514227146-8930d4f04494?q=80&w=800&auto=format&fit=crop", // Agriculture generic
    npk: "14-35-14",
    type: "Complex",
    description: "Balanced fertilizer with high phosphorus for flowering and fruiting."
  },
  "28-28": {
    image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=800&auto=format&fit=crop", // Field
    npk: "28-28-0",
    type: "Complex",
    description: "High nitrogen and phosphorus content for vigorous growth."
  },
  "17-17-17": {
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop", // Field
    npk: "17-17-17",
    type: "Balanced",
    description: "Equal balance of nutrients for general purpose crop maintenance."
  },
  "20-20": {
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=800&auto=format&fit=crop", // Field
    npk: "20-20-0",
    type: "Complex",
    description: "Balanced nitrogen and phosphorus for steady growth."
  },
  "10-26-26": {
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800&auto=format&fit=crop", // Field
    npk: "10-26-26",
    type: "Complex",
    description: "High phosphorus and potassium for quality produce and disease resistance."
  }
};

// Branded Products Data (Using Unsplash/Placeholder images for reliability)
const brandedProducts: Record<string, Array<{ id: string; brand: string; name: string; price: string; weight: string; image: string }>> = {
  "Urea": [
    { id: "u1", brand: "IFFCO", name: "Neem Coated Urea", price: "₹266.50", weight: "45 kg", image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=400&auto=format&fit=crop" },
    { id: "u2", brand: "Coromandel", name: "Gromor Urea", price: "₹300.00", weight: "50 kg", image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=400&auto=format&fit=crop" },
    { id: "u3", brand: "Yara", name: "YaraVera Urea", price: "₹350.00", weight: "50 kg", image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=400&auto=format&fit=crop" }
  ],
  "DAP": [
    { id: "d1", brand: "IFFCO", name: "DAP 18-46-0", price: "₹1,350.00", weight: "50 kg", image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=400&auto=format&fit=crop" },
    { id: "d2", brand: "Coromandel", name: "Gromor DAP", price: "₹1,400.00", weight: "50 kg", image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=400&auto=format&fit=crop" }
  ]
};

const Results = () => {
  const location = useLocation();
  const formData = location.state?.formData;
  const resultType = location.state?.type; // 'crop' or 'fertilizer'
  const resultRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [productionData, setProductionData] = useState<any[]>([]);
  const [productionLoading, setProductionLoading] = useState(false);
  const [prodStats, setProdStats] = useState<{ leadingState: string; maxProduction: number; avgYield: number; maxYear: number } | null>(null);

  // Parse prediction
  const rawPrediction = location.state?.prediction?.prediction;
  const predictionName = Array.isArray(rawPrediction) ? rawPrediction[0] : rawPrediction;
  const formattedName = predictionName ? predictionName.charAt(0).toUpperCase() + predictionName.slice(1) : "Unknown";

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
    setProdStats({ leadingState, maxProduction: maxProd, avgYield, maxYear });

    // 2. Forecasting till 2025 (Simple Linear Regression)
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

  const generateDummyData = (cropName: string) => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10; // Last 10 years
    const dummyData = [];

    // Base production value (random between 5000 and 15000)
    let baseProduction = 5000 + Math.random() * 10000;

    for (let year = startYear; year <= currentYear; year++) {
      // Add some random fluctuation (-10% to +15%)
      const fluctuation = 0.9 + Math.random() * 0.25;
      baseProduction = baseProduction * fluctuation;

      dummyData.push({
        year,
        production: Math.round(baseProduction),
        state: "Karnataka", // Default dummy state
        district_name: "Bangalore Urban",
        crop_year: year,
        crop: cropName
      });
    }

    return dummyData;
  };

  useEffect(() => {
    console.log("DEBUG: ResultType:", resultType);
    console.log("DEBUG: PredictionName:", predictionName);

    if (resultType === 'crop' && predictionName) {
      const fetchProductionData = async () => {
        setProductionLoading(true);
        console.log("DEBUG: Fetching production data for:", predictionName);
        try {
          const apiUrl = import.meta.env.VITE_PRODUCTION_API_URL;
          console.log("DEBUG: API URL:", apiUrl);
          const response = await axios.get(`${apiUrl}?crop=${predictionName}`);
          console.log("DEBUG: API Response:", response.data);

          if (response.data && response.data.prediction && response.data.prediction.length > 0) {
            const sortedData = response.data.prediction.sort((a: any, b: any) => a.year - b.year);
            const processedData = calculateStatsAndForecast(sortedData);
            console.log("DEBUG: Processed Data:", processedData);
            setProductionData(processedData);
          } else {
            console.warn("DEBUG: No prediction data in response, using dummy data");
            const dummyData = generateDummyData(predictionName);
            const processedData = calculateStatsAndForecast(dummyData);
            setProductionData(processedData);
          }
        } catch (error) {
          console.error("Failed to fetch production data, using dummy data:", error);
          const dummyData = generateDummyData(predictionName);
          const processedData = calculateStatsAndForecast(dummyData);
          setProductionData(processedData);
        } finally {
          setProductionLoading(false);
        }
      };
      fetchProductionData();
    } else {
      console.log("DEBUG: Skipping fetch. Conditions not met.");
    }
  }, [resultType, predictionName]);

  // --- FERTILIZER VIEW ---
  if (resultType === 'fertilizer') {
    // Case-insensitive lookup
    const fertilizerKey = Object.keys(fertilizerData).find(key => key.toLowerCase() === predictionName?.toLowerCase()) || "Urea";
    const fertilizer = fertilizerData[fertilizerKey] || fertilizerData["Urea"];

    const products = brandedProducts[fertilizerKey] || brandedProducts["Urea"]; // Fallback for demo

    // Prepare chart data
    const npkValues = fertilizer.npk.split('-').map(Number);
    const chartData = [
      { name: 'Nitrogen', value: npkValues[0] || 0, fill: '#60a5fa' },
      { name: 'Phosphorus', value: npkValues[1] || 0, fill: '#c084fc' },
      { name: 'Potassium', value: npkValues[2] || 0, fill: '#f472b6' },
      { name: 'Soil pH', value: Number(formData?.ph) || 0, fill: '#34d399' },
    ];

    return (
      <div className="min-h-screen font-sans flex flex-col relative overflow-hidden">
        <AgriculturalBackground />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Link to="/fertilizer-prediction">
                <Button variant="ghost" className="hover:bg-slate-200 hover:text-slate-900 text-slate-600 mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Predictor
                </Button>
              </Link>
              <h1 className="text-4xl font-extrabold text-slate-900 drop-shadow-sm">Recommended Fertilizer: {formattedName}</h1>
              <p className="text-slate-600 text-lg font-medium opacity-90">Based on analysis for your soil conditions</p>
            </motion.div>

            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-64 md:h-96 rounded-3xl overflow-hidden relative mb-10 shadow-2xl group"
            >
              <img
                src={fertilizer.image}
                alt={formattedName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-8 md:p-12">
                <div className="text-white max-w-3xl">
                  <Badge className="bg-green-500 text-white border-none mb-4 text-lg px-4 py-1.5 shadow-lg">
                    Best Match
                  </Badge>
                  <h2 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">{formattedName}</h2>
                  <p className="text-white/90 text-xl font-medium leading-relaxed max-w-2xl">{fertilizer.description}</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Stats & Guide */}
              <div className="lg:col-span-2 space-y-8">

                {/* Nutrient Levels Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-none shadow-xl bg-white/90 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Beaker className="w-6 h-6 text-purple-500" /> Nutrient Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                              cursor={{ fill: '#f1f5f9' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60} animationDuration={1500}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Application Guide */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-none shadow-xl bg-white/90 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-green-600" /> Application Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {[
                          { title: "Measure Correctly", desc: "Calculate the required amount based on your field size. Avoid over-application." },
                          { title: "Apply Evenly", desc: "Broadcast granules uniformly across the soil surface or use a spreader." },
                          { title: "Incorporate into Soil", desc: "Lightly rake the soil to mix the fertilizer into the top layer." },
                          { title: "Water Thoroughly", desc: "Water the field immediately after application to help nutrients dissolve." }
                        ].map((step, idx) => (
                          <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg shadow-sm">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-lg mb-1">{step.title}</h4>
                              <p className="text-slate-600">{step.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Available Products List */}
                {products.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4"
                  >
                    <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2 drop-shadow-sm">
                      <ShoppingBag className="w-6 h-6 text-green-300" />
                      Available Brands & Prices
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {products.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                          whileHover={{ y: -5 }}
                          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border-none overflow-hidden hover:shadow-xl transition-all flex h-40"
                        >
                          <div className="w-1/3 bg-slate-50 p-4 flex items-center justify-center relative group">
                            <div className="absolute inset-0 bg-slate-200/50 group-hover:bg-transparent transition-colors" />
                            <img
                              src={product.image}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain relative z-10 mix-blend-multiply"
                            />
                          </div>
                          <div className="w-2/3 p-5 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{product.brand}</p>
                                <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">{product.weight}</Badge>
                              </div>
                              <h3 className="text-base font-bold text-slate-900 leading-tight">{product.name}</h3>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xl font-extrabold text-green-700">{product.price}</span>
                              <Button size="sm" className="h-8 text-xs bg-slate-900 hover:bg-slate-800">Buy Now</Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Right Column: Side Cards */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-none shadow-xl bg-white/90 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-green-500" /> Benefits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        <li className="flex gap-3 text-slate-700">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="font-medium">Promotes rapid growth</span>
                        </li>
                        <li className="flex gap-3 text-slate-700">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="font-medium">Increases crop yield</span>
                        </li>
                        <li className="flex gap-3 text-slate-700">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="font-medium">Improves soil health</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-none shadow-xl bg-white/90 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" /> Precautions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-amber-50/80 p-5 rounded-xl border border-amber-100">
                        <div className="flex gap-2 mb-2">
                          <span className="font-bold text-amber-900 text-sm uppercase tracking-wide">Safety First</span>
                        </div>
                        <p className="text-sm text-amber-800 leading-relaxed font-meduim">
                          Store in a cool, dry place. Keep away from children and pets. Wear gloves during application to avoid skin irritation.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="border-none shadow-xl bg-white/90 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-500" /> Market Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        Current market trends show stable prices for {formattedName}. Consider buying in bulk for better rates during the off-season.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100/50 p-2 rounded-lg w-fit">
                        <Info className="w-3 h-3" />
                        <span>Updated: {new Date().toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- CROP RECOMMENDATION VIEW (EXISTING) ---

  // Get image or default
  const cropImage = cropImages[predictionName?.toLowerCase()] || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop";

  // Data for Radar Chart (Environmental Profile)
  const radarData = formData ? [
    { subject: 'Temp', A: (Number(formData.temperature) / 50) * 100, fullMark: 100 },
    { subject: 'Humidity', A: Number(formData.humidity), fullMark: 100 },
    { subject: 'pH', A: (Number(formData.ph) / 14) * 100, fullMark: 100 },
    { subject: 'Rainfall', A: (Number(formData.rainfall) / 300) * 100, fullMark: 100 },
  ] : [];

  // Data for Bar Chart (Nutrients)
  const nutrientData = formData ? [
    { name: 'N', value: Number(formData.nitrogen), color: '#3b82f6' },
    { name: 'P', value: Number(formData.phosphorus), color: '#8b5cf6' },
    { name: 'K', value: Number(formData.potassium), color: '#ec4899' },
  ] : [];

  const [isGenerating, setIsGenerating] = useState(false);

  const [aiReportText, setAiReportText] = useState<string>("");

  const handleAIReport = async () => {
    try {
      setIsGenerating(true);

      const payload = {
        ...formData,
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium),
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        ph: Number(formData.ph),
        rainfall: Number(formData.rainfall),
        predictedCrop: predictionName,
        fieldName: formData.fieldName || "Field"
      };

      // 1. Get AI Report Text
      const { data } = await api.post("/predict/report", payload);
      setAiReportText(data.report);
      toast.success("AI Report generated! Click 'Save Result' to download PDF.");

    } catch (error: any) {
      console.error("Error generating AI report:", error);
      toast.error(error.response?.data?.message || "Failed to generate AI report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!aiReportText) {
      toast.error("Please generate the AI report first.");
      return;
    }
    setIsDownloading(true);

    try {
      const payload = {
        cropName: formattedName,
        soilData: {
          N: formData.nitrogen,
          P: formData.phosphorus,
          K: formData.potassium,
          ph: formData.ph,
          humidity: formData.humidity,
          temperature: formData.temperature,
          rainfall: formData.rainfall
        },
        aiReport: aiReportText
      };

      const response = await api.post('/predict/download-report', payload, {
        responseType: 'blob'
      });

      // Create a URL for the file and trigger download
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Soil_Report_${formattedName}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Trigger Email
      await api.post('/predict/email-report', payload);
      toast.success("Report emailed successfully!");

    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!formData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-800">No Data Found</h2>
          <Link to="/crop-recommender">
            <Button>Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 font-sans flex flex-col relative">
      {/* Background Pattern */}
      <AgriculturalBackground />

      <div className="relative z-10 flex flex-col h-full">
        <Navbar />

        <div className="flex-1 container mx-auto px-4 py-4 max-w-7xl h-full overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <Link to="/crop-recommender">
              <Button variant="ghost" className="hover:bg-slate-200 text-slate-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAIReport}
                disabled={isGenerating}
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                AI Report
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-md"
              >
                {isDownloading ? "Generating..." : <><Download className="w-4 h-4 mr-2" /> Save Result</>}
              </Button>
            </div>
          </div>

          {/* Main Content Area to be Captured */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            ref={resultRef}
            className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-full border border-white/50"
          >

            {/* Left Column: Image & Key Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-4 relative h-full min-h-[300px]"
            >
              <div className="absolute inset-0">
                <img
                  src={cropImage}
                  alt={formattedName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                  <Badge className="self-start mb-4 px-3 py-1 bg-green-500 text-white border-none shadow-lg">
                    <CheckCircle className="w-3 h-3 mr-1" /> Best Match
                  </Badge>
                  <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
                    {formattedName}
                  </h1>
                  <p className="text-white/90 text-sm mb-6 leading-relaxed font-medium">
                    Optimal growth conditions detected based on your soil profile.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-blue-100 font-medium">Water</span>
                      </div>
                      <p className="text-white font-bold">Moderate</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <Sprout className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-100 font-medium">Growth</span>
                      </div>
                      <p className="text-white font-bold">Fast</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Charts & Data */}
            <div className="lg:col-span-8 p-6 lg:p-8 flex flex-col h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 shrink-0">
                {/* Radar Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-none shadow-lg bg-slate-50/50 rounded-2xl p-4 h-full">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Wind className="w-4 h-4 text-slate-500" /> Environmental Profile
                    </h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Conditions" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.3} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>

                {/* Bar Chart (Moved Up) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-none shadow-lg bg-slate-50/50 rounded-2xl p-4 h-full">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <Beaker className="w-4 h-4 text-slate-500" /> Nutrient Analysis
                    </h3>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={nutrientData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500}>
                            {nutrientData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>

                {/* Production Trends Chart (Moved Down) */}


                {/* Production Trends Chart (New) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="md:col-span-2"
                >
                  <Card className="border-none shadow-lg bg-slate-50/50 rounded-2xl p-4 h-full">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-slate-500" /> Production Trends ({formattedName})
                      </div>
                      {prodStats && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Top State: {prodStats.leadingState}
                        </Badge>
                      )}
                    </h3>
                    <div className="h-[200px] w-full">
                      {productionLoading ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading trends...</div>
                      ) : productionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={productionData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="year" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }}
                              cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '3 3' }}
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const dataPoint = payload[0].payload;
                                  return (
                                    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-xl border border-slate-100 ring-1 ring-slate-100">
                                      <p className="font-bold text-slate-800 text-xs mb-1">{label}</p>
                                      <p className="text-xs text-slate-500 mb-1">
                                        State: <span className="font-semibold text-slate-900">{dataPoint.state}</span>
                                      </p>
                                      <p className="text-sm font-bold text-green-600">
                                        {Number(payload[0].value).toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">tonnes</span>
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area type="monotone" dataKey="production" stroke="#22c55e" fillOpacity={1} fill="url(#colorProd)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">No trend data available</div>
                      )}
                    </div>
                  </Card>
                </motion.div>


              </div>

              {/* Detailed Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex-1"
              >
                <h3 className="text-sm font-bold text-slate-700 mb-4">Detailed Parameters</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { label: "N", value: formData.nitrogen, unit: "kg/ha", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                    { label: "P", value: formData.phosphorus, unit: "kg/ha", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
                    { label: "K", value: formData.potassium, unit: "kg/ha", color: "text-pink-600", bg: "bg-pink-50 border-pink-100" },
                    { label: "Temp", value: formData.temperature, unit: "°C", color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
                    { label: "Humid", value: formData.humidity, unit: "%", color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-100" },
                    { label: "pH", value: formData.ph, unit: "", color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
                    { label: "Rain", value: formData.rainfall, unit: "mm", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`p-3 rounded-xl text-center border ${item.bg} transition-transform`}
                    >
                      <p className={`text-xs font-bold ${item.color} mb-1 uppercase`}>{item.label}</p>
                      <p className="font-bold text-slate-800 text-sm">{item.value}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{item.unit}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Results;
