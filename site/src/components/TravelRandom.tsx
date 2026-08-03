import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { destinations, getPhotoPath, getMonthName } from '../data/travel';

const Container = styled.div`
  padding: 10px 0;
`;

const GalleryContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const mediaStyles = `
  max-width: 100%;
  max-height: 350px;
  border-radius: 8px;
  margin-bottom: 8px;
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
  margin-bottom: 12px;
`;

const PlaceInfo = styled.div`
  margin-bottom: 8px;
`;

const PlaceName = styled.div`
  font-size: 1.1em;
`;

const PlaceDate = styled.div`
  opacity: 0.7;
  font-size: 0.9em;
`;

const PlaceDescription = styled.div`
  margin: 12px 0;
  opacity: 0.8;
`;

const Hint = styled.div`
  margin-top: 12px;
  opacity: 0.5;
  font-size: 0.9em;
`;

const isVideo = (filename: string) => /\.(mov|mp4|webm)$/i.test(filename);

interface RandomPlace {
  year: number;
  month: number;
  tripKey: string;
  country: string;
  flag: string;
  placeKey: string;
  place: { name: string; coords: [number, number]; photos: string[]; description: string };
}

function getRandomPlace(): RandomPlace {
  const allPlaces: RandomPlace[] = [];

  Object.entries(destinations).forEach(([yearStr, yearData]) => {
    const year = parseInt(yearStr);
    Object.entries(yearData).forEach(([tripKey, country]) => {
      Object.entries(country.places).forEach(([placeKey, place]) => {
        allPlaces.push({
          year,
          month: country.month,
          tripKey,
          country: country.name,
          flag: country.flag,
          placeKey,
          place,
        });
      });
    });
  });

  return allPlaces[Math.floor(Math.random() * allPlaces.length)];
}

export function TravelRandom() {
  const randomPlace = useMemo(() => getRandomPlace(), []);
  const [photoIndex, setPhotoIndex] = useState(0);

  const { year, month, tripKey, country, flag, placeKey, place } = randomPlace;
  const photos = place.photos;
  const currentPhoto = photos[photoIndex];
  const photoPath = getPhotoPath(year, month, tripKey, placeKey, currentPhoto);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex(i => Math.max(0, i - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex(i => Math.min(photos.length - 1, i + 1));
  };

  return (
    <Container onClick={(e) => e.stopPropagation()}>
      <GalleryContainer>
        {isVideo(currentPhoto) ? (
          <PlaceVideo
            key={photoPath}
            src={photoPath}
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <PlaceImage
            src={photoPath}
            alt={place.name}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}
        {photos.length > 1 && (
          <>
            <PrevButton onClick={handlePrev} disabled={photoIndex === 0}>
              ‹
            </PrevButton>
            <NextButton onClick={handleNext} disabled={photoIndex === photos.length - 1}>
              ›
            </NextButton>
          </>
        )}
      </GalleryContainer>
      {photos.length > 1 && (
        <PhotoCounter>
          {photoIndex + 1} / {photos.length}
        </PhotoCounter>
      )}
      <PlaceInfo>
        <PlaceName>{flag} {place.name}, {country}</PlaceName>
        <PlaceDate>{getMonthName(month)} {year}</PlaceDate>
      </PlaceInfo>
      <PlaceDescription>{place.description}</PlaceDescription>
      <Hint>Type 'travel random' again for another destination, or 'travel' for the map.</Hint>
    </Container>
  );
}
