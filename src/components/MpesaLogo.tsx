
import { cn } from "@/lib/utils";

interface MpesaLogoProps {
  className?: string;
}

const MpesaLogo = ({ className }: MpesaLogoProps) => {
  return (
    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white", className)}>
      <span className="font-bold">M</span>
    </div>
  );
};

export default MpesaLogo;
