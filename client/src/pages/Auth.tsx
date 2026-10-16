import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wheat, Eye, EyeOff } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { State, City } from "country-state-city";
import api from "@/services/api";
import { toast } from "sonner";

const Auth = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(location.pathname === "/login");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        city: "",
        state: "",
        password: "",
        role: "farmer",
    });

    const [availableStates, setAvailableStates] = useState<any[]>([]);
    const [availableCities, setAvailableCities] = useState<any[]>([]);

    useEffect(() => {
        setIsLogin(location.pathname === "/login");
    }, [location.pathname]);

    useEffect(() => {
        // Load states for India by default
        const states = State.getStatesOfCountry("IN");
        setAvailableStates(states);
    }, []);

    useEffect(() => {
        if (formData.state) {
            // Find state code to get cities
            const selectedState = availableStates.find(s => s.name === formData.state);
            if (selectedState) {
                const cities = City.getCitiesOfState("IN", selectedState.isoCode);
                setAvailableCities(cities);
            } else {
                setAvailableCities([]);
            }
        } else {
            setAvailableCities([]);
        }
    }, [formData.state, availableStates]);

    const toggleMode = () => {
        const newPath = isLogin ? "/register" : "/login";
        navigate(newPath);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStateChange = (value: string) => {
        setFormData({ ...formData, state: value, city: "" }); // Reset city when state changes
    };

    const handleCityChange = (value: string) => {
        setFormData({ ...formData, city: value });
    };

    const validatePassword = (password: string) => {
        // Min 8 chars, 1 uppercase, 1 lowercase, 1 special/number
        // Regex: At least one lowercase, one uppercase, one digit or special char, min 8 length
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W])[A-Za-z\d\W]{8,}$/;
        return regex.test(password);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.email || !formData.password) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (!isLogin) {
            if (!formData.name || !formData.state || !formData.city) {
                toast.error("Please fill in all fields (Name, State, City).");
                return;
            }
            if (!validatePassword(formData.password)) {
                toast.error("Password must be at least 8 chars, involve an uppercase, a lowercase, and a number/symbol.");
                return;
            }
        }

        try {
            if (isLogin) {
                const { data } = await api.post("/auth/login", {
                    email: formData.email,
                    password: formData.password,
                    role: formData.role || 'farmer', // Default to farmer if not selected
                });
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data));
                    toast.success("Login successful!");

                    if (data.role === 'transporter') {
                        navigate("/transporter-dashboard");
                    } else {
                        navigate("/dashboard");
                    }
                } else {
                    toast.error("Login failed: No token received");
                }
            } else {
                const { data } = await api.post("/auth/register", formData);
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data));
                    toast.success("Registration successful!");
                    navigate("/dashboard");
                } else {
                    toast.error("Registration failed: No token received");
                }
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-0 md:p-4 overflow-hidden">

            {/* Mobile Layout */}
            <div className="md:hidden w-full h-screen flex flex-col bg-background">
                {/* Header Image Section */}
                <div className="relative h-[35vh] w-full shrink-0">
                    <img
                        src={isLogin ? "https://images.unsplash.com/photo-1574943320219-553eb213f72d" : "https://images.unsplash.com/photo-1560493676-04071c5f467b"}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center mb-4">
                            <Wheat className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{isLogin ? "Welcome Back!" : "Join Us!"}</h2>
                        <p className="text-white/90 text-sm max-w-[250px]">
                            {isLogin ? "Enter your details to access your account" : "Start your smart farming journey today"}
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="flex-1 bg-card -mt-8 rounded-t-[32px] relative z-20 p-6 pt-8 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] overflow-y-auto">
                    <div className="max-w-sm mx-auto">
                        <form className="space-y-4" onSubmit={handleAuth}>
                            {!isLogin && (
                                <div className="space-y-2">
                                    <Input
                                        name="name"
                                        placeholder="Full Name"
                                        className="h-11 bg-muted/50"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required={!isLogin}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Input
                                    name="email"
                                    placeholder="Email"
                                    type="email"
                                    className="h-11 bg-muted/50"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {!isLogin && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Select onValueChange={handleStateChange} value={formData.state}>
                                            <SelectTrigger className="h-11 bg-muted/50">
                                                <SelectValue placeholder="State" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStates.map((state) => (
                                                    <SelectItem key={state.isoCode} value={state.name}>
                                                        {state.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Select onValueChange={handleCityChange} value={formData.city} disabled={!formData.state}>
                                            <SelectTrigger className="h-11 bg-muted/50">
                                                <SelectValue placeholder="City" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableCities.map((city) => (
                                                    <SelectItem key={city.name} value={city.name}>
                                                        {city.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="relative">
                                    <Input
                                        name="password"
                                        placeholder="Password"
                                        type={showPassword ? "text" : "password"}
                                        className="h-11 bg-muted/50 pr-10"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {isLogin && (
                                <div className="flex justify-end">
                                    <span onClick={() => navigate('/forgot-password')} className="text-sm text-primary hover:underline cursor-pointer">Forgot Password?</span>
                                </div>
                            )}

                            <Button className="w-full h-11 text-base mt-4" size="lg" type="submit">
                                {isLogin ? "Log In" : "Sign Up"}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground pt-4">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <button type="button" onClick={toggleMode} className="text-primary font-medium hover:underline">
                                    {isLogin ? "Sign Up" : "Log In"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex relative w-full max-w-[1000px] min-h-[600px] bg-card rounded-2xl shadow-2xl overflow-hidden">

                {/* Sign Up Form Container (Left Side) */}
                <div className="w-1/2 h-full absolute left-0 top-0 flex items-center justify-center p-12">
                    <motion.div
                        initial={false}
                        animate={{
                            x: isLogin ? -50 : 0,
                            opacity: isLogin ? 0 : 1,
                            zIndex: isLogin ? 0 : 10
                        }}
                        className="w-full max-w-sm space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
                            <p className="text-muted-foreground mt-2">Join us for smarter farming</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleAuth}>
                            <div className="space-y-2">
                                <Input
                                    name="name"
                                    placeholder="Full Name"
                                    className="h-11 bg-muted/50"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={!isLogin}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    name="email"
                                    placeholder="Email"
                                    type="email"
                                    className="h-11 bg-muted/50"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Select onValueChange={handleStateChange} value={formData.state}>
                                        <SelectTrigger className="h-11 bg-muted/50">
                                            <SelectValue placeholder="State" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableStates.map((state) => (
                                                <SelectItem key={state.isoCode} value={state.name}>
                                                    {state.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Select onValueChange={handleCityChange} value={formData.city} disabled={!formData.state}>
                                        <SelectTrigger className="h-11 bg-muted/50">
                                            <SelectValue placeholder="City" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCities.map((city) => (
                                                <SelectItem key={city.name} value={city.name}>
                                                    {city.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Input
                                        name="password"
                                        placeholder="Password"
                                        type={showPassword ? "text" : "password"}
                                        className="h-11 bg-muted/50 pr-10"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <Button className="w-full h-11 text-base mt-2" size="lg" type="submit">Sign Up</Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button variant="outline" className="w-full" type="button">Google</Button>
                        </div>
                    </motion.div>
                </div>

                {/* Login Form Container (Right Side) */}
                <div className="w-1/2 h-full absolute right-0 top-0 flex items-center justify-center p-12">
                    <motion.div
                        initial={false}
                        animate={{
                            x: isLogin ? 0 : 50,
                            opacity: isLogin ? 1 : 0,
                            zIndex: isLogin ? 10 : 0
                        }}
                        className="w-full max-w-sm space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
                            <p className="text-muted-foreground mt-2">Log in to your account</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleAuth}>
                            <div className="space-y-2">
                                <Input
                                    name="email"
                                    placeholder="Email"
                                    type="email"
                                    className="h-11 bg-muted/50"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Login as:</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="farmer"
                                            checked={formData.role === "farmer" || !formData.role}
                                            onChange={handleChange}
                                            className="accent-green-600 w-4 h-4"
                                        />
                                        <span>Farmer</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            value="transporter"
                                            checked={formData.role === "transporter"}
                                            onChange={handleChange}
                                            className="accent-green-600 w-4 h-4"
                                        />
                                        <span>Transporter</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Input
                                        name="password"
                                        placeholder="Password"
                                        type={showPassword ? "text" : "password"}
                                        className="h-11 bg-muted/50 pr-10"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <span onClick={() => navigate('/forgot-password')} className="text-sm text-primary hover:underline cursor-pointer">Forgot Password?</span>
                            </div>
                            <Button className="w-full h-11 text-base mt-2" size="lg" type="submit">Log In</Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button variant="outline" className="w-full" type="button">Google</Button>
                        </div>
                    </motion.div>
                </div>

                {/* Overlay Container (The Sliding Part) */}
                <motion.div
                    initial={false}
                    animate={{ x: isLogin ? "0%" : "100%" }}
                    className="absolute left-0 top-0 w-1/2 h-full z-20 overflow-hidden"
                >
                    {/* Inner Container for Image (Moves opposite to parent to keep image static relative to screen) */}
                    <motion.div
                        animate={{ x: isLogin ? "0%" : "-50%" }}
                        className="relative h-full w-[200%] flex"
                    >
                        {/* Login Overlay Content (Visible when Overlay is on Left - prompting Sign Up) */}
                        <div className="w-1/2 h-full relative flex items-center justify-center text-white p-12">
                            <div className="absolute inset-0 bg-black/40 z-0" />
                            <img
                                src="https://images.unsplash.com/photo-1560493676-04071c5f467b"
                                className="absolute inset-0 w-full h-full object-cover z-[-1]"
                                alt="Farm field"
                            />

                            <div className="relative z-10 text-center space-y-6">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                                    <Wheat className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-4xl font-bold">New Here?</h2>
                                <p className="text-lg text-white/90 max-w-xs mx-auto">
                                    Sign up and discover a smarter way to manage your farm with AI insights.
                                </p>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="mt-8 w-40 bg-white text-primary hover:bg-white/90 border-none"
                                    onClick={toggleMode}
                                >
                                    Sign Up
                                </Button>
                            </div>
                        </div>

                        {/* Register Overlay Content (Visible when Overlay is on Right - prompting Login) */}
                        <div className="w-1/2 h-full relative flex items-center justify-center text-white p-12">
                            <div className="absolute inset-0 bg-black/40 z-0" />
                            <img
                                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d"
                                className="absolute inset-0 w-full h-full object-cover z-[-1]"
                                alt="Farmer tablet"
                            />

                            <div className="relative z-10 text-center space-y-6">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                                    <Wheat className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-4xl font-bold">Welcome Back!</h2>
                                <p className="text-lg text-white/90 max-w-xs mx-auto">
                                    To keep connected with us please login with your personal info.
                                </p>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="mt-8 w-40 bg-white text-primary hover:bg-white/90 border-none"
                                    onClick={toggleMode}
                                >
                                    Log In
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    );
};

export default Auth;
