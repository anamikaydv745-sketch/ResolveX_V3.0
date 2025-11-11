import { Leaf, User, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown
import AccessibilityControls from "@/components/AccessibilityControls";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth hook
import { LoginButton } from "@/components/LoginButton"; // Import LoginButton
import sudharLogo from "@/assets/sudhaar_logo.png";


// US EPA AQI Breakpoints for PM2.5
function calculateAqiPm25(pm25: number) {
  const breakpoints = [
    { concentrationLow: 0.0,  concentrationHigh: 12.0,   aqiLow: 0,   aqiHigh: 50 },
    { concentrationLow: 12.1, concentrationHigh: 35.4,   aqiLow: 51,  aqiHigh: 100 },
    { concentrationLow: 35.5, concentrationHigh: 55.4,   aqiLow: 101, aqiHigh: 150 },
    { concentrationLow: 55.5, concentrationHigh: 150.4,  aqiLow: 151, aqiHigh: 200 },
    { concentrationLow: 150.5,concentrationHigh: 250.4,  aqiLow: 201, aqiHigh: 300 },
    { concentrationLow: 250.5,concentrationHigh: 350.4,  aqiLow: 301, aqiHigh: 400 },
    { concentrationLow: 350.5,concentrationHigh: 500.4,  aqiLow: 401, aqiHigh: 500 },
  ];
  for (const bp of breakpoints) {
    if (pm25 >= bp.concentrationLow && pm25 <= bp.concentrationHigh) {
      return Math.round(
        ((bp.aqiHigh - bp.aqiLow)/(bp.concentrationHigh - bp.concentrationLow)) * (pm25 - bp.concentrationLow)
        + bp.aqiLow
      );
    }
  }
  return null; // Out of range
}

// --- AQI Meter Component using computed AQI ---
const AQIMeter: React.FC = () => {
  const [aqi, setAqi] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // IMPORTANT: Make sure VITE_WEATHER_API_KEY is in your .env.local file
  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY as string;

  useEffect(() => {
    if (!WEATHER_API_KEY) {
      setError("No API key");
      setLoading(false);
      console.error("VITE_WEATHER_API_KEY is not set.");
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            // Fetch air pollution data
            const aqiRes = await fetch(
              `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
            );
            const aqiData = await aqiRes.json();
            const pm25 = aqiData?.list?.[0]?.components?.pm2_5;
            const computedAqi = pm25 !== undefined ? calculateAqiPm25(pm25) : null;
            setAqi(computedAqi);

            // Reverse geocoding for location name
            const geoRes = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${WEATHER_API_KEY}`
            );
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              const loc = geoData[0];
              const name = loc.name;
              const state = loc.state ? `, ${loc.state}` : "";
              const country = loc.country ? `, ${loc.country}` : "";
              setLocationName(`${name}${state}${country}`);
            } else {
              setLocationName("Unknown Location");
            }
            setLoading(false);
          } catch (err) {
            setError("API error.");
            setLoading(false);
            console.error("AQI/Geo API Error:", err);
          }
        },
        () => {
          setError("Location denied");
          setLoading(false);
        }
      );
    } else {
      setError("No geolocation");
      setLoading(false);
    }
  }, [WEATHER_API_KEY]);

  // Color scale based on AQI
  let bgColor = "bg-gray-400"; // Default loading/error color
  if (aqi !== null && !error) {
    if (aqi > 300) bgColor = "bg-purple-700";
    else if (aqi > 200) bgColor = "bg-red-700";
    else if (aqi > 150) bgColor = "bg-red-500";
    else if (aqi > 100) bgColor = "bg-orange-500";
    else if (aqi > 50) bgColor = "bg-yellow-400";
    else bgColor = "bg-green-500";
  } else if (error) {
    bgColor = "bg-gray-500";
  }

  return (
    <div
      className={`
        flex items-center gap-2 rounded shadow transition-colors
        px-2 py-1 ml-4
        w-auto h-10
        md:max-w-xs md:px-3 md:py-2 md:h-auto
        ${bgColor}
      `}
      style={{ minWidth: 0 }}
    >
      {/* AQI value: always shown */}
      <span className="font-semibold text-white text-base md:text-lg">AQI:</span>
      {loading ? (
        <span className="animate-pulse text-white text-base md:text-lg">...</span>
      ) : error ? (
        <span className="text-white text-xs md:text-sm">{error}</span>
      ) : (
        <span className="text-white font-bold text-base md:text-xl">{aqi}</span>
      )}

      {/* Location: only on desktop */}
      {locationName && !loading && !error && (
        <span className="hidden md:inline-block ml-3 text-xs text-white/80 truncate max-w-[120px]">
          {locationName}
        </span>
      )}

      {/* Source: only on desktop */}
      {!loading && !error && (
        <span className="hidden md:inline-block text-[10px] text-white/50 ml-1">
          (PM2.5)
        </span>
      )}
    </div>
  );
};


// --- Header Component ---
const Header: React.FC = () => {
  const { user, logout } = useAuth(); // Get user and logout from context

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Report Waste", path: "/report-waste" },
    { name: "Water Testing", path: "/water-testing" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Track Reports", path: "/trackreports" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 transition-base hover:opacity-80">
            
            <img
    src={sudharLogo}
    alt="Sudhar Logo"
    className="h-48 w-auto object-contain"
  />
          </Link>
          <AQIMeter /> {/* Your AQI meter is included here */}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-base"
            >
              {link.name}
            </Link>
          ))}
          <AccessibilityControls />

          {/* === AUTHENTICATION LOGIC FOR DESKTOP === */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* You can map over user-specific links here */}
                <DropdownMenuItem>My Reports</DropdownMenuItem>
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout}> {/* Use onSelect for safety */}
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginButton />
          )}
          {/* === END AUTH LOGIC === */}

        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-lg font-medium text-muted-foreground hover:text-primary transition-base"
                >
                  {link.name}
                </Link>
              ))}
              
              {/* === AUTHENTICATION LOGIC FOR MOBILE === */}
              <div className="flex flex-col gap-2 mt-4">
                <AccessibilityControls />
                {user ? (
                  <div className="flex-1 mt-4 border-t pt-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="h-9 w-9 rounded-full"
                        />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    {/* Mobile Menu Links */}
                    <Button variant="outline" className="w-full mb-2">My Reports</Button>
                    <Button variant="outline" className="w-full mb-2">Profile Settings</Button>
                    <Button variant="ghost" className="w-full" onClick={logout}>
                      Log out
                    </Button>
                  </div>
                ) : (
                  <LoginButton isMobile />
                )}
              </div>
              {/* === END AUTH LOGIC === */}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;