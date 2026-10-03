// Major dates in the Islamic year (Hijri month / day). Gregorian dates are
// calculated with the Umm al-Qura calendar and may differ by a day locally,
// depending on moon sighting.
export interface IslamicEvent {
  id: string;
  name: string;
  month: number;
  day: number;
  description: string;
  /** Shown for observances whose date or practice is debated. */
  caution?: string;
}

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { id: 'new-year', name: 'Islamic New Year', month: 1, day: 1, description: 'The first day of Muharram begins the Hijri year.' },
  { id: 'ashura', name: 'Day of ʿAshura', month: 1, day: 10, description: 'Fasting on this day is a recommended Sunnah (Sahih Muslim 1162), along with the 9th or 11th.' },
  {
    id: 'isra-miraj',
    name: 'Al-Isra’ wal-Miʿraj',
    month: 7,
    day: 27,
    description: 'Commonly marked as the night of the Prophet’s ﷺ Night Journey and Ascension.',
    caution: 'Many communities mark 27 Rajab, but scholars differ on the historical date.',
  },
  { id: 'mid-shaban', name: '15th of Shaʿban', month: 8, day: 15, description: 'Observed by many Muslims as the middle night of Shaʿban.', caution: 'Practices on this night differ between communities and scholars.' },
  { id: 'ramadan', name: 'Ramadan begins', month: 9, day: 1, description: 'The month of fasting begins. The start is confirmed locally by moon sighting or announcement.' },
  { id: 'last-ten', name: 'Last ten nights of Ramadan', month: 9, day: 21, description: 'Laylat al-Qadr is sought in the last ten nights, especially the odd nights (Sahih al-Bukhari 2017).' },
  { id: 'eid-fitr', name: 'Eid al-Fitr', month: 10, day: 1, description: 'The festival marking the end of Ramadan. Fasting on this day is not permitted.' },
  { id: 'dhul-hijjah', name: 'First ten days of Dhu al-Hijjah', month: 12, day: 1, description: 'Among the most virtuous days of the year (Sahih al-Bukhari 969).' },
  { id: 'arafah', name: 'Day of ʿArafah', month: 12, day: 9, description: 'The pinnacle of Hajj. Fasting is recommended for those not on Hajj (Sahih Muslim 1162).' },
  { id: 'eid-adha', name: 'Eid al-Adha', month: 12, day: 10, description: 'The festival of sacrifice, during the days of Hajj.' },
];
