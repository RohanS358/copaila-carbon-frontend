// ── Student recommendation engine ─────────────────────────────────────────────
// Turns a day's quest answers into a short, ranked list of kid-friendly actions
// to try TOMORROW. Rule-based and bilingual today; the SEAM for the backend is
// generateRecommendations() — when the recommendation DB lands, this function
// becomes a fetch returning the same { recommendations, potentialCo2Saved } shape.
//
// Each rule fires when a student picked a higher-impact option, and carries an
// estimated daily CO₂ saving used to rank the advice and grow "CO₂ saved".

const RULES = [
  {
    qid: 'q1', bad: ['car', 'motorbike', 'publicBus'], weight: 10, co2: 1.5, icon: '🚶',
    en: 'Walk or cycle to school tomorrow — zero carbon and great exercise!',
    ne: 'भोलि विद्यालय हिँडेर वा साइकलमा जानुहोस् — शून्य कार्बन र राम्रो व्यायाम!',
  },
  {
    qid: 'q11', bad: ['3-5', 'over5'], weight: 7, co2: 0.4, icon: '💧',
    en: 'Swap plastic bottles for one reusable bottle tomorrow.',
    ne: 'भोलि प्लास्टिक बोतलको सट्टा एउटा पुनःप्रयोग गर्ने बोतल लानुहोस्।',
  },
  {
    qid: 'q4', bad: ['dal_meat', 'outside'], weight: 7, co2: 0.9, icon: '🥗',
    en: 'Pick a dal-bhat & veg lunch tomorrow to shrink your food footprint.',
    ne: 'भोलि दालभात र तरकारीको खाजा छान्नुहोस् — खानाको कार्बन घट्छ।',
  },
  {
    qid: 'q5', bad: ['several', 'daily'], weight: 6, co2: 0.9, icon: '🌿',
    en: 'Try one meat-free meal tomorrow — veggies are lighter on the planet.',
    ne: 'भोलि एक छाक मासुबिना खानुहोस् — सागसब्जी पृथ्वीको लागि हलुका हुन्छ।',
  },
  {
    qid: 'q8', bad: ['on', 'unaware', 'someone'], weight: 5, co2: 0.3, icon: '💡',
    en: 'Switch off lights and fans when you leave a room tomorrow.',
    ne: 'भोलि कोठाबाट निस्कँदा बत्ती र पंखा निभाउनुहोस्।',
  },
  {
    qid: 'q12', bad: ['sometimes', 'never'], weight: 5, co2: 0.3, icon: '🚰',
    en: 'Bring your reusable water bottle to school tomorrow.',
    ne: 'भोलि विद्यालयमा पुनःप्रयोग गर्ने पानीको बोतल ल्याउनुहोस्।',
  },
  {
    qid: 'q7', bad: ['4-6', 'over6'], weight: 5, co2: 0.2, icon: '📵',
    en: 'Cut your screen time by an hour tomorrow — the grid will thank you!',
    ne: 'भोलि एक घण्टा कम स्क्रिन हेर्नुहोस् — बिजुली बच्छ!',
  },
  {
    qid: 'q10', bad: ['bin', 'not_sure'], weight: 4, co2: 0.2, icon: '♻️',
    en: 'Pop your snack wrapper into a recycling bin tomorrow.',
    ne: 'भोलि खाजाको र्‍यापर पुनःप्रयोग बिनमा हाल्नुहोस्।',
  },
  {
    qid: 'q6', bad: ['few_week', 'daily'], weight: 4, co2: 0.3, icon: '🍎',
    en: 'Skip the packaged snacks tomorrow — bring a homemade one instead.',
    ne: 'भोलि प्याकेटको खाजा छोड्नुहोस् — घरको खाजा ल्याउनुहोस्।',
  },
  {
    qid: 'q9', bad: ['often', 'daily'], weight: 3, co2: 0.1, icon: '🔌',
    en: 'Charge your devices a little less at school tomorrow.',
    ne: 'भोलि विद्यालयमा यन्त्रहरू अलि कम चार्ज गर्नुहोस्।',
  },
]

const ALL_GREEN = {
  id: 'all_green', icon: '🌟', co2: 0,
  en: 'Wow — all green choices today! Keep these awesome habits going tomorrow.',
  ne: 'वाह — आज सबै हरित छनोट! भोलि पनि यी राम्रा बानी कायम राख्नुहोस्।',
}

/**
 * Build tomorrow's action list from today's answers.
 * @returns { recommendations: Array<{id,icon,text,en,ne,co2Saved}>, potentialCo2Saved:number }
 */
export function generateRecommendations(answers = {}, lang = 'en', max = 4) {
  const hits = RULES
    .filter((r) => r.bad.includes(answers[r.qid]))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, max)
    .map((r) => ({ id: r.qid, icon: r.icon, text: lang === 'ne' ? r.ne : r.en, en: r.en, ne: r.ne, co2Saved: r.co2 }))

  if (hits.length === 0) {
    hits.push({ id: ALL_GREEN.id, icon: ALL_GREEN.icon, text: lang === 'ne' ? ALL_GREEN.ne : ALL_GREEN.en, en: ALL_GREEN.en, ne: ALL_GREEN.ne, co2Saved: 0 })
  }

  const potentialCo2Saved = hits.reduce((s, r) => s + (r.co2Saved || 0), 0)
  return { recommendations: hits, potentialCo2Saved: Math.round(potentialCo2Saved * 10) / 10 }
}
