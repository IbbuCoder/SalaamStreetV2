// Product versions. Scale of the number reflects scale of the change:
//   1.01, 1.02 … small fixes        1.1, 1.2 … feature updates
//   1.34 … a bundle of small items  1.5 … larger update   2.0 … a new phase
export const APP_VERSION = '1.0';

export interface Release {
  version: string;
  title: string;
  status: 'current' | 'next' | 'planned' | 'vision';
  summary: string;
  items: string[];
}

export const RELEASES: Release[] = [
  {
    version: '1.0',
    title: 'The core Islamic website',
    status: 'current',
    summary: 'A calm, reliable foundation for everyday worship — on any device.',
    items: [
      'Accurate prayer times calculated on your device',
      'Simple daily prayer tracker',
      'Quran reader with translations, Juzʾ, search and bookmarks',
      'Qibla compass',
      'Duas & adhkar with sources',
      'Tasbih counter',
      'Hijri calendar and important dates',
      'Beginner learning guides',
    ],
  },
  {
    version: '1.1',
    title: 'Small improvements',
    status: 'next',
    summary: 'Polishing what is here, based on how people actually use it.',
    items: ['Prayer reminders in the browser', 'Iqamah times for your local masjid', 'More reading preferences for the Quran'],
  },
  {
    version: '1.2',
    title: 'More everyday tools',
    status: 'planned',
    summary: 'Additional tools that fit naturally into the daily routine.',
    items: ['Quran recitation audio', 'Ramadan mode with suhoor and iftar times', 'Expanded adhkar collections'],
  },
  {
    version: '1.3',
    title: 'Personal touches',
    status: 'planned',
    summary: 'Make SalaamStreet feel like yours.',
    items: ['Interface languages beyond English', 'Reading goals and khatm planner', 'More themes and Arabic fonts'],
  },
  {
    version: '1.5',
    title: 'A larger update',
    status: 'planned',
    summary: 'Deeper learning and optional accounts.',
    items: ['Optional account to sync across devices', 'Structured learning paths', 'Advanced notification options'],
  },
  {
    version: '2.0',
    title: 'The bigger SalaamStreet',
    status: 'vision',
    summary: 'A wider home for Muslims online — built carefully, one step at a time.',
    items: [
      'SalaamStreet mobile apps for iOS and Android',
      'The SalaamStreet shop for Islamic products',
      'Community features',
      'Advanced Islamic tools',
    ],
  },
];
