
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BackButtonProps {
  to: string;
  label?: string;
}

const BackButton = ({ to, label = "Back" }: BackButtonProps) => {
  return (
    <Button asChild variant="outline" size="sm">
      <Link to={to}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
};

export default BackButton;
