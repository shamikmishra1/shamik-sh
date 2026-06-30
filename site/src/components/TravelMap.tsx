import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { destinations, Country, Place } from '../data/travel';

const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 8px;
  margin: 10px 0;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  position: relative;
`;

const StatsOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.85em;
  z-index: 1000;
  pointer-events: none;
`;

const PlaceCard = styled.div`
  margin-top: 15px;
`;

const GalleryContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const PlaceImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const GalleryNav = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.2em;
  border-radius: 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

const PrevButton = styled(GalleryNav)`
  left: 5px;
`;

const NextButton = styled(GalleryNav)`
  right: 5px;
`;

const PhotoCounter = styled.div`
  font-size: 0.8em;
  opacity: 0.7;
  margin-bottom: 8px;
`;

const PlaceTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const PlaceDate = styled.div`
  font-size: 0.85em;
  opacity: 0.6;
  margin-bottom: 8px;
`;

const PlaceDescription = styled.div`
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.9;
`;

const Instructions = styled.div`
  margin-top: 10px;
  opacity: 0.7;
  font-size: 0.9em;
`;

export function TravelMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<{
    country: Country;
    place: Place;
    countryKey: string;
    placeKey: string;
  } | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const countryCount = Object.keys(destinations).length;
  const placeCount = Object.values(destinations).reduce(
    (sum, c) => sum + Object.keys(c.places).length, 0
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([45, 10], 3);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-pin',
      html: `<svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#00ff00"/>
        <circle cx="12" cy="12" r="5" fill="#000"/>
      </svg>`,
      iconSize: [24, 36],
      iconAnchor: [12, 36],
      popupAnchor: [0, -36]
    });

    Object.entries(destinations).forEach(([countryKey, country]) => {
      Object.entries(country.places).forEach(([placeKey, place]) => {
        const marker = L.marker(place.coords, { icon: pinIcon }).addTo(map);

        marker.bindTooltip(`${country.flag} ${place.name}`, {
          permanent: false,
          direction: 'top'
        });

        marker.on('click', () => {
          setSelectedPlace({ country, place, countryKey, placeKey });
          setPhotoIndex(0);
        });
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handlePrev = () => {
    setPhotoIndex(i => Math.max(0, i - 1));
  };

  const handleNext = () => {
    if (!selectedPlace) return;
    setPhotoIndex(i => Math.min(selectedPlace.place.photos.length - 1, i + 1));
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <MapContainer ref={mapRef} />
        <StatsOverlay>{countryCount} countries · {placeCount} places</StatsOverlay>
      </div>
      {selectedPlace ? (
        <PlaceCard>
          <GalleryContainer>
            <PlaceImage
              src={`/travel/${selectedPlace.countryKey}/${selectedPlace.placeKey}/${selectedPlace.place.photos[photoIndex]}`}
              alt={selectedPlace.place.name}
            />
            {selectedPlace.place.photos.length > 1 && (
              <>
                <PrevButton onClick={handlePrev} disabled={photoIndex === 0}>
                  ‹
                </PrevButton>
                <NextButton
                  onClick={handleNext}
                  disabled={photoIndex === selectedPlace.place.photos.length - 1}
                >
                  ›
                </NextButton>
              </>
            )}
          </GalleryContainer>
          {selectedPlace.place.photos.length > 1 && (
            <PhotoCounter>
              {photoIndex + 1} / {selectedPlace.place.photos.length}
            </PhotoCounter>
          )}
          <PlaceTitle>
            {selectedPlace.country.flag} {selectedPlace.place.name}, {selectedPlace.country.name}
          </PlaceTitle>
          {selectedPlace.place.date && (
            <PlaceDate>{selectedPlace.place.date}</PlaceDate>
          )}
          <PlaceDescription>{selectedPlace.place.description}</PlaceDescription>
        </PlaceCard>
      ) : (
        <Instructions>Click a pin to see photos and stories</Instructions>
      )}
    </div>
  );
}
