// src/components/Slider.tsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/Slider.css';

interface SliderProps {
    images: string[];
}

function Slider({ images }: SliderProps) {
    return (
        <div className="slider-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                loop
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <img className="img-slider" src={image} alt={`Slide ${index + 1}`} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default Slider;
