
import { Link } from "react-router-dom";
import MpesaLogo from "./MpesaLogo";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 py-12 text-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MpesaLogo className="h-8 w-8" />
              <span className="text-xl font-bold">PesaLytics</span>
            </div>
            <p className="text-slate-400">
              Transform M-PESA Messages into Beautiful Reports for your WhatsApp groups.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" className="text-slate-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="text-slate-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" className="text-slate-400 hover:text-white">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-slate-400 hover:text-white">Features</Link></li>
              <li><Link to="/pricing" className="text-slate-400 hover:text-white">Pricing</Link></li>
              <li><Link to="/demo" className="text-slate-400 hover:text-white">Demo</Link></li>
              <li><Link to="/templates" className="text-slate-400 hover:text-white">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-slate-400 hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-white">Contact</Link></li>
              <li><Link to="/careers" className="text-slate-400 hover:text-white">Careers</Link></li>
              <li><Link to="/blog" className="text-slate-400 hover:text-white">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-slate-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-slate-400 hover:text-white">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-400">© 2023 PesaLytics. All rights reserved.</p>
          <p className="text-sm text-slate-400 mt-4 md:mt-0">Made with ❤️ in Kenya</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
