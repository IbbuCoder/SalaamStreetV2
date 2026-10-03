// Basic Islamic learning. Content sticks to matters that are broadly agreed upon,
// cites primary sources, and flags where the schools of law (madhhabs) differ.
// It is an introduction, not a replacement for learning from a qualified teacher.

export type Block =
  | { type: 'p'; text: string }
  | { type: 'steps'; items: { title: string; text?: string; arabic?: string; translit?: string }[] }
  | { type: 'list'; items: string[] }
  | { type: 'terms'; items: { term: string; arabic?: string; def: string }[] }
  | { type: 'note'; text: string }
  | { type: 'link'; text: string; to: string };

export interface LearnSection {
  heading: string;
  blocks: Block[];
}

export interface LearnTopic {
  id: string;
  title: string;
  arabic: string;
  summary: string;
  level: 'Beginner' | 'Essentials';
  sections: LearnSection[];
  sources: string[];
}

export const LEARN_TOPICS: LearnTopic[] = [
  {
    id: 'pillars',
    title: 'The Five Pillars',
    arabic: 'أركان الإسلام',
    summary: 'The foundations of a Muslim’s practice, as taught by the Prophet ﷺ.',
    level: 'Beginner',
    sections: [
      {
        heading: 'Islam is built on five',
        blocks: [
          {
            type: 'p',
            text: 'The Prophet ﷺ said that Islam is built upon five: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing the prayer, giving zakah, Hajj, and fasting in Ramadan.',
          },
          {
            type: 'steps',
            items: [
              {
                title: 'Shahadah — the testimony of faith',
                arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ',
                translit: 'Ash-hadu an lā ilāha illallāh, wa ash-hadu anna Muḥammadan rasūlullāh',
                text: 'I testify that there is no god but Allah, and I testify that Muhammad is the Messenger of Allah.',
              },
              { title: 'Salah — prayer', text: 'Five obligatory prayers each day at their appointed times.' },
              { title: 'Zakah — obligatory charity', text: 'A set portion of qualifying wealth given yearly to those entitled to it, once wealth reaches a minimum threshold (nisab).' },
              { title: 'Sawm — fasting in Ramadan', text: 'Abstaining from food, drink and marital relations from true dawn (Fajr) until sunset (Maghrib) throughout the month of Ramadan.' },
              { title: 'Hajj — pilgrimage to Makkah', text: 'Once in a lifetime for every adult Muslim who is physically and financially able.' },
            ],
          },
        ],
      },
      {
        heading: 'The six articles of faith',
        blocks: [
          { type: 'p', text: 'In the well-known hadith of Jibril, iman (faith) is described as believing in:' },
          { type: 'list', items: ['Allah', 'His angels', 'His books', 'His messengers', 'The Last Day', 'Divine decree (qadar), its good and its bad'] },
        ],
      },
    ],
    sources: ['Sahih al-Bukhari 8 · Sahih Muslim 16 (five pillars)', 'Sahih Muslim 8 (hadith of Jibril)'],
  },
  {
    id: 'wudu',
    title: 'Wudu (Ablution)',
    arabic: 'الوضوء',
    summary: 'The ritual washing required before prayer and touching the Mushaf.',
    level: 'Essentials',
    sections: [
      {
        heading: 'What the Quran requires',
        blocks: [
          {
            type: 'p',
            text: 'Allah commands in Surah al-Maʾidah (5:6): wash the face, wash the arms up to the elbows, wipe over the head, and wash the feet up to the ankles. These four are obligatory by agreement of the scholars.',
          },
          { type: 'link', text: 'Read Surah al-Maʾidah 5:6', to: '/quran/5?ayah=6' },
        ],
      },
      {
        heading: 'How to perform wudu',
        blocks: [
          { type: 'p', text: 'This order follows the description of the Prophet’s ﷺ wudu narrated by ʿUthman ibn ʿAffan.' },
          {
            type: 'steps',
            items: [
              { title: 'Intention', text: 'Intend in your heart to perform wudu for the sake of Allah. It is not spoken aloud.' },
              { title: 'Say “Bismillah”', arabic: 'بِسْمِ اللَّهِ' },
              { title: 'Wash the hands', text: 'Wash both hands up to the wrists, three times.' },
              { title: 'Rinse the mouth and nose', text: 'Rinse the mouth, then draw water into the nose and blow it out — three times.' },
              { title: 'Wash the face', text: 'From the hairline to the chin and from ear to ear, three times.' },
              { title: 'Wash the arms', text: 'Wash the right arm up to and including the elbow three times, then the left.' },
              { title: 'Wipe the head', text: 'Pass wet hands over the head from front to back and back again, then wipe the ears.' },
              { title: 'Wash the feet', text: 'Wash the right foot up to and including the ankle three times, then the left, cleaning between the toes.' },
            ],
          },
          {
            type: 'note',
            text: 'Washing each part three times is Sunnah; once is the minimum. Details such as whether wiping the whole head is required differ between the schools.',
          },
        ],
      },
      {
        heading: 'After wudu',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Testimony after wudu',
                arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
                translit: 'Ash-hadu an lā ilāha illallāhu waḥdahū lā sharīka lah, wa ash-hadu anna Muḥammadan ʿabduhū wa rasūluh',
                text: 'I testify that there is no god but Allah alone, without partner, and I testify that Muhammad is His servant and Messenger.',
              },
            ],
          },
        ],
      },
      {
        heading: 'What breaks wudu',
        blocks: [
          { type: 'p', text: 'Things that break wudu by broad agreement include:' },
          {
            type: 'list',
            items: [
              'Anything leaving the private parts (urine, stool, wind)',
              'Deep sleep, especially lying down',
              'Loss of consciousness',
            ],
          },
          { type: 'note', text: 'Other matters — such as bleeding, vomiting, or touching the private parts — are treated differently by the schools. Follow the guidance of your scholars.' },
        ],
      },
    ],
    sources: ['Quran 5:6', 'Sahih al-Bukhari 159 · Sahih Muslim 226 (wudu of ʿUthman)', 'Sahih Muslim 234 (testimony after wudu)'],
  },
  {
    id: 'salah',
    title: 'How to Pray',
    arabic: 'الصلاة',
    summary: 'The five daily prayers, what is needed beforehand, and the movements of each rakʿah.',
    level: 'Essentials',
    sections: [
      {
        heading: 'The five daily prayers',
        blocks: [
          {
            type: 'terms',
            items: [
              { term: 'Fajr', arabic: 'الفجر', def: '2 rakʿahs — from true dawn until sunrise' },
              { term: 'Dhuhr', arabic: 'الظهر', def: '4 rakʿahs — after the sun passes its zenith' },
              { term: 'Asr', arabic: 'العصر', def: '4 rakʿahs — in the afternoon' },
              { term: 'Maghrib', arabic: 'المغرب', def: '3 rakʿahs — just after sunset' },
              { term: 'Isha', arabic: 'العشاء', def: '4 rakʿahs — once twilight has disappeared' },
            ],
          },
          { type: 'link', text: 'See today’s prayer times', to: '/prayer' },
        ],
      },
      {
        heading: 'Before you pray',
        blocks: [
          {
            type: 'list',
            items: [
              'Be in a state of purity (wudu, or ghusl when required)',
              'Clean body, clothing and place of prayer',
              'Cover the ʿawrah (the parts of the body required to be covered)',
              'Face the Qibla — the direction of the Kaʿbah in Makkah',
              'The time of the prayer has begun',
              'Make the intention for the specific prayer',
            ],
          },
          { type: 'link', text: 'Find the Qibla', to: '/qibla' },
        ],
      },
      {
        heading: 'The movements of one rakʿah',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Opening takbir', arabic: 'اللَّهُ أَكْبَرُ', translit: 'Allāhu akbar', text: 'Raise the hands and say “Allah is the Greatest” to begin the prayer.' },
              { title: 'Standing (qiyam)', text: 'Recite Surah al-Fatihah. In the first two rakʿahs, recite another surah or some verses after it.' },
              { title: 'Bowing (rukuʿ)', arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', translit: 'Subḥāna rabbiyal-ʿaẓīm', text: 'Bow with the back straight and say “Glory be to my Lord, the Most Great”, usually three times.' },
              { title: 'Rising', arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ', translit: 'Samiʿallāhu liman ḥamidah, rabbanā wa lakal-ḥamd', text: 'Rise to standing: “Allah hears the one who praises Him. Our Lord, and to You is all praise.”' },
              { title: 'Prostration (sujud)', arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى', translit: 'Subḥāna rabbiyal-aʿlā', text: 'Prostrate with forehead, nose, palms, knees and toes on the ground: “Glory be to my Lord, the Most High”, usually three times.' },
              { title: 'Sitting, then a second prostration', text: 'Sit briefly, then prostrate a second time. This completes one rakʿah.' },
            ],
          },
        ],
      },
      {
        heading: 'Sitting and finishing',
        blocks: [
          {
            type: 'p',
            text: 'After every second rakʿah, sit and recite the tashahhud. In the final sitting, add the salawat upon the Prophet ﷺ (as-Salat al-Ibrahimiyyah) and then end the prayer by turning the head to the right and to the left, saying:',
          },
          { type: 'steps', items: [{ title: 'Taslim', arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', translit: 'As-salāmu ʿalaykum wa raḥmatullāh' }] },
          {
            type: 'note',
            text: 'Details such as hand placement, what is recited silently or aloud, and some positions differ between the four schools. All are based on evidence — learn one method well from a trusted teacher.',
          },
          { type: 'link', text: 'Read Surah al-Fatihah', to: '/quran/1' },
          { type: 'link', text: 'Remembrance after the prayer', to: '/duas/after-salah' },
        ],
      },
    ],
    sources: ['Sahih al-Bukhari 631 (“Pray as you have seen me praying”)', 'Sahih Muslim 772 (dhikr in rukuʿ and sujud)', 'Sahih al-Bukhari 757 (the man who prayed badly)'],
  },
  {
    id: 'ghusl',
    title: 'Ghusl (Full Bath)',
    arabic: 'الغسل',
    summary: 'The full ritual bath: when it is required and how it is done.',
    level: 'Essentials',
    sections: [
      {
        heading: 'When ghusl is required',
        blocks: [
          {
            type: 'list',
            items: [
              'After sexual intercourse or the discharge of sexual fluid',
              'When menstruation ends',
              'When post-natal bleeding ends',
              'For the deceased (washed by others)',
            ],
          },
          { type: 'note', text: 'Ghusl when embracing Islam and before Jumuʿah is emphasised; the schools differ on whether it is obligatory or strongly recommended.' },
        ],
      },
      {
        heading: 'How to perform ghusl',
        blocks: [
          { type: 'p', text: 'This follows the description of the Prophet’s ﷺ ghusl narrated by ʿAishah and Maymunah.' },
          {
            type: 'steps',
            items: [
              { title: 'Intention', text: 'Intend in your heart to purify yourself.' },
              { title: 'Say “Bismillah” and wash the hands' },
              { title: 'Wash the private parts', text: 'Remove any impurity from the body.' },
              { title: 'Perform wudu', text: 'Perform wudu as for prayer.' },
              { title: 'Wash the head', text: 'Pour water over the head three times, working it into the roots of the hair.' },
              { title: 'Wash the whole body', text: 'Pour water over the rest of the body, starting with the right side, then the left, making sure water reaches every part.' },
            ],
          },
          {
            type: 'note',
            text: 'The minimum is that water reaches the entire body. The Hanafi school also requires rinsing the mouth and nose.',
          },
        ],
      },
    ],
    sources: ['Quran 5:6', 'Sahih al-Bukhari 248 · Sahih Muslim 316 (ghusl of the Prophet ﷺ, narrated by ʿAishah)', 'Sahih al-Bukhari 249 (narrated by Maymunah)'],
  },
  {
    id: 'terms',
    title: 'Islamic Terms',
    arabic: 'مصطلحات',
    summary: 'Common words you will hear in the masjid and in everyday Muslim life.',
    level: 'Beginner',
    sections: [
      {
        heading: 'Worship',
        blocks: [
          {
            type: 'terms',
            items: [
              { term: 'Salah', arabic: 'صلاة', def: 'The ritual prayer, performed five times a day.' },
              { term: 'Wudu', arabic: 'وضوء', def: 'Ablution — washing specific parts of the body before prayer.' },
              { term: 'Ghusl', arabic: 'غسل', def: 'The full ritual bath.' },
              { term: 'Qibla', arabic: 'قبلة', def: 'The direction of the Kaʿbah in Makkah, faced in prayer.' },
              { term: 'Adhan', arabic: 'أذان', def: 'The call to prayer.' },
              { term: 'Iqamah', arabic: 'إقامة', def: 'The second call, made just before the congregational prayer begins.' },
              { term: 'Rakʿah', arabic: 'ركعة', def: 'One unit of prayer, with standing, bowing and two prostrations.' },
              { term: 'Jumuʿah', arabic: 'جمعة', def: 'The Friday congregational prayer, which replaces Dhuhr.' },
              { term: 'Dhikr', arabic: 'ذكر', def: 'Remembrance of Allah through words of praise and glorification.' },
              { term: 'Duʿa', arabic: 'دعاء', def: 'Supplication — calling upon Allah and asking of Him.' },
            ],
          },
        ],
      },
      {
        heading: 'Sources and rulings',
        blocks: [
          {
            type: 'terms',
            items: [
              { term: 'Quran', arabic: 'القرآن', def: 'The word of Allah revealed to the Prophet Muhammad ﷺ.' },
              { term: 'Surah / Ayah', arabic: 'سورة / آية', def: 'A chapter / a verse of the Quran.' },
              { term: 'Juzʾ', arabic: 'جزء', def: 'One of thirty equal parts of the Quran, used for reading schedules.' },
              { term: 'Sunnah', arabic: 'سنة', def: 'The teachings and practice of the Prophet ﷺ. Also used for recommended acts.' },
              { term: 'Hadith', arabic: 'حديث', def: 'A narration of what the Prophet ﷺ said, did or approved.' },
              { term: 'Fard', arabic: 'فرض', def: 'Obligatory.' },
              { term: 'Halal / Haram', arabic: 'حلال / حرام', def: 'Permissible / forbidden.' },
              { term: 'Madhhab', arabic: 'مذهب', def: 'A school of Islamic law, such as the Hanafi, Maliki, Shafiʿi and Hanbali schools.' },
            ],
          },
        ],
      },
      {
        heading: 'Everyday phrases',
        blocks: [
          {
            type: 'terms',
            items: [
              { term: 'As-salamu ʿalaykum', arabic: 'السلام عليكم', def: 'Peace be upon you — the Muslim greeting. The reply is “wa ʿalaykumus-salam”.' },
              { term: 'Bismillah', arabic: 'بسم الله', def: 'In the name of Allah — said before beginning something.' },
              { term: 'Alhamdulillah', arabic: 'الحمد لله', def: 'All praise is for Allah.' },
              { term: 'SubhanAllah', arabic: 'سبحان الله', def: 'Glory be to Allah.' },
              { term: 'Allahu akbar', arabic: 'الله أكبر', def: 'Allah is the Greatest.' },
              { term: 'In shaʾ Allah', arabic: 'إن شاء الله', def: 'If Allah wills — said about the future.' },
              { term: 'Ma shaʾ Allah', arabic: 'ما شاء الله', def: 'What Allah has willed — said in appreciation.' },
              { term: 'Jazak Allahu khayran', arabic: 'جزاك الله خيرا', def: 'May Allah reward you with good — a way of saying thank you.' },
            ],
          },
        ],
      },
    ],
    sources: ['Definitions summarised from standard references; see the topics above for primary sources.'],
  },
  {
    id: 'new-muslim',
    title: 'New to Islam',
    arabic: 'مسلم جديد',
    summary: 'Where to begin, step by step, without feeling overwhelmed.',
    level: 'Beginner',
    sections: [
      {
        heading: 'Start with the essentials',
        blocks: [
          {
            type: 'p',
            text: 'Islam is learned gradually. Focus first on what is obligatory, and build from there with patience. Allah says: “Allah does not burden a soul beyond that it can bear” (Quran 2:286).',
          },
          {
            type: 'steps',
            items: [
              { title: 'Understand the Shahadah', text: 'Its meaning is the foundation of everything else.' },
              { title: 'Learn wudu', text: 'You need it before every prayer.' },
              { title: 'Learn the prayer', text: 'Start with the movements and al-Fatihah. It is fine to pray while you are still learning.' },
              { title: 'Read the Quran with a translation', text: 'Short surahs from the 30th Juzʾ are a good start.' },
              { title: 'Find a community', text: 'A local masjid and a trusted teacher will help you more than any website.' },
            ],
          },
          { type: 'link', text: 'Learn wudu', to: '/learn/wudu' },
          { type: 'link', text: 'Learn how to pray', to: '/learn/salah' },
          { type: 'link', text: 'Start reading Juzʾ 30', to: '/quran/juz/30' },
        ],
      },
    ],
    sources: ['Quran 2:286'],
  },
];

export function findTopic(id: string): LearnTopic | undefined {
  return LEARN_TOPICS.find((t) => t.id === id);
}
