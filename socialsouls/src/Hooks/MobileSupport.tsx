import { useEffect, useState } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
    setIsMobile(screen.width < 768);
    console.log(isMobile)
  }, []);

  return isMobile;
};