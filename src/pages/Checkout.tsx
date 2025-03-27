import { useParams } from "react-router-dom";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

const Checkout = () => {
  const { planId } = useParams<{ planId: string }>();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <BackButton to="/pricing" label="Back to Pricing" />
        </div>
        
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
          <p className="mb-4">Selected plan: <span className="font-medium">{planId}</span></p>
          
          {/* Placeholder for checkout form */}
          <div className="p-6 bg-gray-50 rounded-md text-center">
            <p className="text-muted-foreground">M-Pesa checkout functionality will be implemented here.</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;
