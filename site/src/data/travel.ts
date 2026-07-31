export interface Place {
  name: string;
  coords: [number, number];
  photos: string[];
  description: string;
}

export interface CountryData {
  name: string;
  flag: string;
  month: number;
  places: Record<string, Place>;
}

export interface YearData {
  [tripKey: string]: CountryData;
}

const MONTH_NAMES = ['', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_DISPLAY = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function getMonthFolder(month: number): string {
  return MONTH_NAMES[month] || '';
}

export function getMonthName(month: number): string {
  return MONTH_DISPLAY[month] || '';
}

export const destinations: Record<number, YearData> = {
  2026: {
    india: {
      name: 'India',
      flag: '🇮🇳',
      month: 4, // April
      places: {
        patna: {
          name: 'Patna',
          coords: [25.5941, 85.1376],
          photos: [],
          description: '',
        },
        ranchi: {
          name: 'Ranchi',
          coords: [23.3441, 85.3096],
          photos: [],
          description: '',
        },
        bengaluru: {
          name: 'Bengaluru',
          coords: [12.9716, 77.5946],
          photos: [],
          description: '',
        },
      },
    },
    poland: {
      name: 'Poland',
      flag: '🇵🇱',
      month: 5, // May
      places: {
        gdansk: {
          name: 'Gdańsk',
          coords: [54.3520, 18.6466],
          photos: ['old-town.jpg', 'lion-fountain.jpg'],
          description: 'Rebuilt from rubble after WWII. You\'d never know.',
        },
        sopot: {
          name: 'Sopot',
          coords: [54.4418, 18.5601],
          photos: ['lighthouse.jpg', 'crooked-house.jpg'],
          description: 'A beach town with a building that looks drunk.',
        },
      },
    },
  },
  2025: {
    italy: {
      name: 'Italy',
      flag: '🇮🇹',
      month: 4, // April
      places: {
        rome: {
          name: 'Rome',
          coords: [41.9028, 12.4964],
          photos: ['colosseum.jpg', 'trevi-fountain.jpg', 'roman-forum.jpg', 'vatican-staircase.jpg', 'vatican-courtyard.jpg', 'piazza-venezia.jpg'],
          description: 'Threw a coin in the Trevi Fountain. Now legally obligated to return.',
        },
        sorrento: {
          name: 'Sorrento',
          coords: [40.6263, 14.3758],
          photos: ['marina.jpg'],
          description: 'Home base for the coast. Limoncello on every corner.',
        },
        positano: {
          name: 'Positano',
          coords: [40.6280, 14.4849],
          photos: ['welcome-sign.jpg', 'cliffside-terraces.jpg', 'sea-view.jpg', 'trail-signs.jpg', 'colorful-buildings.jpg'],
          description: 'Walked the Path of the Gods. Felt more like Path of the Sore Calves.',
        },
        ravello: {
          name: 'Ravello',
          coords: [40.6492, 14.6117],
          photos: ['hillside-view.jpg', 'bay-boats.jpg', 'villa-cimbrone.jpg', 'villa-view.jpg'],
          description: 'Gardens with infinity views. Wagner composed here. I just napped.',
        },
        amalfi: {
          name: 'Amalfi',
          coords: [40.6340, 14.6027],
          photos: ['cathedral-steps.jpg', 'town-from-sea.jpg', 'waterfront.jpg'],
          description: 'Arrived by boat. Left by carb coma.',
        },
        pisa: {
          name: 'Pisa',
          coords: [43.7228, 10.4017],
          photos: ['leaning-tower-pose.jpg', 'arno-river.jpg'],
          description: 'Did the tourist pose. Zero regrets.',
        },
        florence: {
          name: 'Florence',
          coords: [43.7696, 11.2558],
          photos: ['duomo-dome.jpg', 'duomo-facade.jpg', 'ponte-vecchio.jpg', 'david-statue.jpg', 'vivoli-gelato.jpg'],
          description: 'Renaissance art, a naked David, and gelato so good it should be in a museum too.',
        },
      },
    },
    'norway-may': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 5, // May
      places: {
        hovden: {
          name: 'Hovden',
          coords: [59.5667, 7.3833],
          photos: ['card-game-scorecard.jpg', 'roadside-stop.mov'],
          description: 'Mishras vs Hansas. Final score: +14 to -3. Some rivalries are settled with cards, not swords.',
        },
      },
    },
    'norway-jul': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 7, // July
      places: {
        trolltunga: {
          name: 'Trolltunga',
          coords: [60.1240, 6.7400],
          photos: ['trolltunga.jpg'],
          description: 'A 10-hour hike for one photo. Worth it.',
        },
        myrdal: {
          name: 'Myrdal',
          coords: [60.7369, 7.1214],
          photos: [],
          description: '',
        },
      },
    },
    'norway-aug': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 8, // August
      places: {
        flam: {
          name: 'Flåm',
          coords: [60.8631, 7.1134],
          photos: [],
          description: '',
        },
      },
    },
    'norway-sep': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 9, // September
      places: {
        voringsfossen: {
          name: 'Vøringsfossen',
          coords: [60.4194, 6.9972],
          photos: [],
          description: '',
        },
        steinsdalsfossen: {
          name: 'Steinsdalsfossen',
          coords: [60.3567, 6.1142],
          photos: [],
          description: '',
        },
        voss: {
          name: 'Voss',
          coords: [60.6281, 6.4167],
          photos: [],
          description: '',
        },
        hardangerfjord: {
          name: 'Hardangerfjord',
          coords: [60.4100, 6.5500],
          photos: [],
          description: '',
        },
        honefoss: {
          name: 'Hønefoss',
          coords: [60.1686, 10.2578],
          photos: [],
          description: '',
        },
      },
    },
  },
  2024: {
    'norway-jan': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 1, // January
      places: {
        myrdal: {
          name: 'Myrdal',
          coords: [60.7369, 7.1214],
          photos: [],
          description: '',
        },
        flam: {
          name: 'Flåm',
          coords: [60.8631, 7.1134],
          photos: [],
          description: '',
        },
      },
    },
    'norway-may': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 5, // May
      places: {
        viksdalen: {
          name: 'Viksdalen',
          coords: [61.3214, 5.8906],
          photos: [],
          description: '',
        },
        kosedalsvingen: {
          name: 'Kosedalsvingen',
          coords: [60.1833, 6.5667],
          photos: [],
          description: '',
        },
      },
    },
    denmark: {
      name: 'Denmark',
      flag: '🇩🇰',
      month: 5, // May
      places: {
        copenhagen: {
          name: 'Copenhagen',
          coords: [55.6761, 12.5683],
          photos: [],
          description: 'Conference trip',
        },
      },
    },
    ireland: {
      name: 'Ireland',
      flag: '🇮🇪',
      month: 8, // August
      places: {
        dublin: {
          name: 'Dublin',
          coords: [53.3498, -6.2603],
          photos: ['guinness-storehouse.mov', 'street-singer.mov'],
          description: 'Guinness Storehouse taught me beer is art. Fish on bicycles included.',
        },
        'croke-park': {
          name: 'Croke Park',
          coords: [53.3631, -6.2514],
          photos: ['coldplay-live.mov', 'coldplay-crowd.mov'],
          description: 'Coldplay happened. 80,000 people singing Yellow under a Dublin sky. The kind of night you tell people about for years. And when Fix You hit, I wasn\'t ready. Nobody ever is.',
        },
        galway: {
          name: 'Galway',
          coords: [53.2707, -9.0568],
          photos: ['kylemore-abbey.jpg', 'pollacappul-lough.mov'],
          description: 'A castle built for love. Now run by Benedictine nuns. Same energy.',
        },
        'cliffs-of-moher': {
          name: 'Cliffs of Moher',
          coords: [52.9715, -9.4309],
          photos: ['cliffs1.jpg', 'cliffs2.jpg', 'panorama.jpg'],
          description: 'Standing at the edge of Europe. The wind tried to make it my last trip.',
        },
        'ring-of-kerry': {
          name: 'Ring of Kerry',
          coords: [51.9450, -9.9650],
          photos: ['derrynane-beach.jpg', 'kerry-cliffs.jpg', 'coastal-headland.jpg', 'irish-sheep.jpg', 'kerry-cliffs-viewpoint.jpg'],
          description: 'Derrynane Beach. Zero phone signal. Perfect.',
        },
        bray: {
          name: 'Bray',
          coords: [53.2008, -6.0986],
          photos: ['yellow-boats.jpg'],
          description: 'Pebble beach and colorful boats. A quick escape from Dublin.',
        },
        sneem: {
          name: 'Sneem',
          coords: [51.8306, -9.8989],
          photos: ['little-library.jpg'],
          description: 'Found a tiny free library in a village of 700 people. Ireland gets it.',
        },
        killarney: {
          name: 'Killarney',
          coords: [52.0599, -9.5044],
          photos: ['street-food.jpg', 'brehon-hotel.jpg'],
          description: 'Home base for the Ring of Kerry. The Brehon Hotel spa fixed what the cliffs broke.',
        },
        cork: {
          name: 'Cork',
          coords: [51.8985, -8.4756],
          photos: [],
          description: '',
        },
      },
    },
    'norway-sep': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 9, // September
      places: {
        norheimsund: {
          name: 'Norheimsund',
          coords: [60.3667, 6.1500],
          photos: [],
          description: '',
        },
      },
    },
    india: {
      name: 'India',
      flag: '🇮🇳',
      month: 11, // November
      places: {
        delhi: {
          name: 'Delhi',
          coords: [28.6139, 77.2090],
          photos: [],
          description: '',
        },
        bengaluru: {
          name: 'Bengaluru',
          coords: [12.9716, 77.5946],
          photos: [],
          description: '',
        },
      },
    },
    germany: {
      name: 'Germany',
      flag: '🇩🇪',
      month: 12, // December
      places: {
        frankfurt: {
          name: 'Frankfurt',
          coords: [50.1109, 8.6821],
          photos: [],
          description: '',
        },
      },
    },
  },
  2023: {
    netherlands: {
      name: 'Netherlands',
      flag: '🇳🇱',
      month: 9, // September
      places: {
        amsterdam: {
          name: 'Amsterdam',
          coords: [52.3676, 4.9041],
          photos: ['van-gogh-immersive.mov'],
          description: 'Walked into a Van Gogh painting. Literally.',
        },
      },
    },
    spain: {
      name: 'Spain',
      flag: '🇪🇸',
      month: 9, // September
      places: {
        ibiza: {
          name: 'Ibiza',
          coords: [38.9067, 1.4206],
          photos: [],
          description: '',
        },
      },
    },
    india: {
      name: 'India',
      flag: '🇮🇳',
      month: 11, // November
      places: {
        delhi: {
          name: 'Delhi',
          coords: [28.6139, 77.2090],
          photos: [],
          description: 'Shivangi\'s engagement',
        },
      },
    },
  },
  2022: {
    india: {
      name: 'India',
      flag: '🇮🇳',
      month: 1, // January
      places: {
        tirupati: {
          name: 'Tirupati',
          coords: [13.6288, 79.4192],
          photos: [],
          description: '',
        },
      },
    },
    greece: {
      name: 'Greece',
      flag: '🇬🇷',
      month: 4, // April
      places: {
        santorini: {
          name: 'Santorini',
          coords: [36.3932, 25.4615],
          photos: ['oia-sunset.jpg', 'caldera-terraces.jpg', 'coffee-view.jpg', 'church-silhouette.jpg', 'oia-portrait.jpg', 'night-lights.jpg', 'caldera-cruise.jpg', 'hotel-morning.jpg'],
          description: 'Sunsets so good you forget you paid €15 for a coffee to watch them.',
        },
        athens: {
          name: 'Athens',
          coords: [37.9838, 23.7275],
          photos: ['parthenon.jpg', 'odeon-interior.jpg', 'odeon-exterior.jpg', 'odeon-wide.jpg', 'olympic-stadium.jpg', 'city-panorama.jpg'],
          description: '2,500 years of history. Still using some of the same buildings.',
        },
        kalambaka: {
          name: 'Kalambaka (Meteora)',
          coords: [39.7217, 21.6306],
          photos: ['meteora.jpg', 'varlaam-monastery.jpg', 'monastery-cliff.jpg', 'monastery-pillar.jpg', 'monastery-distant.jpg'],
          description: 'Monasteries on top of massive rock pillars. How did they even build these?',
        },
      },
    },
    norway: {
      name: 'Norway',
      flag: '🇳🇴',
      month: 7, // July
      places: {
        flam: {
          name: 'Flåm',
          coords: [60.8631, 7.1134],
          photos: [],
          description: '',
        },
      },
    },
  },
  2021: {
    'norway-jan': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 1, // January
      places: {
        geilo: {
          name: 'Geilo',
          coords: [60.5345, 8.2063],
          photos: [],
          description: '',
        },
      },
    },
    'norway-jul': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 7, // July
      places: {
        odda: {
          name: 'Odda',
          coords: [60.0695, 6.5453],
          photos: [],
          description: '',
        },
        bondhusdalen: {
          name: 'Bondhusdalen',
          coords: [60.0544, 6.3417],
          photos: [],
          description: '',
        },
        steinsdalsfossen: {
          name: 'Steinsdalsfossen',
          coords: [60.3567, 6.1142],
          photos: [],
          description: '',
        },
      },
    },
    india: {
      name: 'India',
      flag: '🇮🇳',
      month: 12, // December
      places: {
        bengaluru: {
          name: 'Bengaluru',
          coords: [12.9716, 77.5946],
          photos: [],
          description: '',
        },
      },
    },
  },
  2020: {
    spain: {
      name: 'Spain',
      flag: '🇪🇸',
      month: 1, // January
      places: {
        alicante: {
          name: 'Alicante',
          coords: [38.3452, -0.4810],
          photos: [],
          description: '',
        },
        barcelona: {
          name: 'Barcelona',
          coords: [41.3851, 2.1734],
          photos: [],
          description: '',
        },
      },
    },
    'norway-feb': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 2, // February
      places: {
        tromso: {
          name: 'Tromsø',
          coords: [69.6492, 18.9553],
          photos: [],
          description: '',
        },
      },
    },
    'norway-jul': {
      name: 'Norway',
      flag: '🇳🇴',
      month: 7, // July
      places: {
        ulvik: {
          name: 'Ulvik',
          coords: [60.5683, 6.9128],
          photos: [],
          description: '',
        },
      },
    },
  },
  2019: {
    iceland: {
      name: 'Iceland',
      flag: '🇮🇸',
      month: 7, // July
      places: {
        vik: {
          name: 'Vík',
          coords: [63.4186, -19.0060],
          photos: ['basalt-columns.jpg'],
          description: 'Black sand beach with basalt columns. Game of Thrones vibes without the dragons.',
        },
        reykjavik: {
          name: 'Reykjavík',
          coords: [64.1466, -21.9426],
          photos: ['hallgrimskirkja.jpg', 'statue.jpg'],
          description: 'The world\'s northernmost capital. Colorful houses and quirky statues.',
        },
        'golden-circle': {
          name: 'Golden Circle',
          coords: [64.3271, -20.1199],
          photos: ['gullfoss.jpg', 'kerid-crater.jpg', 'silfra.jpg', 'strokkur.jpg', 'geysir.jpg', 'faxi-1.jpg', 'countryside.jpg'],
          description: 'Geysers, waterfalls, tectonic plates, and snorkeling between continents. Iceland\'s greatest hits in one day.',
        },
        seljalandsfoss: {
          name: 'Seljalandsfoss',
          coords: [63.6156, -19.9886],
          photos: ['seljalandsfoss.jpg'],
          description: 'The waterfall you can walk behind. Bring a raincoat.',
        },
        'blue-lagoon': {
          name: 'Blue Lagoon',
          coords: [63.8804, -22.4495],
          photos: ['bluelagon.jpeg'],
          description: 'Hot springs in the middle of a lava field. Tourist trap? Yes. Worth it? Also yes.',
        },
        'katla-caves': {
          name: 'Katla Caves',
          coords: [63.5934, -19.1025],
          photos: ['ice-arch.jpg', 'glacier-lagoon.jpg', 'glacier-hike.jpg', 'glacier-crevasse.jpg'],
          description: 'Walking inside a glacier. Black ice from volcanic ash. Surreal.',
        },
      },
    },
    france: {
      name: 'France',
      flag: '🇫🇷',
      month: 10, // October
      places: {
        paris: {
          name: 'Paris',
          coords: [48.8566, 2.3522],
          photos: [
            'palais-royal.jpg',
            'eiffel-tower-day.jpg',
            'eiffel-tower-night.jpg',
            'colonnes-de-buren.jpg',
          ],
          description: 'Took 200 photos of the Eiffel Tower. Kept 2.',
        },
      },
    },
    germany: {
      name: 'Germany',
      flag: '🇩🇪',
      month: 10, // October
      places: {
        stuttgart: {
          name: 'Stuttgart',
          coords: [48.7758, 9.1829],
          photos: ['flight-sunset.jpg'],
          description: 'The city where cars are religion and pretzels are breakfast.',
        },
      },
    },
  },
  1993: {
    india: {
      name: 'India',
      flag: '🇮🇳',
      month: 8, // August
      places: {
        ranchi: {
          name: 'Ranchi',
          coords: [23.3441, 85.3096],
          photos: [],
          description: 'Where it all began.',
        },
      },
    },
  },
};

// Helper to get the country folder from a tripKey
export function getCountryFolder(tripKey: string): string {
  return tripKey.includes('-') ? tripKey.split('-')[0] : tripKey;
}

// Helper to build the photo path
export function getPhotoPath(year: number, month: number, tripKey: string, placeKey: string, photo: string): string {
  const monthFolder = getMonthFolder(month);
  const countryFolder = getCountryFolder(tripKey);
  return `/travel/${year}/${monthFolder}/${countryFolder}/${placeKey}/${photo}`;
}

// Helper to get stats
export function getStats() {
  const countries = new Set<string>();
  let placeCount = 0;

  Object.values(destinations).forEach(yearData => {
    Object.entries(yearData).forEach(([tripKey, country]) => {
      const countryKey = getCountryFolder(tripKey);
      countries.add(countryKey);
      placeCount += Object.keys(country.places).length;
    });
  });

  return { countryCount: countries.size, placeCount };
}
