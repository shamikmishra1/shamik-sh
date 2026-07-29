export interface Place {
  name: string;
  coords: [number, number];
  photos: string[];
  description: string;
}

export interface CountryData {
  name: string;
  flag: string;
  places: Record<string, Place>;
}

export interface YearData {
  [countryKey: string]: CountryData;
}

// Photos go in: site/public/travel/<year>/<country>/<place>/
export const destinations: Record<number, YearData> = {
  2026: {
    india: {
      name: 'India',
      flag: '🇮🇳',
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
  },
  2025: {
    italy: {
      name: 'Italy',
      flag: '🇮🇹',
      places: {
        rome: {
          name: 'Rome',
          coords: [41.9028, 12.4964],
          photos: [],
          description: '',
        },
        sorrento: {
          name: 'Sorrento',
          coords: [40.6263, 14.3758],
          photos: [],
          description: '',
        },
        positano: {
          name: 'Positano',
          coords: [40.6280, 14.4849],
          photos: [],
          description: 'Path of the Gods',
        },
        amalfi: {
          name: 'Amalfi',
          coords: [40.6340, 14.6027],
          photos: [],
          description: '',
        },
        pisa: {
          name: 'Pisa',
          coords: [43.7228, 10.4017],
          photos: [],
          description: '',
        },
        florence: {
          name: 'Florence',
          coords: [43.7696, 11.2558],
          photos: [],
          description: '',
        },
      },
    },
    norway: {
      name: 'Norway',
      flag: '🇳🇴',
      places: {
        hovden: {
          name: 'Hovden',
          coords: [59.5667, 7.3833],
          photos: [],
          description: '',
        },
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
        flam: {
          name: 'Flåm',
          coords: [60.8631, 7.1134],
          photos: [],
          description: '',
        },
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
    norway: {
      name: 'Norway',
      flag: '🇳🇴',
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
        norheimsund: {
          name: 'Norheimsund',
          coords: [60.3667, 6.1500],
          photos: [],
          description: '',
        },
      },
    },
    denmark: {
      name: 'Denmark',
      flag: '🇩🇰',
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
      places: {
        dublin: {
          name: 'Dublin',
          coords: [53.3498, -6.2603],
          photos: [],
          description: '',
        },
        galway: {
          name: 'Galway',
          coords: [53.2707, -9.0568],
          photos: [],
          description: '',
        },
        'cliffs-of-moher': {
          name: 'Cliffs of Moher',
          coords: [52.9715, -9.4309],
          photos: ['cliffs1.jpg', 'cliffs2.jpg'],
          description: 'Standing at the edge of Europe. The wind tried to make it my last trip.',
        },
        'ring-of-kerry': {
          name: 'Ring of Kerry',
          coords: [51.9450, -9.9650],
          photos: [],
          description: '',
        },
        killarney: {
          name: 'Killarney',
          coords: [52.0599, -9.5044],
          photos: [],
          description: '',
        },
        cork: {
          name: 'Cork',
          coords: [51.8985, -8.4756],
          photos: [],
          description: '',
        },
      },
    },
    india: {
      name: 'India',
      flag: '🇮🇳',
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
      places: {
        amsterdam: {
          name: 'Amsterdam',
          coords: [52.3676, 4.9041],
          photos: [],
          description: '',
        },
      },
    },
    spain: {
      name: 'Spain',
      flag: '🇪🇸',
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
      places: {
        santorini: {
          name: 'Santorini',
          coords: [36.3932, 25.4615],
          photos: [],
          description: '',
        },
        athens: {
          name: 'Athens',
          coords: [37.9838, 23.7275],
          photos: [],
          description: '',
        },
        kalambaka: {
          name: 'Kalambaka (Meteora)',
          coords: [39.7217, 21.6306],
          photos: ['meteora.jpg'],
          description: 'Monasteries on top of massive rock pillars. How did they even build these?',
        },
      },
    },
    norway: {
      name: 'Norway',
      flag: '🇳🇴',
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
    norway: {
      name: 'Norway',
      flag: '🇳🇴',
      places: {
        geilo: {
          name: 'Geilo',
          coords: [60.5345, 8.2063],
          photos: [],
          description: '',
        },
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
    norway: {
      name: 'Norway',
      flag: '🇳🇴',
      places: {
        tromso: {
          name: 'Tromsø',
          coords: [69.6492, 18.9553],
          photos: [],
          description: '',
        },
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
      places: {
        vik: {
          name: 'Vík',
          coords: [63.4186, -19.0060],
          photos: ['vik.jpeg'],
          description: 'Now I get why they filmed the moon landing here.',
        },
        reykjavik: {
          name: 'Reykjavík',
          coords: [64.1466, -21.9426],
          photos: [],
          description: '',
        },
        'golden-circle': {
          name: 'Golden Circle',
          coords: [64.3271, -20.1199],
          photos: [],
          description: '',
        },
        selfoss: {
          name: 'Selfoss',
          coords: [63.9331, -20.9971],
          photos: [],
          description: '',
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
          photos: [],
          description: '',
        },
        grindavik: {
          name: 'Grindavík',
          coords: [63.8422, -22.4328],
          photos: [],
          description: '',
        },
      },
    },
    france: {
      name: 'France',
      flag: '🇫🇷',
      places: {
        paris: {
          name: 'Paris',
          coords: [48.8566, 2.3522],
          photos: [],
          description: '',
        },
      },
    },
    germany: {
      name: 'Germany',
      flag: '🇩🇪',
      places: {
        stuttgart: {
          name: 'Stuttgart',
          coords: [48.7758, 9.1829],
          photos: [],
          description: '',
        },
      },
    },
  },
};

// Helper to get stats
export function getStats() {
  const countries = new Set<string>();
  let placeCount = 0;

  Object.values(destinations).forEach(yearData => {
    Object.entries(yearData).forEach(([countryKey, country]) => {
      countries.add(countryKey);
      placeCount += Object.keys(country.places).length;
    });
  });

  return { countryCount: countries.size, placeCount };
}
