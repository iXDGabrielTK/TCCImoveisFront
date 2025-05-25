import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Snackbar, Alert } from '@mui/material';
import { useMap } from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, IconButton, Tooltip } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

interface MapaEnderecoProps {
    enderecoCompleto: string;
}

const SetMapInstance = ({ onMapReady }: { onMapReady: (map: L.Map) => void }) => {
    const map = useMap();

    useEffect(() => {
        onMapReady(map);
    }, [map, onMapReady]);

    return null;
};

const MapaEndereco: React.FC<MapaEnderecoProps> = ({ enderecoCompleto }) => {
    const [coords, setCoords] = useState<[number, number] | null>(null);
    const [map, setMap] = useState<L.Map | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const customIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const handleCentralizarMapa = () => {
        console.log("BOTÃO PRESSIONADO");
        if (coords && map) {
            map.flyTo(coords, map.getZoom(), {
                animate: true,
                duration: 0.75,
            });
            setSnackbarOpen(true);
        } else {
            console.warn("map ou coords estão indefinidos!", map, coords);
        }
    };

    useEffect(() => {
        if (map) console.log("map DEFINIDO corretamente:", map);
    }, [map]);

    useEffect(() => {
        const fetchCoords = async () => {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`
            );
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                setCoords([parseFloat(lat), parseFloat(lon)]);
            }
        };

        void fetchCoords();
    }, [enderecoCompleto]);

    if (!coords) {
        return <div className="mapa-card">Localizando endereço...</div>;
    }

    return (
        <Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    Mapa centralizado!
                </Alert>
            </Snackbar>
            <Box className="mapa-card">
                <Box sx={{ position: 'relative' }}>
                    {coords && (
                        <MapContainer
                            center={coords}
                            zoom={16}
                            scrollWheelZoom={false}
                            style={{ height: '300px', width: '100%', borderRadius: '8px' }}
                            className="leaflet-container"
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={coords} icon={customIcon}>
                                <Popup>{enderecoCompleto}</Popup>
                            </Marker>

                            <SetMapInstance onMapReady={setMap} />
                        </MapContainer>
                    )}
                    <Tooltip title="Centralizar no mapa">
                        <IconButton
                            onClick={ handleCentralizarMapa}
                            sx={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                zIndex: 1000,
                                backgroundColor: 'white',
                                boxShadow: 3,
                                '&:hover': {
                                    backgroundColor: '#f0f0f0',
                                },
                            }}
                        >
                            <MyLocationIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
};

export default MapaEndereco;
