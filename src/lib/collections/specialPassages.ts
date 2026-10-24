export interface SpecialPassage {
  id: string
  title: string
  surah: number
  fromAyat: number
  toAyat: number
  virtue: { text: string; source: string }
}

const kahfStart = { text: 'যে ব্যক্তি সূরা কাহফের প্রথম দশ আয়াত মুখস্থ করবে, সে দাজ্জালের ফিতনা থেকে রক্ষা পাবে।', source: 'সহিহ মুসলিম ৮০৯' }
const kahfEnd = { text: 'সূরা কাহফের শেষ দশ আয়াত পাঠকারী দাজ্জালের ফিতনা থেকে রক্ষা পাবে।', source: 'সহিহ মুসলিম ৮০৯' }
const muawwidhatayn = { text: 'আজ রাতে এমন কিছু আয়াত নাযিল হয়েছে, যার মতো আর কখনো দেখা যায়নি — সূরা ফালাক ও সূরা নাস।', source: 'সহিহ মুসলিম ৮১৪' }

export const specialPassages: SpecialPassage[] = [
  { id: 'ayatul-kursi', title: 'আয়াতুল কুরসি', surah: 2, fromAyat: 255, toAyat: 255, virtue: { text: 'ঘুমানোর সময় আয়াতুল কুরসি পড়লে সকাল পর্যন্ত আল্লাহর পক্ষ থেকে একজন রক্ষক থাকে, আর শয়তান কাছে আসতে পারে না।', source: 'সহিহ বুখারি ২৩১১' } },
  { id: 'baqarah-end', title: 'সূরা বাকারার শেষ দুই আয়াত', surah: 2, fromAyat: 285, toAyat: 286, virtue: { text: 'যে ব্যক্তি রাতে সূরা বাকারার শেষ দুই আয়াত পড়বে, তার জন্য তা যথেষ্ট হবে।', source: 'সহিহ বুখারি ৫০০৯' } },
  { id: 'kahf-start-1', title: 'সূরা কাহফের প্রথম দশ আয়াত (১–৫)', surah: 18, fromAyat: 1, toAyat: 5, virtue: kahfStart },
  { id: 'kahf-start-2', title: 'সূরা কাহফের প্রথম দশ আয়াত (৬–১০)', surah: 18, fromAyat: 6, toAyat: 10, virtue: kahfStart },
  { id: 'kahf-end-1', title: 'সূরা কাহফের শেষ দশ আয়াত (১০১–১০৫)', surah: 18, fromAyat: 101, toAyat: 105, virtue: kahfEnd },
  { id: 'kahf-end-2', title: 'সূরা কাহফের শেষ দশ আয়াত (১০৬–১১০)', surah: 18, fromAyat: 106, toAyat: 110, virtue: kahfEnd },
  { id: 'fatiha', title: 'সূরা ফাতিহা', surah: 1, fromAyat: 1, toAyat: 7, virtue: { text: 'সূরা ফাতিহা কুরআনের সর্বশ্রেষ্ঠ সূরা।', source: 'সহিহ বুখারি ৪৪৭৪' } },
  { id: 'ikhlas', title: 'সূরা ইখলাস', surah: 112, fromAyat: 1, toAyat: 4, virtue: { text: 'সূরা ইখলাস কুরআনের এক-তৃতীয়াংশের সমান।', source: 'সহিহ বুখারি ৫০১৩' } },
  { id: 'falaq', title: 'সূরা ফালাক', surah: 113, fromAyat: 1, toAyat: 5, virtue: muawwidhatayn },
  { id: 'nas', title: 'সূরা নাস', surah: 114, fromAyat: 1, toAyat: 6, virtue: muawwidhatayn },
  { id: 'kafirun', title: 'সূরা কাফিরুন', surah: 109, fromAyat: 1, toAyat: 6, virtue: { text: 'ঘুমানোর আগে সূরা কাফিরুন পড়ো, কারণ এটি শিরক থেকে মুক্তির ঘোষণা।', source: 'সুনান আবু দাউদ ৫০৫৫' } },
  { id: 'imran-end', title: 'আলে ইমরানের শেষ আয়াতগুলো (১৯০–১৯৪)', surah: 3, fromAyat: 190, toAyat: 194, virtue: { text: 'নবী ﷺ রাতে ঘুম থেকে উঠে আকাশের দিকে তাকিয়ে সূরা আলে ইমরানের শেষ আয়াতগুলো পাঠ করতেন।', source: 'সহিহ বুখারি ৪৫৬৯' } },
]
