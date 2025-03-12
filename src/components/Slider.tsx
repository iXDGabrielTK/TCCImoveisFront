import React, { useState, useRef, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import "../styles/Slider.css";

interface SliderProps {
    images: string[];
}

const Slider: React.FC<SliderProps> = ({ images }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const timer = useRef<number | null>(null);
    const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
        loop: true,
        slides: {
            perView: 1,
        },
        slideChanged(s) {
            setCurrentSlide(s.track.details.rel);
        },
    });

    useEffect(() => {
        if (slider.current) {
            timer.current = window.setInterval(() => {
                slider.current?.next();
            }, 2000);
        }

        return () => {
            if (timer.current) window.clearInterval(timer.current);
        };
    }, [slider]);

    const handleImageLoad = () => {
        slider.current?.update();
    };

    const handlePrev = () => {
        slider.current?.prev();
    };

    const handleNext = () => {
        slider.current?.next();
    };

    if (!images.length) {
        return (
            <div className="no-image-available">
                <p>Sem imagens disponíveis</p>
            </div>
        );
    }

    return (
        <div className="slider-container">
            <div ref={sliderRef} className="keen-slider">
                {images.map((image, index) => (
                    <div key={index} className="keen-slider__slide">
                        <img
                            className="img-slider"
                            src={image}
                            alt={`Slide ${index + 1}`}
                            loading="lazy"
                            onLoad={handleImageLoad}
                        />
                    </div>
                ))}
            </div>

            <button onClick={handlePrev} className="navigation-button prev-button">
                <svg viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
            </button>
            <button onClick={handleNext} className="navigation-button next-button">
                <svg viewBox="0 0 24 24">
                    <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                </svg>
            </button>

            <div className="pagination">
                {slider.current &&
                    slider.current.track.details.slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => slider.current?.moveToIdx(idx)}
                            className={currentSlide === idx ? "active" : ""}
                        />
                    ))}
            </div>
        </div>
    );
};

export default Slider;