import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/auth/forgotpassword", { email });
            toast({
                title: "Email Sent",
                description: "Check your inbox for the password reset link.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8">
                <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>
                <p className="text-muted-foreground text-center mb-6">
                    Enter your email address to receive a password reset link.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Reset Link
                    </Button>
                    <div className="text-center mt-4">
                        <Button variant="link" onClick={() => navigate("/login")}>
                            Back to Login
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ForgotPassword;
