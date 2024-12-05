import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/Slider.css";

interface SliderProps {
    images: string[];
}

function Slider({ images }: SliderProps) {
    if (!images.length) {
        return (
            <div className="no-image-available">
                <p>Sem imagens disponíveis</p>
            </div>
        );
    }

    return (
        <div className="slider-container">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 2000 }}
                loop={true}
                style={{
                    width: "100%", // Ocupa 100% do contêiner
                    height: "100%", // Adapta a altura ao contêiner
                }}
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
