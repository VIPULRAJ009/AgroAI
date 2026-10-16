import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Camera, Link as LinkIcon, User, Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import Navbar from "@/components/Navbar";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ name: string; email: string; image?: string; city?: string; state?: string } | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        image: "",
        city: "",
        state: "",
        password: "",
        confirmPassword: "",
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData((prev) => ({
                ...prev,
                name: parsedUser.name || "",
                email: parsedUser.email || "",
                image: parsedUser.image || "",
                city: parsedUser.city || "",
                state: parsedUser.state || "",
            }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("city", formData.city);
            data.append("state", formData.state);
            if (formData.password) {
                data.append("password", formData.password);
            }
            if (selectedFile) {
                data.append("image", selectedFile);
            } else if (formData.image) {
                data.append("imageUrl", formData.image);
            }

            const response = await api.put("/auth/profile", data);
            console.log("Profile Update Response:", response.data);

            localStorage.setItem("user", JSON.stringify(response.data));
            localStorage.setItem("token", response.data.token);
            setUser(response.data);
            toast.success("Profile updated successfully");
            setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
            setSelectedFile(null);
            setTimeout(() => {
                if (response.data.role === 'transporter') {
                    navigate("/transporter-dashboard");
                } else {
                    navigate("/dashboard");
                }
            }, 1000); // Redirect after short delay
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleBackToDashboard = () => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role === 'transporter') {
                navigate("/transporter-dashboard");
            } else {
                navigate("/dashboard");
            }
        } else {
            navigate("/dashboard");
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background no-scrollbar overflow-y-auto">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Button
                    variant="ghost"
                    onClick={handleBackToDashboard}
                    className="mb-6 gap-2 pl-0 hover:pl-2 transition-all hover:bg-transparent text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Button>
                <Card className="p-8 shadow-lg border-border/50">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
                        <p className="text-muted-foreground mt-2">Update your personal information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Profile Image Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl relative">
                                    {selectedFile ? (
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : user.image ? (
                                        <img
                                            src={user.image}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                                            {user.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>
                            <div className="w-full max-w-xs">
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        placeholder="Or paste image URL"
                                        className="pl-10 bg-muted/30"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        className="pl-10 h-11 bg-muted/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="pl-10 h-11 bg-muted/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <div className="relative">
                                    <Input
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter your city"
                                        className="h-11 bg-muted/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <div className="relative">
                                    <Input
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Enter your state"
                                        className="h-11 bg-muted/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Leave blank to keep current"
                                        className="pl-10 h-11 bg-muted/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                        className="pl-10 h-11 bg-muted/30"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={async () => {
                                    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                                        try {
                                            await api.delete("/auth/profile");
                                            localStorage.removeItem("token");
                                            localStorage.removeItem("user");
                                            toast.success("Account deleted successfully");
                                            navigate("/");
                                        } catch (error) {
                                            console.error(error);
                                            toast.error("Failed to delete account");
                                        }
                                    }
                                }}
                            >
                                Delete Account
                            </Button>
                            <Button type="submit" size="lg" className="w-full md:w-auto px-8">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
