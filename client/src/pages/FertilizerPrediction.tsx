import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Sprout, Droplets, Thermometer, Beaker, CloudSun, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";

const FertilizerPrediction = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nitrogen: "",
        phosphorus: "",
        potassium: "",
        temperature: "",
        humidity: "",
        moisture: "",
        ph: "", // Added pH
        soilType: "",
        cropType: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

    const handleAutoFill = async () => {
        const userData = localStorage.getItem("user");
        if (!userData) {
            toast.error("Please login to use this feature");
            return;
        }

        const user = JSON.parse(userData);
        if (!user.city) {
            toast.error("Please update your profile with a city to use this feature");
            return;
        }

        try {
            setIsAutoFilling(true);
            const response = await axios.get(
                `${import.meta.env.VITE_OPENWEATHER_API_URL}/weather?q=${user.city}&appid=${API_KEY}&units=metric`
            );

            setFormData(prev => ({
                ...prev,
                temperature: response.data.main.temp.toFixed(1),
                humidity: response.data.main.humidity.toString(),
            }));
            toast.success(`Weather data fetched for ${user.city}`);
        } catch (error) {
            console.error("Error fetching weather:", error);
            toast.error("Failed to fetch weather data");
        } finally {
            setIsAutoFilling(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                "Temparature": Number(formData.temperature),
                "Humidity": Number(formData.humidity),
                "Moisture": Number(formData.moisture),
                "Soil Type": formData.soilType,
                "Crop Type": formData.cropType,
                "Nitrogen": Number(formData.nitrogen),
                "Potassium": Number(formData.potassium),
                "Phosphorous": Number(formData.phosphorus)
            };

            const response = await axios.post(import.meta.env.VITE_FERTILIZER_ML_API_URL, payload);

            navigate("/results", { state: { formData, prediction: response.data, type: "fertilizer" } });
        } catch (error) {
            console.error("Error calling ML model:", error);
            toast.error("Failed to get prediction. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="h-screen overflow-hidden bg-background flex flex-col">
            <LoadingScreen isLoading={isLoading} />
            <Navbar />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
                {/* Left Side - Visuals & Info */}
                <div className="hidden lg:flex lg:col-span-5 bg-slate-900 relative overflow-hidden flex-col justify-center p-12 text-white">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/20 backdrop-blur-sm mb-8 border border-green-500/30">
                            <Leaf className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-5xl font-bold mb-6 leading-tight">
                            Fertilizer <br />
                            <span className="text-green-400">Prediction</span>
                        </h1>
                        <p className="text-slate-300 text-lg mb-8 max-w-md leading-relaxed">
                            Get accurate fertilizer recommendations based on your soil composition and crop details to maximize yield.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Sprout className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Nutrient Analysis</h3>
                                    <p className="text-sm text-slate-400">Optimize NPK levels</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Beaker className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Soil & Crop Data</h3>
                                    <p className="text-sm text-slate-400">Tailored to your specific conditions</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Side - Form */}
                <div className="lg:col-span-7 h-full overflow-y-auto bg-slate-50 p-6 lg:p-12 block">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-full max-w-2xl mx-auto"
                    >
                        <div className="mb-8 flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Fertilizer Predictor</h2>
                                <p className="text-slate-500">Enter soil and crop details for the best fertilizer advice.</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAutoFill}
                                disabled={isAutoFilling}
                                className="gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 dark:bg-green-900/20 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors"
                            >
                                {isAutoFilling ? (
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin dark:border-green-400 dark:border-t-transparent" />
                                ) : (
                                    <CloudSun className="w-4 h-4" />
                                )}
                                Auto-fill Weather
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nitrogen */}
                                <div className="space-y-2">
                                    <Label htmlFor="nitrogen" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Sprout className="w-4 h-4 text-green-600" /> Nitrogen (N)
                                    </Label>
                                    <Input
                                        id="nitrogen"
                                        name="nitrogen"
                                        type="number"
                                        placeholder="e.g., 37"
                                        value={formData.nitrogen}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                    />
                                </div>

                                {/* Phosphorus */}
                                <div className="space-y-2">
                                    <Label htmlFor="phosphorus" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Sprout className="w-4 h-4 text-purple-600" /> Phosphorus (P)
                                    </Label>
                                    <Input
                                        id="phosphorus"
                                        name="phosphorus"
                                        type="number"
                                        placeholder="e.g., 0"
                                        value={formData.phosphorus}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                    />
                                </div>

                                {/* Potassium */}
                                <div className="space-y-2">
                                    <Label htmlFor="potassium" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Sprout className="w-4 h-4 text-pink-600" /> Potassium (K)
                                    </Label>
                                    <Input
                                        id="potassium"
                                        name="potassium"
                                        type="number"
                                        placeholder="e.g., 0"
                                        value={formData.potassium}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                    />
                                </div>

                                {/* Temperature */}
                                <div className="space-y-2">
                                    <Label htmlFor="temperature" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Thermometer className="w-4 h-4 text-orange-600" /> Temperature (°C)
                                    </Label>
                                    <Input
                                        id="temperature"
                                        name="temperature"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g., 26"
                                        value={formData.temperature}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                    />
                                </div>

                                {/* Humidity */}
                                <div className="space-y-2">
                                    <Label htmlFor="humidity" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Droplets className="w-4 h-4 text-cyan-600" /> Humidity (%)
                                    </Label>
                                    <Input
                                        id="humidity"
                                        name="humidity"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g., 52"
                                        value={formData.humidity}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                    />
                                </div>

                                {/* Moisture */}
                                <div className="space-y-2">
                                    <Label htmlFor="moisture" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Droplets className="w-4 h-4 text-blue-600" /> Moisture
                                    </Label>
                                    <Input
                                        id="moisture"
                                        name="moisture"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g., 38"
                                        value={formData.moisture}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                    />
                                </div>

                                {/* Soil pH - Added */}
                                <div className="space-y-2">
                                    <Label htmlFor="ph" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Beaker className="w-4 h-4 text-teal-600" /> Soil pH
                                    </Label>
                                    <Input
                                        id="ph"
                                        name="ph"
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g., 6.5"
                                        value={formData.ph}
                                        onChange={handleChange}
                                        required
                                        className="h-12 bg-white border-slate-200 focus:border-green-500 focus:ring-green-500/20 transition-all"
                                    />
                                </div>

                                {/* Soil Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="soilType" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Beaker className="w-4 h-4 text-amber-600" /> Soil Type
                                    </Label>
                                    <Select name="soilType" onValueChange={(value) => handleSelectChange("soilType", value)}>
                                        <SelectTrigger className="h-12 bg-white border-slate-200 focus:ring-green-500/20">
                                            <SelectValue placeholder="Select Soil Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sandy">Sandy</SelectItem>
                                            <SelectItem value="Loamy">Loamy</SelectItem>
                                            <SelectItem value="Black">Black</SelectItem>
                                            <SelectItem value="Red">Red</SelectItem>
                                            <SelectItem value="Clayey">Clayey</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Crop Type */}
                                <div className="space-y-2">
                                    <Label htmlFor="cropType" className="text-slate-700 font-medium flex items-center gap-2">
                                        <Sprout className="w-4 h-4 text-emerald-600" /> Crop Type
                                    </Label>
                                    <Select name="cropType" onValueChange={(value) => handleSelectChange("cropType", value)}>
                                        <SelectTrigger className="h-12 bg-white border-slate-200 focus:ring-green-500/20">
                                            <SelectValue placeholder="Select Crop Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Wheat">Wheat</SelectItem>
                                            <SelectItem value="Maize">Maize</SelectItem>
                                            <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                                            <SelectItem value="Cotton">Cotton</SelectItem>
                                            <SelectItem value="Ground Nuts">Ground Nuts</SelectItem>
                                            <SelectItem value="Oil seeds">Oil seeds</SelectItem>
                                            <SelectItem value="Tobacco">Tobacco</SelectItem>
                                            <SelectItem value="Barley">Barley</SelectItem>
                                            <SelectItem value="Millets">Millets</SelectItem>
                                            <SelectItem value="Paddy">Paddy</SelectItem>
                                            <SelectItem value="Pulses">Pulses</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-lg shadow-lg hover:shadow-green-600/20 transition-all"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Analyzing...
                                        </span>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Predict Fertilizer
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="h-12 px-8 border-slate-200 hover:bg-slate-100 text-slate-600"
                                    onClick={() => setFormData({
                                        nitrogen: "",
                                        phosphorus: "",
                                        potassium: "",
                                        temperature: "",
                                        humidity: "",
                                        moisture: "",
                                        ph: "",
                                        soilType: "",
                                        cropType: "",
                                    })}
                                >
                                    Reset
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default FertilizerPrediction;
