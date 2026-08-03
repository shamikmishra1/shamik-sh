import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { destinations, Place, CountryData, getStats, getMonthName, getPhotoPath } from '../data/travel';

const MapContainer = styled.div`
  width: 100%;
  height: 450px;
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

const mediaStyles = `
  max-width: 100%;
  max-height: 350px;
  border-radius: 8px;
  margin-bottom: 10px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`;

const PlaceImage = styled.img`
  ${mediaStyles}
`;

const PlaceVideo = styled.video`
  ${mediaStyles}
`;

const isVideo = (filename: string) => /\.(mov|mp4|webm)$/i.test(filename);

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

const VisitSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const VisitButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => $active ? 'rgba(0, 255, 0, 0.3)' : 'rgba(0, 0, 0, 0.4)'};
  border: 1px solid ${({ $active }) => $active ? '#00ff00' : '#555'};
  color: ${({ $active }) => $active ? '#00ff00' : '#aaa'};
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;

  &:hover {
    background: rgba(0, 255, 0, 0.2);
    border-color: #00ff00;
  }
`;

interface Visit {
  year: number;
  tripKey: string;
  country: CountryData;
  placeKey: string;
  place: Place;
}

interface LocationGroup {
  coordKey: string;
  coords: [number, number];
  visits: Visit[];
}

export function TravelMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);
  const [visitIndex, setVisitIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  const { countryCount } = getStats();

  // Group all visits by coordinates
  const locationGroups = useRef<Map<string, LocationGroup>>(new Map());

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

    // Build location groups
    const groups = new Map<string, LocationGroup>();

    Object.entries(destinations).forEach(([yearStr, yearData]) => {
      const year = parseInt(yearStr);
      Object.entries(yearData).forEach(([tripKey, country]) => {
        Object.entries(country.places).forEach(([placeKey, place]) => {
          const coordKey = `${place.coords[0]},${place.coords[1]}`;

          if (!groups.has(coordKey)) {
            groups.set(coordKey, {
              coordKey,
              coords: place.coords,
              visits: []
            });
          }

          groups.get(coordKey)!.visits.push({
            year,
            tripKey,
            country,
            placeKey,
            place
          });
        });
      });
    });

    // Sort visits by year (oldest first)
    groups.forEach(group => {
      group.visits.sort((a, b) => a.year - b.year);
    });

    locationGroups.current = groups;

    // Create one marker per unique location
    groups.forEach((group) => {
      const marker = L.marker(group.coords, { icon: pinIcon }).addTo(map);

      // Show first visit's info in tooltip
      const firstVisit = group.visits[0];
      const visitCount = group.visits.length > 1 ? ` (${group.visits.length} visits)` : '';
      marker.bindTooltip(`${firstVisit.country.flag} ${firstVisit.place.name}${visitCount}`, {
        permanent: false,
        direction: 'top'
      });

      marker.on('click', () => {
        setSelectedLocation(group);
        setVisitIndex(0);
        setPhotoIndex(0);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const currentVisit = selectedLocation?.visits[visitIndex];

  const handlePrev = () => {
    setPhotoIndex(i => Math.max(0, i - 1));
  };

  const handleNext = () => {
    if (!currentVisit) return;
    setPhotoIndex(i => Math.min(currentVisit.place.photos.length - 1, i + 1));
  };

  const handleVisitChange = (index: number) => {
    setVisitIndex(index);
    setPhotoIndex(0);
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <MapContainer ref={mapRef} />
        <StatsOverlay>{countryCount} countries</StatsOverlay>
      </div>
      {selectedLocation && currentVisit ? (
        <PlaceCard>
          {selectedLocation.visits.length > 1 && (
            <VisitSelector>
              {selectedLocation.visits.map((visit, idx) => (
                <VisitButton
                  key={`${visit.year}-${visit.tripKey}`}
                  $active={idx === visitIndex}
                  onClick={() => handleVisitChange(idx)}
                >
                  {getMonthName(visit.country.month)} {visit.year}
                </VisitButton>
              ))}
            </VisitSelector>
          )}
          {currentVisit.place.photos.length > 0 && (
            <>
              <GalleryContainer>
                {isVideo(currentVisit.place.photos[photoIndex]) ? (
                  <PlaceVideo
                    key={getPhotoPath(
                      currentVisit.year,
                      currentVisit.country.month,
                      currentVisit.tripKey,
                      currentVisit.placeKey,
                      currentVisit.place.photos[photoIndex]
                    )}
                    src={getPhotoPath(
                      currentVisit.year,
                      currentVisit.country.month,
                      currentVisit.tripKey,
                      currentVisit.placeKey,
                      currentVisit.place.photos[photoIndex]
                    )}
                    autoPlay
                    muted
                    loop
                    playsInline
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <PlaceImage
                    src={getPhotoPath(
                      currentVisit.year,
                      currentVisit.country.month,
                      currentVisit.tripKey,
                      currentVisit.placeKey,
                      currentVisit.place.photos[photoIndex]
                    )}
                    alt={currentVisit.place.name}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                )}
                {currentVisit.place.photos.length > 1 && (
                  <>
                    <PrevButton onClick={handlePrev} disabled={photoIndex === 0}>
                      ‹
                    </PrevButton>
                    <NextButton
                      onClick={handleNext}
                      disabled={photoIndex === currentVisit.place.photos.length - 1}
                    >
                      ›
                    </NextButton>
                  </>
                )}
              </GalleryContainer>
              {currentVisit.place.photos.length > 1 && (
                <PhotoCounter>
                  {photoIndex + 1} / {currentVisit.place.photos.length}
                </PhotoCounter>
              )}
            </>
          )}
          <PlaceTitle>
            {currentVisit.country.flag} {currentVisit.place.name}, {currentVisit.country.name}
          </PlaceTitle>
          <PlaceDate>{getMonthName(currentVisit.country.month)} {currentVisit.year}</PlaceDate>
          {currentVisit.place.description && (
            <PlaceDescription>{currentVisit.place.description}</PlaceDescription>
          )}
        </PlaceCard>
      ) : (
        <Instructions>Click a pin to see photos and stories</Instructions>
      )}
    </div>
  );
}
