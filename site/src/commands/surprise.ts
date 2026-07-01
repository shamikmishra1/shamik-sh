import { photos, quotes, websites } from '../data/surprise';

type SurpriseType = 'photo' | 'quote' | 'website';

export function surprise(): string {
  const types: SurpriseType[] = [];

  if (photos.length > 0) types.push('photo');
  if (quotes.length > 0) types.push('quote');
  if (websites.length > 0) types.push('website');

  if (types.length === 0) {
    return 'No surprises configured yet!';
  }

  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case 'photo': {
      const photo = photos[Math.floor(Math.random() * photos.length)];
      return `<img:/surprise/${photo.file}>
${photo.caption}`;
    }
    case 'quote': {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      return `
${quote}`;
    }
    case 'website': {
      const site = websites[Math.floor(Math.random() * websites.length)];
      return `
${site.desc}
→ ${site.url}`;
    }
    default:
      return 'Something went wrong!';
  }
}
