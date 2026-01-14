import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import penguGif from "../../../assets/pengu-pudgy.gif";

const ClosedRestaurantModal = ({ open, onClose, restaurant }) => {
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        initial={{ scale: 0.8, y: 80, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 80, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 120, damping: 15 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b bg-gradient-to-r from-orange-50 to-red-50">
                            <motion.h3 
                                className="text-lg font-semibold text-gray-800"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                            >
                                <motion.span
                                    className="inline-block"
                                    animate={{ 
                                        scale: [1, 1.05, 1],
                                        color: ['#1f2937', '#ea580c', '#1f2937']
                                    }}
                                    transition={{ 
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                >
                                    <div className="mb-2 items-center">
                                        {restaurant?.name || "Restaurant"}
                                    </div>
                                </motion.span>
                                {" "}
                                <div>
                                is currently closed</div>
                            </motion.h3>
                            <button
                                aria-label="Close"
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 hover:rotate-90 transition-all duration-300 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-5 pt-4 pb-5 bg-gradient-to-r from-orange-50 to-red-70">
                            <motion.p 
                                className="text-gray-700 mb-4"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                We love your vibe 💛 This place is taking a short break.
                                Good food is worth the wait!
                            </motion.p>

                            {/* Animated Media: prefer video, then restaurant GIF, then default GIF, then CSS animation */}
                            {restaurant?.closedAnimationUrl ? (
                                <video
                                    src={restaurant.closedAnimationUrl}
                                    className="w-full rounded-lg"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                />
                            ) : restaurant?.closedGifUrl ? (
                                <motion.img
                                    src={restaurant.closedGifUrl}
                                    alt="Closed restaurant animation"
                                    className="w-full rounded-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                />
                            ) : penguGif ? (
                                <motion.img
                                    src={penguGif}
                                    alt="Good vibes animation"
                                    className="w-25 rounded-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                />
                            ) : (
                                <motion.div
                                    className="w-full h-40 rounded-lg bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 relative overflow-hidden"
                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                >
                                    <motion.div
                                        className="absolute inset-0 bg-white/30"
                                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <div className="absolute bottom-3 left-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg p-3 text-center">
                    <span className="text-sm font-semibold text-gray-800">
                      ✨ Chill mode on — we’ll be back soon!
                    </span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Actions */}
                            <motion.div 
                                className="mt-5 flex items-center justify-end gap-3"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <motion.button
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-lg border border-orange-300 text-orange-700 font-medium bg-gradient-to-r from-orange-50 to-red-70 shadow-sm"
                                    whileHover={{ 
                                        scale: 1.05,
                                        boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
                                        borderColor: "#ea580c"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    Got it 👍
                                </motion.button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ClosedRestaurantModal;
