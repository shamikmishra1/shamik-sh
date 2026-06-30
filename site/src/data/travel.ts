export interface Place {
  name: string;
  coords: [number, number];
  photos: string[];
  description: string;
  date?: string;
}

export interface Country {
  name: string;
  flag: string;
  coords: [number, number];
  places: Record<string, Place>;
}

// Photos go in: site/public/travel/<country>/<place>/
export const destinations: Record<string, Country> = {
  greece: {
    name: 'Greece',
    flag: '🇬🇷',
    coords: [39.0742, 21.8243],
    places: {
      meteora: {
        name: 'Meteora',
        coords: [39.7217, 21.6306],
        photos: ['meteora.jpg'],
        description: 'Monasteries on top of massive rock pillars. How did they even build these?',
        date: 'September 2024'
      }
    }
  },
  ireland: {
    name: 'Ireland',
    flag: '🇮🇪',
    coords: [53.1424, -7.6921],
    places: {
      'cliffs-of-moher': {
        name: 'Cliffs of Moher',
        coords: [52.9715, -9.4309],
        photos: ['cliffs1.jpg', 'cliffs2.jpg'],
        description: 'Standing at the edge of Europe. The wind tried to make it my last trip.',
        date: 'March 2023'
      }
    }
  },
  norway: {
    name: 'Norway',
    flag: '🇳🇴',
    coords: [60.472, 8.4689],
    places: {
      trolltunga: {
        name: 'Trolltunga',
        coords: [60.124, 6.74],
        photos: ['trolltunga.jpg'],
        description: 'A 10-hour hike for one photo. Worth it.',
        date: 'August 2022'
      }
    }
  }
};
