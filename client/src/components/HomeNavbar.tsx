import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sprout, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useEffect, useState } from "react";

const HomeNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        navigate("/");
    };

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "Crop Recommender", path: "/crop-recommender" },
        { name: "Fertilizer", path: "/fertilizer-prediction" },

        { name: "Weather", path: "/weather" },
    ];

    return (
        <div className="fixed z-50 bg-transparent pt-6 pr-6 pb-6 pl-6 top-0 right-0 left-0">
            <div
                className="max-w-6xl border border-gray-200 rounded-full mr-auto ml-auto pt-3 pr-6 pb-3 pl-6 bg-white/80 backdrop-blur-xl shadow-sm transition-colors duration-300"
            >
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <Sprout className="text-green-600 h-6 w-6" />
                        <span className="font-bold text-lg tracking-tight text-gray-900">AgroAI</span>
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`hover:text-green-700 transition-colors duration-300 px-4 py-2 rounded-full hover:bg-green-50/50 ${location.pathname === item.path ? "text-green-700 bg-green-50/50" : ""
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-1.5 md:gap-2">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="hidden md:block px-5 py-2.5 rounded-full text-xs font-semibold border border-gray-200 hover:border-green-600 hover:text-green-700 transition-all duration-300"
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="hidden md:flex gap-2">
                                <Link to="/login">
                                    <button className="px-5 py-2.5 rounded-full text-xs font-semibold border border-gray-200 hover:border-green-600 hover:text-green-700 transition-all duration-300">
                                        Login
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="px-5 py-2.5 rounded-full text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-300">
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button - Implemented with Sheet */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <button
                                    className="inline-flex md:hidden hover:bg-black/5 p-2 rounded-full transition-all duration-300"
                                    aria-label="Menu"
                                >
                                    <Menu className="w-5 h-5 text-gray-700" />
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="flex flex-col gap-6 pt-12">
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        <Sprout className="text-green-600 h-6 w-6" />
                                        <span className="font-bold text-xl tracking-tight text-gray-900">AgroAI</span>
                                    </SheetTitle>
                                    <SheetDescription className="sr-only">
                                        Mobile navigation menu
                                    </SheetDescription>
                                </SheetHeader>

                                <ul className="flex flex-col gap-3 font-medium text-lg">
                                    {navItems.map((item) => (
                                        <li key={item.path}>
                                            <SheetClose asChild>
                                                <Link
                                                    to={item.path}
                                                    className={`hover:text-green-700 transition-colors w-full block py-2 ${location.pathname === item.path ? "text-green-700 font-semibold" : "text-gray-600"
                                                        }`}
                                                >
                                                    {item.name}
                                                </Link>
                                            </SheetClose>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto border-t pt-6 flex flex-col gap-3">
                                    {isLoggedIn ? (
                                        <SheetClose asChild>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-5 py-3 rounded-full font-semibold border border-gray-200 hover:border-red-600 hover:text-red-700 transition-all duration-300 flex items-center justify-center gap-2"
                                            >
                                                Logout
                                            </button>
                                        </SheetClose>
                                    ) : (
                                        <>
                                            <SheetClose asChild>
                                                <Link to="/login" className="w-full">
                                                    <button className="w-full px-5 py-3 rounded-full font-semibold border border-gray-200 hover:border-green-600 hover:text-green-700 transition-all duration-300">
                                                        Login
                                                    </button>
                                                </Link>
                                            </SheetClose>
                                            <SheetClose asChild>
                                                <Link to="/register" className="w-full">
                                                    <button className="w-full px-5 py-3 rounded-full font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-300">
                                                        Get Started
                                                    </button>
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
    );
};

export default HomeNavbar;
