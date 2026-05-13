import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * PromotionBanner Component
 * Renders a full-width responsive carousel for multiple banners.
 */
const PromotionBanner = ({ banners = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, [banners.length]);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    // Auto-play
    useEffect(() => {
        if (isHovered || banners.length <= 1) return;
        
        const interval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isHovered, banners.length, nextSlide]);

    if (!banners || banners.length === 0) return null;

    return (
        <div 
            className="w-full relative overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides */}
            <div className="relative w-full overflow-hidden">
                <div 
                    className="flex transition-transform duration-700 ease-in-out" 
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {banners.map((banner, index) => (
                        <div key={banner._id || index} className="w-full shrink-0">
                            <a 
                                href={banner.linkUrl || "#"} 
                                className="relative block w-full overflow-hidden"
                            >
                                <picture>
                                    <source media="(min-width: 768px)" srcSet={banner.desktopImageUrl} />
                                    <img 
                                        src={banner.mobileImageUrl} 
                                        alt={banner.title || "Promotion"} 
                                        className="w-full h-auto block object-cover"
                                        loading={index === 0 ? "eager" : "lazy"}
                                    />
                                </picture>
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows (Only if multiple banners) */}
            {banners.length > 1 && (
                <>
                    <button 
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 z-20"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40 z-20"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Indicators/Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {banners.map((_, index) => (
                            <button 
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    currentIndex === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PromotionBanner;
