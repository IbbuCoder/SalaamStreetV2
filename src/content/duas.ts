// Duas & Adhkar.
//
// Content rules:
// - Quranic passages are NOT typed here. They reference verses by "surah:ayah" and
//   the text is loaded verbatim from the Quran dataset (public/data/quran/excerpts.json).
// - Supplications from the Sunnah are limited to well-known narrations with a
//   reference to the collection and hadith number (numbering as on sunnah.com).
// - English renderings are meaning-based translations, not word-for-word.
//
// Before adding anything: verify the Arabic and reference against a primary
// source. Do not add narrations without a clear reference.

export interface Dua {
  id: string;
  title: string;
  /** Verbatim Quran excerpt reference(s), e.g. "2:255" or ["112:1-4", "113:1-5"]. */
  quran?: string | string[];
  arabic?: string;
  translit?: string;
  translation?: string;
  /** Number of times it is recited, where the narration specifies it. */
  count?: number;
  source: string;
  note?: string;
}

export interface DuaCategory {
  id: string;
  title: string;
  blurb: string;
  items: Dua[];
}

const AYAT_AL_KURSI: Dua = {
  id: 'ayat-al-kursi',
  title: 'Ayat al-Kursi',
  quran: '2:255',
  source: 'Quran 2:255',
  note: 'Reciting it before sleeping is mentioned in Sahih al-Bukhari 2311, and after each obligatory prayer in an-Nasa’i, as-Sunan al-Kubra 9928.',
};

const THREE_QULS: Dua[] = [
  { id: 'ikhlas', title: 'Surah al-Ikhlas', quran: '112:1-4', count: 3, source: 'Quran 112 · Abu Dawud 5082, at-Tirmidhi 3575' },
  { id: 'falaq', title: 'Surah al-Falaq', quran: '113:1-5', count: 3, source: 'Quran 113 · Abu Dawud 5082, at-Tirmidhi 3575' },
  { id: 'nas', title: 'Surah an-Nas', quran: '114:1-6', count: 3, source: 'Quran 114 · Abu Dawud 5082, at-Tirmidhi 3575' },
];

const BISMILLAH_PROTECTION: Dua = {
  id: 'bismillah-protection',
  title: 'Protection by the Name of Allah',
  arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
  translit: "Bismillāhil-ladhī lā yaḍurru maʿa-smihī shay'un fil-arḍi wa lā fis-samā', wa huwas-samīʿul-ʿalīm",
  translation:
    'In the name of Allah, with whose name nothing on earth or in the heavens can cause harm, and He is the All-Hearing, the All-Knowing.',
  count: 3,
  source: 'Abu Dawud 5088 · at-Tirmidhi 3388',
};

const SAYYID_AL_ISTIGHFAR: Dua = {
  id: 'sayyid-al-istighfar',
  title: 'The best way to seek forgiveness (Sayyid al-Istighfar)',
  arabic:
    'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
  translit:
    "Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa ana ʿabduk, wa ana ʿalā ʿahdika wa waʿdika mastaṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abū'u laka bi niʿmatika ʿalayy, wa abū'u laka bi dhanbī, faghfir lī, fa innahū lā yaghfirudh-dhunūba illā ant",
  translation:
    'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
  source: 'Sahih al-Bukhari 6306',
  note: 'The narration mentions saying it in the morning and in the evening.',
};

const SUBHANALLAH_WA_BIHAMDIHI: Dua = {
  id: 'subhanallah-wa-bihamdihi',
  title: 'Glorification',
  arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  translit: 'Subḥānallāhi wa biḥamdih',
  translation: 'Glory be to Allah and praise be to Him.',
  count: 100,
  source: 'Sahih Muslim 2692',
  note: 'Said one hundred times in the morning and in the evening.',
};

export const DUA_CATEGORIES: DuaCategory[] = [
  {
    id: 'morning',
    title: 'Morning Adhkar',
    blurb: 'Remembrance after Fajr until the sun has risen.',
    items: [
      {
        id: 'asbahna',
        title: 'We have entered the morning',
        arabic:
          'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
        translation:
          'We have entered the morning and the dominion belongs to Allah. Praise be to Allah. There is no god but Allah alone, without partner; His is the dominion and His is the praise, and He has power over all things. My Lord, I ask You for the good of this day and the good of what follows it, and I seek refuge in You from the evil of this day and the evil of what follows it. My Lord, I seek refuge in You from laziness and the misery of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave.',
        source: 'Sahih Muslim 2723',
        note: 'In the evening, the narration says “amsaynā wa amsal-mulku lillāh” and “this night”.',
      },
      {
        id: 'bika-asbahna',
        title: 'By You we enter the morning',
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
        translit: 'Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu, wa ilaykan-nushūr',
        translation:
          'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection.',
        source: 'at-Tirmidhi 3391',
      },
      SAYYID_AL_ISTIGHFAR,
      BISMILLAH_PROTECTION,
      AYAT_AL_KURSI,
      ...THREE_QULS,
      SUBHANALLAH_WA_BIHAMDIHI,
    ],
  },
  {
    id: 'evening',
    title: 'Evening Adhkar',
    blurb: 'Remembrance after Asr until the night.',
    items: [
      {
        id: 'bika-amsayna',
        title: 'By You we enter the evening',
        arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
        translit: 'Allāhumma bika amsaynā, wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu, wa ilaykal-maṣīr',
        translation:
          'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return.',
        source: 'at-Tirmidhi 3391',
      },
      {
        id: 'kalimat-tammat',
        title: 'Refuge in the perfect words of Allah',
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        translit: "Aʿūdhu bikalimātil-lāhit-tāmmāti min sharri mā khalaq",
        translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
        source: 'Sahih Muslim 2708, 2709',
      },
      SAYYID_AL_ISTIGHFAR,
      BISMILLAH_PROTECTION,
      AYAT_AL_KURSI,
      ...THREE_QULS,
      SUBHANALLAH_WA_BIHAMDIHI,
    ],
  },
  {
    id: 'after-salah',
    title: 'After Salah',
    blurb: 'Remembrance after the obligatory prayers.',
    items: [
      {
        id: 'istighfar-3',
        title: 'Seeking forgiveness',
        arabic: 'أَسْتَغْفِرُ اللَّهَ',
        translit: 'Astaghfirullāh',
        translation: 'I seek the forgiveness of Allah.',
        count: 3,
        source: 'Sahih Muslim 591',
      },
      {
        id: 'antas-salam',
        title: 'You are Peace',
        arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
        translit: 'Allāhumma antas-salāmu wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām',
        translation: 'O Allah, You are Peace and from You is peace. Blessed are You, O Possessor of Majesty and Honour.',
        source: 'Sahih Muslim 591',
      },
      {
        id: 'tasbih-33',
        title: 'Glorify, praise and magnify',
        arabic: 'سُبْحَانَ اللَّهِ · الْحَمْدُ لِلَّهِ · اللَّهُ أَكْبَرُ',
        translit: 'Subḥānallāh (33) · Alḥamdulillāh (33) · Allāhu akbar (33)',
        translation: 'Glory be to Allah · Praise be to Allah · Allah is the Greatest — each thirty-three times.',
        source: 'Sahih Muslim 597',
      },
      {
        id: 'tahlil-100th',
        title: 'Completing the hundred',
        arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        translit: 'Lā ilāha illallāhu waḥdahū lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ʿalā kulli shay’in qadīr',
        translation:
          'There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He has power over all things.',
        source: 'Sahih Muslim 597',
        note: 'Said once to complete one hundred after the 33 × 3 above.',
      },
      AYAT_AL_KURSI,
    ],
  },
  {
    id: 'sleep',
    title: 'Before Sleeping',
    blurb: 'Words to say as you lie down, and when you wake.',
    items: [
      {
        id: 'bismika-amutu',
        title: 'In Your name I die and live',
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        translit: 'Bismika Allāhumma amūtu wa aḥyā',
        translation: 'In Your name, O Allah, I die and I live.',
        source: 'Sahih al-Bukhari 6324',
      },
      AYAT_AL_KURSI,
      {
        id: 'baqarah-end',
        title: 'The last two verses of al-Baqarah',
        quran: '2:285-286',
        source: 'Quran 2:285–286 · Sahih al-Bukhari 5009',
        note: 'Whoever recites these two verses at night, they will suffice him (Sahih al-Bukhari 5009).',
      },
      {
        id: 'quls-sleep',
        title: 'The three Quls',
        quran: ['112:1-4', '113:1-5', '114:1-6'],
        source: 'Quran 112–114 · Sahih al-Bukhari 5017',
        note:
          'The Prophet ﷺ would recite al-Ikhlas, al-Falaq and an-Nas into his cupped hands, then wipe over as much of his body as he could, three times.',
      },
      {
        id: 'waking',
        title: 'Upon waking',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        translit: 'Alḥamdu lillāhil-ladhī aḥyānā baʿda mā amātanā wa ilayhin-nushūr',
        translation: 'Praise be to Allah who gave us life after causing us to die, and to Him is the resurrection.',
        source: 'Sahih al-Bukhari 6312',
      },
    ],
  },
  {
    id: 'eating',
    title: 'Eating & Drinking',
    blurb: 'Before and after a meal.',
    items: [
      {
        id: 'before-eating',
        title: 'Before eating',
        arabic: 'بِسْمِ اللَّهِ',
        translit: 'Bismillāh',
        translation: 'In the name of Allah.',
        source: 'Abu Dawud 3767 · at-Tirmidhi 1858',
      },
      {
        id: 'forgot-bismillah',
        title: 'If you forgot at the beginning',
        arabic: 'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ',
        translit: 'Bismillāhi awwalahū wa ākhirah',
        translation: 'In the name of Allah, at its beginning and at its end.',
        source: 'Abu Dawud 3767 · at-Tirmidhi 1858',
      },
      {
        id: 'after-eating',
        title: 'After eating',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        translit: 'Alḥamdu lillāhil-ladhī aṭʿamanī hādhā wa razaqanīhi min ghayri ḥawlin minnī wa lā quwwah',
        translation:
          'Praise be to Allah who fed me this and provided it for me without any power or strength on my part.',
        source: 'Abu Dawud 4023 · at-Tirmidhi 3458',
      },
    ],
  },
  {
    id: 'travel',
    title: 'Traveling & Leaving Home',
    blurb: 'For journeys near and far.',
    items: [
      {
        id: 'leaving-home',
        title: 'Leaving the home',
        arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        translit: 'Bismillāh, tawakkaltu ʿalallāh, lā ḥawla wa lā quwwata illā billāh',
        translation: 'In the name of Allah. I place my trust in Allah. There is no might and no power except with Allah.',
        source: 'Abu Dawud 5095 · at-Tirmidhi 3426',
      },
      {
        id: 'riding',
        title: 'Mounting a means of travel',
        quran: '43:13-14',
        source: 'Quran 43:13–14 · Sahih Muslim 1342',
        note:
          'Sahih Muslim 1342 reports that the Prophet ﷺ would say “Allāhu akbar” three times when setting out on a journey, then recite these words — “Glory be to Him who has subjected this to us…” — followed by further supplications for the journey.',
      },
      {
        id: 'stopping',
        title: 'Stopping at a place',
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        translit: "Aʿūdhu bikalimātil-lāhit-tāmmāti min sharri mā khalaq",
        translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
        source: 'Sahih Muslim 2708',
        note: 'Whoever stops at a place and says this, nothing will harm him until he departs from it.',
      },
    ],
  },
  {
    id: 'protection',
    title: 'Protection & Distress',
    blurb: 'Seeking refuge and relief with Allah.',
    items: [
      BISMILLAH_PROTECTION,
      {
        id: 'hasbiyallah',
        title: 'Allah is sufficient for me',
        quran: '9:129',
        source: 'Quran 9:129',
        note: 'The words “Ḥasbiyallāhu lā ilāha illā huwa, ʿalayhi tawakkaltu wa huwa rabbul-ʿarshil-ʿaẓīm” appear in this verse.',
      },
      {
        id: 'dhun-nun',
        title: 'The supplication of Yunus (Dhun-Nun)',
        quran: '21:87',
        source: 'Quran 21:87 · at-Tirmidhi 3505',
        note: 'His supplication is the words “Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn” within this verse.',
      },
      AYAT_AL_KURSI,
    ],
  },
  {
    id: 'general',
    title: 'General Duas',
    blurb: 'Supplications from the Quran and Sunnah for every day.',
    items: [
      { id: 'rabbana-atina', title: 'Good in this world and the next', quran: '2:201', source: 'Quran 2:201' },
      { id: 'zidni-ilma', title: 'Increase me in knowledge', quran: '20:114', source: 'Quran 20:114', note: 'The supplication is “Rabbi zidnī ʿilmā” at the end of the verse.' },
      { id: 'musa', title: 'Ease and clarity', quran: '20:25-28', source: 'Quran 20:25–28' },
      { id: 'steadfast-hearts', title: 'Do not let our hearts deviate', quran: '3:8', source: 'Quran 3:8' },
      { id: 'adam', title: 'The repentance of Adam', quran: '7:23', source: 'Quran 7:23' },
      { id: 'parents', title: 'For one’s parents', quran: '17:24', source: 'Quran 17:24', note: 'The supplication is “Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā”.' },
      { id: 'family', title: 'For family and children', quran: '25:74', source: 'Quran 25:74' },
      { id: 'ibrahim', title: 'The supplication of Ibrahim', quran: '14:40-41', source: 'Quran 14:40–41' },
      {
        id: 'muqallib',
        title: 'Firmness of the heart',
        arabic: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
        translit: 'Yā muqallibal-qulūb, thabbit qalbī ʿalā dīnik',
        translation: 'O Turner of hearts, make my heart firm upon Your religion.',
        source: 'at-Tirmidhi 2140',
      },
      {
        id: 'afw',
        title: 'Asking for pardon',
        arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
        translit: "Allāhumma innaka ʿafuwwun tuḥibbul-ʿafwa faʿfu ʿannī",
        translation: 'O Allah, You are Pardoning and You love to pardon, so pardon me.',
        source: 'at-Tirmidhi 3513 · Ibn Majah 3850',
        note: 'Taught by the Prophet ﷺ to ʿAishah for Laylat al-Qadr.',
      },
    ],
  },
];

export const quranRefs = (d: Dua): string[] => (d.quran ? (Array.isArray(d.quran) ? d.quran : [d.quran]) : []);

export function findCategory(id: string): DuaCategory | undefined {
  return DUA_CATEGORIES.find((c) => c.id === id);
}

export const DUA_SOURCES_NOTE =
  'Quranic passages are shown verbatim from the Quran dataset used by this site. Hadith references follow the numbering used on sunnah.com. Translations convey the meaning and are not word-for-word.';
