
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import MpesaLogo from "./MpesaLogo";
import { useAuth } from "@/context/AuthContext";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";

const MainNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    setIsMenuOpen(false);
  };

  return (
    <header className={`w-full border-b ${scrolled ? 'border-border/40 bg-background/95 shadow-sm' : 'border-transparent bg-background/80'} backdrop-blur fixed top-0 z-50 transition-all duration-300`}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <MpesaLogo className="h-8 w-8" />
            <span className="text-xl font-bold">
              Pesa<span className="text-green-600">Lytics</span>
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="block md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/demo" className={`${navigationMenuTriggerStyle()} ${location.pathname === '/demo' ? 'bg-accent/50' : ''}`}>
                  Demo
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/pricing" className={`${navigationMenuTriggerStyle()} ${location.pathname === '/pricing' ? 'bg-accent/50' : ''}`}>
                  Pricing
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/templates" className={`${navigationMenuTriggerStyle()} ${location.pathname === '/templates' ? 'bg-accent/50' : ''}`}>
                  Templates
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/financial-tools" className={`${navigationMenuTriggerStyle()} ${location.pathname === '/financial-tools' ? 'bg-accent/50' : ''}`}>
                  Financial Tools
                </Link>
              </NavigationMenuItem>
              
              {user && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Account</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-3 p-4">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/dashboard" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                            <div className="text-sm font-medium">Dashboard</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Access your reports and insights
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <button 
                            onClick={handleLogout}
                            className="block w-full text-left select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <div className="text-sm font-medium">Logout</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              Sign out of your account
                            </p>
                          </button>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {user ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 z-50 flex flex-col p-4 border-b border-border/40 bg-background md:hidden">
            <nav className="grid gap-2">
              <Link
                to="/demo"
                className={`flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${location.pathname === '/demo' ? 'bg-accent/50' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Demo
              </Link>
              <Link
                to="/pricing"
                className={`flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${location.pathname === '/pricing' ? 'bg-accent/50' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/templates"
                className={`flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${location.pathname === '/templates' ? 'bg-accent/50' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Templates
              </Link>
              <Link
                to="/financial-tools"
                className={`flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${location.pathname === '/financial-tools' ? 'bg-accent/50' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Financial Tools
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-md ${location.pathname === '/dashboard' ? 'bg-accent/50' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="mt-2"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default MainNav;
