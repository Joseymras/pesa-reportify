
import { Link } from "react-router-dom";
import MpesaLogo from "@/components/MpesaLogo";

export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-10">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-12 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <MpesaLogo className="h-6 w-6" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ by the{" "}
            <Link to="/" className="font-medium underline underline-offset-4">
              PesaLytics
            </Link>{" "}
            team. © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-sm text-muted-foreground">
          <Link to="/templates" className="hover:underline">Templates</Link>
          <Link to="/pricing" className="hover:underline">Pricing</Link>
          <Link to="/financial-tools" className="hover:underline">Financial Tools</Link>
        </div>
      </div>
    </footer>
  );
}
