// ── Pet dialogue engine ───────────────────────────────────────────────────────
// Produces the strings the animated character speaks. Every line exists in both
// English and Nepali (नेपाली) so the pet talks in whichever language the UI is
// set to. Strings are passed to useTalkingPet().speak() — which plays the
// talking animation, runs TTS, and shows subtitles.
//
// Two sources of strings feed the pet:
//   1. DEFAULT lines below (greetings, eco tips, quiz prompts) — for button
//      clicks and quest questions.
//   2. The LLM path (getLLMPetResponse) — for dynamic, generated advice.

const DIALOG = {
  greetings: {
    en: [
      "Hey there, green warrior! Ready to help the planet today?",
      "Hi! I'm Leaf, your eco companion. Let's make today count!",
      "Welcome back! Every small action adds up to big change.",
    ],
    ne: [
      'नमस्ते, हरित योद्धा! आज पृथ्वीलाई मद्दत गर्न तयार हुनुहुन्छ?',
      'नमस्ते! म लिफ, तपाईंको इको साथी हुँ। आजको दिन सार्थक बनाऔं!',
      'फेरि स्वागत छ! हरेक सानो काम मिलेर ठूलो परिवर्तन ल्याउँछ।',
    ],
  },

  ecoTips: {
    en: [
      'Did you know walking to school saves about 2 kg of CO₂ per trip? Keep it up!',
      'Turning off lights when you leave a room can cut energy bills by 10 percent!',
      'One plant-based meal a week removes about 50 kg of CO₂ from your yearly footprint.',
      'Shorter showers save up to 150 litres of water — every drop counts!',
      'Recycling one aluminium can saves enough energy to run a TV for 3 hours.',
      'Planting a tree absorbs about 21 kg of CO₂ every year as it grows.',
      'A reusable water bottle keeps about 156 plastic bottles out of landfill each year.',
    ],
    ne: [
      'के तपाईंलाई थाहा छ, विद्यालय हिँडेर जाँदा प्रति यात्रा करिब २ केजी कार्बन बचत हुन्छ? लागिरहनुहोस्!',
      'कोठाबाट निस्कँदा बत्ती निभाउँदा बिजुली बिल १० प्रतिशतसम्म घट्छ!',
      'हप्तामा एक छाक शाकाहारी खाना खाँदा वर्षभरिमा करिब ५० केजी कार्बन घट्छ।',
      'छोटो नुहाइले १५० लिटरसम्म पानी बचाउँछ — हरेक थोपा महत्त्वपूर्ण छ!',
      'एउटा एल्मुनियम क्यान पुनःप्रयोग गर्दा टिभी ३ घण्टा चलाउने बिजुली बच्छ।',
      'एउटा रूख रोप्दा हुर्कंदै जाँदा वर्षको करिब २१ केजी कार्बन सोस्छ।',
      'पुनःप्रयोग गर्ने पानीको बोतलले वर्षमा करिब १५६ प्लास्टिक बोतल फोहोरमा जानबाट जोगाउँछ।',
    ],
  },

  questIntro: {
    en: ["Let's do today's eco quest! I'll ask, you tap the answer. Ready?"],
    ne: ['आजको इको क्विज सुरु गरौं! म सोध्छु, तपाईं जवाफ छान्नुहोस्। तयार हुनुहुन्छ?'],
  },

  encouragements: {
    en: ['Nice!', 'Great choice!', 'Keep going!', 'Awesome!', 'Love it!'],
    ne: ['राम्रो!', 'उत्तम छनोट!', 'अगाडि बढौं!', 'बढिया!', 'मन पर्‍यो!'],
  },

  celebrations: {
    en: [
      "Amazing work! You're making a real difference!",
      "Woohoo! The planet thanks you for today's effort!",
      'Incredible! Your eco score is growing fast — keep it up!',
    ],
    ne: [
      'अद्भुत काम! तपाईंले साँच्चै फरक पार्दै हुनुहुन्छ!',
      'वाह! आजको मेहनतको लागि पृथ्वीले तपाईंलाई धन्यवाद भन्छ!',
      'गजब! तपाईंको इको स्कोर छिटो बढ्दैछ — लागिरहनुहोस्!',
    ],
  },

  lowHappiness: {
    en: [
      'I miss spending time with you! Finish your eco quest to cheer me up!',
      "Hey… it's been a while. Let's do something green together today?",
    ],
    ne: [
      'तपाईंसँग समय बिताउन मन लाग्यो! मलाई खुसी बनाउन इको क्विज पूरा गर्नुहोस्!',
      'ए… धेरै भयो नि। आज सँगै केही हरित काम गरौं?',
    ],
  },
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const lines = (category, lang) => DIALOG[category]?.[lang === 'ne' ? 'ne' : 'en'] || DIALOG[category]?.en || []

// ── Default-string helpers (button clicks / quest prompts) ────────────────────
export const getGreeting      = (lang = 'en') => pick(lines('greetings', lang))
export const getQuestIntro    = (lang = 'en') => pick(lines('questIntro', lang))
export const getEncouragement = (lang = 'en') => pick(lines('encouragements', lang))
export const getCelebration   = (lang = 'en') => pick(lines('celebrations', lang))

// Eco tip rotates by the hour so it feels fresh but stays stable on a refresh.
export function getEcoTip(lang = 'en') {
  const tips = lines('ecoTips', lang)
  const idx = Math.floor(Date.now() / 1000 / 3600) % tips.length
  return tips[idx]
}

// Context-aware line for the dashboard greeting.
// context: { questCompleted, questAnswers, petHappiness }
export function getPetResponse(context = {}, lang = 'en') {
  const { questCompleted, questAnswers = {}, petHappiness = 50 } = context
  if (questCompleted) return getCelebration(lang)
  if (petHappiness < 40) return pick(lines('lowHappiness', lang))
  if (Object.keys(questAnswers).length === 0) return getGreeting(lang)
  return getEcoTip(lang)
}

// ── LLM integration point (the "string from an API" path) ─────────────────────
// Today this returns a local, rule-based line so the feature works with no
// backend. When a real endpoint exists, swap the body for the fetch below and
// the rest of the app (which already `await`s this) keeps working unchanged.
export async function getLLMPetResponse(prompt, context = {}, lang = 'en') {
  // When the endpoint exists: return realLLMCall(prompt, context, lang)
  // No-backend fallback: a friendly, context-aware line (never echoes the raw
  // prompt back at the student).
  return getPetResponse(context, lang)
}

// Used by the school recommendation engine to inject custom advice into the pet.
export function buildRecommendationMessage(promptText, _context = {}, lang = 'en') {
  if (promptText) return promptText
  return getEcoTip(lang)
}

// Reference implementation for when the backend LLM endpoint is ready:
//
// async function realLLMCall(prompt, context, lang) {
//   const res = await fetch('/api/v1/pet/chat', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ prompt, context, lang }),
//   })
//   if (!res.ok) throw new Error('Pet service error')
//   const data = await res.json()
//   return data.message // string the pet should speak
// }
