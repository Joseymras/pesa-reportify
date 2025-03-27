
import { Link } from "react-router-dom";
import MpesaLogo from "@/components/MpesaLogo";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import RegistrationWithPayment from "@/components/RegistrationWithPayment";

const Signup = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="mb-6 flex items-center gap-2">
          <MpesaLogo className="h-8 w-8" />
          <h1 className="text-2xl font-bold">
            Pesa<span className="text-green-600">Lytics</span>
          </h1>
        </div>
        
        <RegistrationWithPayment />
        
        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Signup;
