// Drop photos in: site/public/surprise/
// Name them anything: sunset.jpg, coffee.jpg, etc.
// Add entries here with the filename and caption

export interface SurprisePhoto {
  file: string;
  caption: string;
}

export interface SurpriseWebsite {
  url: string;
  desc: string;
}

export const photos: SurprisePhoto[] = [
  // { file: 'sunset.jpg', caption: 'Chasing sunsets in Bergen' },
  // { file: 'coffee.jpg', caption: 'Fuel for debugging' },
];

export const quotes = [
  '"The best way to predict the future is to invent it." - Alan Kay',
  '"Simplicity is the ultimate sophistication." - Leonardo da Vinci',
  '"First, solve the problem. Then, write the code." - John Johnson',
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler',
  '"It works on my machine." - Every developer ever',
];

export const websites: SurpriseWebsite[] = [
  { url: 'https://neal.fun', desc: 'Interactive experiments that waste your time beautifully' },
  { url: 'https://pudding.cool', desc: 'Visual essays on culture and society' },
  { url: 'https://explorabl.es', desc: 'Explorable explanations' },
  { url: 'https://www.windows93.net', desc: 'Windows 93 - the OS that never was' },
  { url: 'https://theuselessweb.com', desc: 'Take me somewhere useless' },
  { url: 'https://radio.garden', desc: 'Listen to radio stations around the world' },
  { url: 'https://www.musicforprogramming.net', desc: 'Music for programming' },
];
