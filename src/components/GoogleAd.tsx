
import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  className?: string;
}

const GoogleAd: React.FC<GoogleAdProps> = ({ className }) => {
  // Update ref type to HTMLModElement which is the correct type for <ins> elements
  const adRef = useRef<HTMLModElement>(null);

  // Initialize and render ad when component mounts
  useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      
      if (adRef.current && adsbygoogle) {
        adsbygoogle.push({});
      }
    } catch (error) {
      console.error('Error loading Google ad:', error);
    }
  }, []);

  return (
    <div className={className || ''}>
      {/* Google AdSense Ad */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-placeholder" // Replace with actual ad client
        data-ad-slot="placeholder" // Replace with actual ad slot
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default GoogleAd;
