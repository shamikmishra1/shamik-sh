import { useState } from 'react';
import styled from 'styled-components';
import { destinations, Place, CountryData, getStats, getMonthName, getPhotoPath } from '../data/travel';

const TimelineContainer = styled.div`
  padding: 10px 0;
`;

const StatsHeader = styled.div`
  margin-bottom: 20px;
  opacity: 0.7;
  font-size: 0.9em;
`;

const YearSection = styled.div`
  margin-bottom: 24px;
`;

const YearHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1.1em;
`;

const YearLine = styled.div`
  flex: 1;
  height: 1px;
  background: ${({ theme }) => theme.colors.primary};
  margin-left: 12px;
  opacity: 0.5;
`;

const YearLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
`;

const TripList = styled.div`
  margin-left: 20px;
  border-left: 2px solid ${({ theme }) => theme.colors.primary}33;
  padding-left: 20px;
`;

const TripItem = styled.div<{ $selected: boolean }>`
  position: relative;
  margin-bottom: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  background: ${({ $selected, theme }) => $selected ? theme.colors.primary + '22' : 'transparent'};
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}15;
  }

  &::before {
    content: '';
    position: absolute;
    left: -25px;
    top: 14px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const TripHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TripFlag = styled.span`
  font-size: 1.2em;
`;

const TripName = styled.span`
  font-weight: bold;
`;

const TripMeta = styled.span`
  opacity: 0.5;
  font-size: 0.85em;
  margin-left: auto;
`;

const TripDescription = styled.div`
  margin-top: 4px;
  opacity: 0.7;
  font-size: 0.9em;
`;

const PhotoSection = styled.div`
  margin-top: 12px;
  margin-left: 20px;
  border-left: 2px solid ${({ theme }) => theme.colors.primary}33;
  padding-left: 20px;
  padding-bottom: 8px;
`;

const GalleryContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const PlaceImage = styled.img`
  max-width: 100%;
  max-height: 350px;
  border-radius: 8px;
  margin-bottom: 8px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
`;

const PlaceVideo = styled.video`
  max-width: 100%;
  max-height: 350px;
  border-radius: 8px;
  margin-bottom: 8px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
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
  opacity: 0.5;
`;

interface SelectedTrip {
  year: number;
  tripKey: string;
  country: CountryData;
  placeKey: string;
  place: Place;
}

export function Timeline() {
  const [selectedTrip, setSelectedTrip] = useState<SelectedTrip | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const { countryCount, placeCount } = getStats();
  const years = Object.keys(destinations).map(Number).sort((a, b) => b - a);

  const handleSelectTrip = (year: number, tripKey: string, country: CountryData, placeKey: string, place: Place) => {
    if (selectedTrip?.year === year && selectedTrip?.tripKey === tripKey && selectedTrip?.placeKey === placeKey) {
      setSelectedTrip(null);
      setPhotoIndex(0);
    } else {
      setPhotoIndex(0);
      setSelectedTrip({ year, tripKey, country, placeKey, place });
    }
  };

  const handlePrev = () => setPhotoIndex(i => Math.max(0, i - 1));
  const handleNext = () => {
    if (!selectedTrip) return;
    setPhotoIndex(i => Math.min(selectedTrip.place.photos.length - 1, i + 1));
  };

  const getSortedTrips = (year: number) => {
    return Object.entries(destinations[year]).sort(([, a], [, b]) => b.month - a.month);
  };

  return (
    <TimelineContainer onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <StatsHeader>
        🌍 {countryCount} countries · {placeCount} places
      </StatsHeader>

      {years.map(year => (
        <YearSection key={year}>
          <YearHeader>
            <YearLabel>{year}</YearLabel>
            <YearLine />
          </YearHeader>
          <TripList>
            {getSortedTrips(year).map(([tripKey, country]) =>
              Object.entries(country.places).map(([placeKey, place]) => {
                const isSelected = selectedTrip?.year === year && selectedTrip?.tripKey === tripKey && selectedTrip?.placeKey === placeKey;
                return (
                  <div key={`${year}-${country.month}-${tripKey}-${placeKey}`}>
                    <TripItem
                      $selected={isSelected}
                      onClick={() => handleSelectTrip(year, tripKey, country, placeKey, place)}
                    >
                      <TripHeader>
                        <TripFlag>{country.flag}</TripFlag>
                        <TripName>{place.name}</TripName>
                        <TripMeta>{getMonthName(country.month)} · {country.name}</TripMeta>
                      </TripHeader>
                      {place.description && <TripDescription>{place.description}</TripDescription>}
                    </TripItem>

                    {isSelected && place.photos.length > 0 && (
                      <PhotoSection>
                        <GalleryContainer>
                          {place.photos[photoIndex].endsWith('.mov') ? (
                            <PlaceVideo
                              src={getPhotoPath(year, country.month, tripKey, placeKey, place.photos[photoIndex])}
                              autoPlay
                              muted
                              loop
                              playsInline
                              disablePictureInPicture
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          ) : (
                            <PlaceImage
                              src={getPhotoPath(year, country.month, tripKey, placeKey, place.photos[photoIndex])}
                              alt={place.name}
                              draggable={false}
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          )}
                          {place.photos.length > 1 && (
                            <>
                              <PrevButton onClick={handlePrev} disabled={photoIndex === 0}>
                                ‹
                              </PrevButton>
                              <NextButton
                                onClick={handleNext}
                                disabled={photoIndex === place.photos.length - 1}
                              >
                                ›
                              </NextButton>
                            </>
                          )}
                        </GalleryContainer>
                        {place.photos.length > 1 && (
                          <PhotoCounter>
                            {photoIndex + 1} / {place.photos.length}
                          </PhotoCounter>
                        )}
                      </PhotoSection>
                    )}
                  </div>
                );
              })
            )}
          </TripList>
        </YearSection>
      ))}
    </TimelineContainer>
  );
}
