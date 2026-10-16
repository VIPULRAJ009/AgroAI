import { useLocation } from "react-router-dom";
import HomeNavbar from "./HomeNavbar";
import DefaultNavbar from "./DefaultNavbar";
import TransporterNavbar from "./TransporterNavbar";

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Check login status and role
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isTransporter = user?.role === "transporter";

  if (isHomePage) return <HomeNavbar />;
  if (isTransporter) return <TransporterNavbar />;

  return <DefaultNavbar />;
};

export default Navbar;
