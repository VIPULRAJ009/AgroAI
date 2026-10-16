import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wheat, Menu, Truck, Bell, Check, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import api from "@/services/api";

const TransporterNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

        if (token) {
            fetchPendingBookings();
            // Poll for updates every 5 seconds for instant feedback
            const interval = setInterval(fetchPendingBookings, 5000);
            return () => clearInterval(interval);
        }
    }, [location.pathname]);

    const fetchPendingBookings = async () => {
        try {
            const { data } = await api.get("/bookings/my");
            // Show only pending bookings that haven't been read/dismissed
            const pending = data.filter((b: any) => b.status === 'pending' && !b.isTransporterRead);
            setPendingBookings(pending);
            setPendingCount(pending.length);
        } catch (error) {
            console.error("Error fetching bookings", error);
        }
    };

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await api.put(`/bookings/${id}/read`);
            // Optimistically update UI
            setPendingBookings(prev => prev.filter(b => b._id !== id));
            setPendingCount(prev => prev - 1);
        } catch (error) {
            console.error("Error marking read", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        navigate("/");
    };

    const navItems = [
        { name: "Dashboard", path: "/transporter-dashboard" },
        { name: "Profile", path: "/profile" },
    ];

    return (
        <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-foreground">AgroTransport</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-sm font-medium transition-colors hover:text-green-700 ${location.pathname === item.path
                                    ? "text-green-700"
                                    : "text-muted-foreground"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <Link to="/transporter-dashboard">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-green-700">
                                                <Bell className="w-5 h-5" />
                                                {pendingCount > 0 && (
                                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0" align="end">
                                            <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
                                                <h4 className="font-semibold text-sm">Notifications</h4>
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{pendingCount} New</span>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {pendingBookings.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-gray-500">
                                                        No new notifications
                                                    </div>
                                                ) : (
                                                    pendingBookings.map((booking: any) => (
                                                        <div key={booking._id} className="p-3 border-b hover:bg-slate-50 transition-colors relative group">
                                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={(e) => handleMarkRead(booking._id, e)}
                                                                    className="p-1 hover:bg-green-100 text-green-600 rounded-full"
                                                                    title="Mark as Read"
                                                                >
                                                                    <Check className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleMarkRead(booking._id, e)}
                                                                    className="p-1 hover:bg-red-100 text-red-600 rounded-full"
                                                                    title="Dismiss"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <div className="flex justify-between items-start mb-1 pr-12">
                                                                <span className="font-medium text-sm text-green-800">{booking.farmer?.name || "Farmer"}</span>
                                                                <span className="text-xs text-gray-400">{new Date(booking.date).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 mb-2">
                                                                Requested <strong>{booking.vehicle?.type}</strong> for <strong>{booking.cropType}</strong> ({booking.weight}Q)
                                                            </p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                                                                <span className="truncate max-w-[100px]">{booking.pickupLocation}</span> → <span className="truncate max-w-[100px]">{booking.dropoffLocation}</span>
                                                            </p>
                                                            <Link to="/transporter-dashboard" className="block text-center text-xs bg-green-600 text-white py-1.5 rounded hover:bg-green-700">
                                                                View & Accept
                                                            </Link>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:inline-flex text-red-600 hover:text-red-700 hover:bg-red-50">
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">
                                        Log In
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="bg-green-700 hover:bg-green-800">Get Started</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button - Implemented with Sheet */}
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="-mr-2">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="flex flex-col gap-6 pt-12">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
                                                <Truck className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-xl font-bold text-foreground">AgroTransport</span>
                                        </SheetTitle>
                                        <SheetDescription className="sr-only">
                                            Mobile navigation menu
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="flex flex-col gap-3">
                                        {navItems.map((item) => (
                                            <SheetClose asChild key={item.path}>
                                                <Link
                                                    to={item.path}
                                                    className={`text-lg font-medium transition-colors py-2 ${location.pathname === item.path
                                                        ? "text-green-700"
                                                        : "text-muted-foreground hover:text-green-700"
                                                        }`}
                                                >
                                                    {item.name}
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </div>

                                    <div className="mt-auto border-t pt-6 flex flex-col gap-3">
                                        {isLoggedIn ? (
                                            <SheetClose asChild>
                                                <Button size="lg" onClick={handleLogout} className="w-full text-red-600 border-red-200 hover:bg-red-50" variant="outline">
                                                    Logout
                                                </Button>
                                            </SheetClose>
                                        ) : (
                                            <>
                                                <SheetClose asChild>
                                                    <Link to="/login">
                                                        <Button variant="ghost" size="lg" className="w-full justify-start">
                                                            Log In
                                                        </Button>
                                                    </Link>
                                                </SheetClose>
                                                <SheetClose asChild>
                                                    <Link to="/register">
                                                        <Button size="lg" className="w-full bg-green-700 hover:bg-green-800">
                                                            Get Started
                                                        </Button>
                                                    </Link>
                                                </SheetClose>
                                            </>
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TransporterNavbar;
