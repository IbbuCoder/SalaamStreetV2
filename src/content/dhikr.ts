// Common dhikr for the Tasbih counter. Each phrase is short and widely known;
// references point to well-known narrations that mention it.
export interface Dhikr {
  id: string;
  arabic: string;
  translit: string;
  meaning: string;
  target: number;
}

export const DHIKR: Dhikr[] = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللَّهِ', translit: 'Subḥānallāh', meaning: 'Glory be to Allah', target: 33 },
  { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', translit: 'Alḥamdulillāh', meaning: 'Praise be to Allah', target: 33 },
  { id: 'allahuakbar', arabic: 'اللَّهُ أَكْبَرُ', translit: 'Allāhu akbar', meaning: 'Allah is the Greatest', target: 33 },
  { id: 'tahlil', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', translit: 'Lā ilāha illallāh', meaning: 'There is no god but Allah', target: 100 },
  { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', translit: 'Astaghfirullāh', meaning: 'I seek the forgiveness of Allah', target: 100 },
  { id: 'subhanallah-wa-bihamdihi', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translit: 'Subḥānallāhi wa biḥamdih', meaning: 'Glory be to Allah and praise be to Him', target: 100 },
  { id: 'hawqala', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', translit: 'Lā ḥawla wa lā quwwata illā billāh', meaning: 'There is no might nor power except with Allah', target: 33 },
  { id: 'salawat', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', translit: 'Allāhumma ṣalli ʿalā Muḥammad', meaning: 'O Allah, send blessings upon Muhammad', target: 10 },
];
