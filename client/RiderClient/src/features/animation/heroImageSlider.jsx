import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HeroImageSlider = () => {
  const [index, setIndex] = useState(0);
  const images = [
    "https://i.ibb.co/Fbww5b4y/image-1.png",
    "https://i.ibb.co/XZzSG1YB/image-2.png",
    "https://i.ibb.co/jvDhhtCj/image-5.png",
    "https://i.ibb.co/bjZz1db6/Gemini-Generated-Image-4tg6ro4tg6ro4tg6.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000); // change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={index}
          src={images[index]}
          alt="Yumy delivery"
          className="w-full h-full object-cover absolute"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>
    </div>
  );
};

export default HeroImageSlider;
