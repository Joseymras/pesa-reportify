
import { useEffect, useRef } from "react";

interface GoogleAdProps {
  className?: string;
}

const GoogleAd = ({ className = "" }: GoogleAdProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (error) {
      console.error("Error loading Google ad:", error);
    }
  }, []);

  return (
    <div className={`my-6 ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2454303086985182"
        data-ad-slot="7671202922"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;
