export interface Benefit {
  en: string
  bn: string
  source: string
}

export const presetBenefits: Record<string, Benefit> = {
  fatiha: { en: 'The greatest surah in the Quran', bn: 'কুরআনের সর্বশ্রেষ্ঠ সূরা', source: 'Sahih al-Bukhari 4474' },
  'ayatul-kursi': { en: 'Recite it at bedtime and a guardian from Allah stays with you until morning', bn: 'ঘুমের আগে পড়লে সকাল পর্যন্ত আল্লাহর পক্ষ থেকে একজন রক্ষক থাকে', source: 'Sahih al-Bukhari 2311' },
  'baqarah-end': { en: 'Whoever recites them at night, they will suffice him', bn: 'রাতে পড়লে এ দুটি আয়াতই তার জন্য যথেষ্ট', source: 'Sahih al-Bukhari 5009' },
  'imran-end': { en: 'The Prophet ﷺ recited them on waking for the night prayer', bn: 'রাসূল ﷺ রাতে জেগে এ আয়াতগুলো তিলাওয়াত করতেন', source: 'Sahih al-Bukhari 4569' },
  'kahf-start': { en: 'Whoever memorises the first ten ayat is protected from the Dajjal', bn: 'প্রথম দশ আয়াত মুখস্থ করলে দাজ্জাল থেকে রক্ষা পাওয়া যায়', source: 'Sahih Muslim 809' },
  'kahf-end': { en: 'Protection from the trial of the Dajjal', bn: 'দাজ্জালের ফিতনা থেকে সুরক্ষা', source: 'Sahih Muslim 809' },
  sajdah: { en: 'The Prophet ﷺ would not sleep until he recited As-Sajdah and Al-Mulk', bn: 'রাসূল ﷺ সূরা সাজদাহ ও মুলক না পড়ে ঘুমাতেন না', source: "Jami' at-Tirmidhi 2892" },
  mulk: { en: 'Thirty ayat that intercede for their reciter until he is forgiven', bn: 'ত্রিশ আয়াতের সূরা, যা পাঠকারীর জন্য ক্ষমা না হওয়া পর্যন্ত সুপারিশ করবে', source: "Jami' at-Tirmidhi 2891" },
  ala: { en: "The Prophet ﷺ recited it in the Jumu'ah and Eid prayers", bn: 'রাসূল ﷺ জুমা ও ঈদের সালাতে এটি পড়তেন', source: 'Sahih Muslim 878' },
  ghashiyah: { en: "The Prophet ﷺ recited it in the Jumu'ah and Eid prayers", bn: 'রাসূল ﷺ জুমা ও ঈদের সালাতে এটি পড়তেন', source: 'Sahih Muslim 878' },
  kafirun: { en: 'Recite it before sleep: it is a declaration of freedom from shirk', bn: 'ঘুমের আগে পড়ো, এটি শিরক থেকে মুক্তির ঘোষণা', source: 'Sunan Abi Dawud 5055' },
  ikhlas: { en: 'Equal to one third of the Quran', bn: 'কুরআনের এক-তৃতীয়াংশের সমান', source: 'Sahih al-Bukhari 5013' },
  falaq: { en: 'With Al-Ikhlas and An-Nas three times morning and evening, it suffices you against everything', bn: 'ইখলাস ও নাসের সাথে সকাল-সন্ধ্যায় তিনবার পড়লে সবকিছু থেকে যথেষ্ট হবে', source: 'Sunan Abi Dawud 5082' },
  nas: { en: 'Nothing like Al-Falaq and An-Nas has been revealed for seeking refuge', bn: 'আশ্রয় চাওয়ার জন্য সূরা ফালাক ও নাসের মতো কিছু নাযিল হয়নি', source: 'Sahih Muslim 814' },
  'dunya-akhirah': { en: 'The dua the Prophet ﷺ made most often', bn: 'রাসূল ﷺ সবচেয়ে বেশি এই দোয়া করতেন', source: 'Sahih al-Bukhari 6389' },
  yunus: { en: 'No Muslim calls with it for anything but Allah answers him', bn: 'কোনো মুসলিম এ দোয়ায় কিছু চাইলে আল্লাহ তা কবুল করেন', source: "Jami' at-Tirmidhi 3505" },
}

export const azkarBenefits: Record<string, Benefit> = {
  'sayyidul-istighfar': { en: 'Say it with certainty by day and die before evening, and you are of the people of Paradise', bn: 'দৃঢ় বিশ্বাসে দিনে পড়ে সন্ধ্যার আগে মারা গেলে সে জান্নাতি', source: 'Sahih al-Bukhari 6306' },
  'subhanallah-wa-bihamdihi': { en: 'Said a hundred times a day, sins are wiped away even if like the foam of the sea', bn: 'দিনে একশো বার পড়লে সমুদ্রের ফেনা পরিমাণ গুনাহও মাফ হয়', source: 'Sahih al-Bukhari 6405' },
  'bismillah-protection': { en: 'Said three times, nothing will harm you', bn: 'তিনবার পড়লে কোনো কিছুই ক্ষতি করতে পারবে না', source: "Jami' at-Tirmidhi 3388" },
  tahlil: { en: 'Said ten times, like freeing four slaves from the children of Ismail', bn: 'দশবার পড়লে ইসমাঈল (আ.)-এর বংশের চারজন দাস মুক্তির সমান', source: 'Sahih Muslim 2693' },
  radhitu: { en: 'Paradise becomes due for the one who says it', bn: 'যে এটি বলে তার জন্য জান্নাত অবধারিত হয়ে যায়', source: 'Sunan Abi Dawud 1529' },
  'after-salah': { en: 'The Prophet ﷺ said it after every prayer', bn: 'রাসূল ﷺ প্রতি সালাতের পর এটি বলতেন', source: 'Sahih Muslim 591' },
  'before-sleep': { en: 'The Prophet ﷺ said it when he lay down to sleep', bn: 'রাসূল ﷺ ঘুমানোর সময় এটি বলতেন', source: 'Sahih al-Bukhari 6324' },
  'on-waking': { en: 'The Prophet ﷺ said it when he woke up', bn: 'রাসূল ﷺ ঘুম থেকে উঠে এটি বলতেন', source: 'Sahih al-Bukhari 6312' },
  'leaving-home': { en: 'It is said to him: you are guided, sufficed and protected', bn: 'তাকে বলা হয়: তুমি হেদায়াতপ্রাপ্ত, তোমার জন্য যথেষ্ট এবং তুমি সুরক্ষিত', source: "Jami' at-Tirmidhi 3426" },
  'help-me-remember': { en: "The Prophet ﷺ taught it to Mu'adh to say after every prayer", bn: 'রাসূল ﷺ মুআয (রা.)-কে প্রতি সালাতের পর এটি বলতে শিখিয়েছেন', source: 'Sunan Abi Dawud 1522' },
  'four-words': { en: 'Dearer to the Prophet ﷺ than everything the sun rises over', bn: 'সূর্য যা কিছুর উপর উদিত হয়, তার চেয়েও রাসূল ﷺ-এর কাছে প্রিয়', source: 'Sahih Muslim 2695' },
  hawqala: { en: 'A treasure from the treasures of Paradise', bn: 'জান্নাতের ভান্ডারসমূহের একটি ভান্ডার', source: 'Sahih al-Bukhari 6384' },
}
