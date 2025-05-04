import React, { useState } from "react";
import { IconButton, Box } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";

interface SliderProps {
    images: string[];
}

const Slider: React.FC<SliderProps> = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextImage = () => {
        setCurrentIndex((prevIndex) => {
            const next = prevIndex === images.length - 1 ? 0 : prevIndex + 1;
            console.log("Próxima imagem:", next);
            return next;
        });
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) => {
            const prev = prevIndex === 0 ? images.length - 1 : prevIndex - 1;
            console.log("Imagem anterior:", prev);
            return prev;
        });
    };
    return (
        <Box
            sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                overflow: "hidden",
                borderRadius: 0,
                backgroundColor: "#000",
            }}
        >
            {images.length > 0 ? (
                <img
                    src={images[currentIndex]}
                    alt={`Imagem ${currentIndex + 1}`}
                    onError={(e) =>
                        (e.currentTarget.src = "https://via.placeholder.com/600x400?text=Imagem+Indisponível")
                    }
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "inherit",
                    }}
                />
            ) : (
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#fff",
                        fontSize: "1.2rem",
                    }}
                >
                    Nenhuma imagem disponível
                </Box>
            )}

            <IconButton
                onClick={prevImage}
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: 8,
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    color: "#fff",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                    zIndex: 10,
                }}
            >
                <ArrowBackIosNew />
            </IconButton>

            <IconButton
                onClick={nextImage}
                sx={{
                    position: "absolute",
                    top: "50%",
                    right: 8,
                    transform: "translateY(-50%)",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    color: "#fff",
                    "&:hover": { backgroundColor: "rgba(0,0,0,0.6)" },
                    zIndex: 10,
                }}
            >
                <ArrowForwardIos />
            </IconButton>
        </Box>
    );
};

export default Slider;
