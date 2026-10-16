import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const { resetToken } = useParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            await api.put(`/auth/resetpassword/${resetToken}`, { password });
            toast({
                title: "Success",
                description: "Password reset successful. Redirecting to login...",
            });
            setTimeout(() => navigate("/login"), 2000);
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
                <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
                <p className="text-muted-foreground text-center mb-6">
                    Enter your new password below.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-11 mb-2"
                        />
                        <Input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="h-11"
                        />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Reset Password
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default ResetPassword;
