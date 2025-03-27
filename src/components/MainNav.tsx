
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import MpesaLogo from "./MpesaLogo";

const MainNav = () => {
  return (
    <div className="flex items-center justify-between py-4 px-4 md:px-6 lg:px-8 w-full">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <MpesaLogo className="h-8 w-8" />
          <span className="text-xl font-bold">
            Pesa<span className="text-green-600">Lytics</span>
          </span>
        </Link>
      </div>
      
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link to="/" className={navigationMenuTriggerStyle()}>
              Home
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Features</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      to="/demo"
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-green-50 to-green-100 p-6 no-underline outline-none focus:shadow-md"
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        Try PesaLytics Demo
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Experience how PesaLytics transforms M-PESA messages into beautiful reports.
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/features"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Reports</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Generate professional contribution reports
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/features"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      <div className="text-sm font-medium leading-none">Sharing</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Share reports directly to WhatsApp groups
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/pricing" className={navigationMenuTriggerStyle()}>
              Pricing
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/about" className={navigationMenuTriggerStyle()}>
              About
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium hover:underline hidden md:inline-block">
          Log in
        </Link>
        <Link to="/signup" className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors">
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default MainNav;
