export const questSections = [
  {
    id: 'journey',
    number: 1,
    icon: '🚶',
    title: 'Getting to School',
    accent: '#2D4A32',
    light:  '#EEF2DC',
    pill:   '#d1fae5',
    pillText: '#065f46',
    questions: [
      {
        // `mode` maps to the engine's commute modes; `co2` is the PDF factor
        // (kg CO₂e / passenger-km, DESNZ 2023 / WRI India 2015).
        id: 'q1',
        text: 'How do you usually get to school?',
        options: [
          { value: 'walk',      mode: 'walk',       co2: 0,     label: 'Walk',           emoji: '🚶', xp: 50 },
          { value: 'cycle',     mode: 'bicycle',    co2: 0,     label: 'Cycle',          emoji: '🚲', xp: 50 },
          { value: 'schoolBus', mode: 'schoolBus',  co2: 0.027, label: 'School Bus',     emoji: '🚌', xp: 30 },
          { value: 'publicBus', mode: 'publicBus',  co2: 0.089, label: 'Public Bus/Tempo', emoji: '🚐', xp: 20 },
          { value: 'motorbike', mode: 'motorbike',  co2: 0.113, label: 'Motorbike',      emoji: '🏍️', xp: 10 },
          { value: 'car',       mode: 'car',        co2: 0.171, label: 'Car / Jeep',     emoji: '🚗', xp: 5  },
        ],
      },
      {
        id: 'q2',
        text: 'How long is your commute to school?',
        options: [
          { value: 'under10', label: 'Under 10 min', emoji: '⚡', xp: 20 },
          { value: '10-20',   label: '10–20 min',    emoji: '🕐', xp: 15 },
          { value: '20-40',   label: '20–40 min',    emoji: '🕑', xp: 10 },
          { value: 'over40',  label: '40+ min',      emoji: '🕒', xp: 5  },
        ],
      },
      {
        id: 'q3',
        text: 'On a sunny day, would you walk or cycle if possible?',
        options: [
          { value: 'definitely',   label: 'Definitely!', emoji: '🌞', xp: 25 },
          { value: 'probably',     label: 'Probably',    emoji: '🙂', xp: 18 },
          { value: 'maybe',        label: 'Maybe',       emoji: '🤔', xp: 10 },
          { value: 'probably_not', label: 'Nope',        emoji: '😅', xp: 5  },
        ],
      },
    ],
  },

  {
    id: 'food',
    number: 2,
    icon: '🍱',
    title: 'Food & Eating',
    accent: '#b45309',
    light:  '#fef9ee',
    pill:   '#fef3c7',
    pillText: '#92400e',
    questions: [
      {
        // `co2` is the PDF meal factor (kg CO₂e / meal, Poore & Nemecek 2018).
        id: 'q4',
        text: "What does your typical lunch look like?",
        options: [
          { value: 'dal_veg',  co2: 0.9, label: 'Dal bhat & veg',  emoji: '🥗', xp: 30 },
          { value: 'dal_meat', co2: 1.8, label: 'Dal bhat & meat', emoji: '🍖', xp: 15 },
          { value: 'home',     co2: 0.9, label: 'Home-packed',     emoji: '🏠', xp: 25 },
          { value: 'outside',  co2: 1.8, label: 'Canteen/outside', emoji: '🏪', xp: 10 },
        ],
      },
      {
        id: 'q5',
        text: 'How often do you eat meat?',
        options: [
          { value: 'rarely',     label: 'Rarely',           emoji: '🌿', xp: 30 },
          { value: 'once_twice', label: '1–2× a week',      emoji: '🍗', xp: 20 },
          { value: 'several',    label: 'Several times',    emoji: '🥩', xp: 10 },
          { value: 'daily',      label: 'Every day',        emoji: '🍖', xp: 5  },
        ],
      },
      {
        id: 'q6',
        text: 'How often do you buy packaged snacks?',
        options: [
          { value: 'never',    label: 'Never',          emoji: '🚫', xp: 30 },
          { value: 'sometimes',label: 'Sometimes',      emoji: '🤏', xp: 20 },
          { value: 'few_week', label: 'A few times',    emoji: '📦', xp: 10 },
          { value: 'daily',    label: 'Every day',      emoji: '🛒', xp: 5  },
        ],
      },
    ],
  },

  {
    id: 'energy',
    number: 3,
    icon: '⚡',
    title: 'Energy & Screens',
    accent: '#0369a1',
    light:  '#f0f9ff',
    pill:   '#dbeafe',
    pillText: '#1e40af',
    questions: [
      {
        id: 'q7',
        text: 'How many hours on screens daily?',
        options: [
          { value: 'under2', label: 'Under 2 hrs', emoji: '⭐', xp: 30 },
          { value: '2-4',    label: '2–4 hrs',     emoji: '🕐', xp: 20 },
          { value: '4-6',    label: '4–6 hrs',     emoji: '📺', xp: 10 },
          { value: 'over6',  label: '6+ hrs',      emoji: '😵', xp: 5  },
        ],
      },
      {
        id: 'q8',
        text: 'When you leave a room, lights and fans…',
        options: [
          { value: 'off',     label: 'Always off',      emoji: '💡', xp: 30 },
          { value: 'someone', label: 'Someone else does',emoji: '🙋', xp: 15 },
          { value: 'on',      label: 'Sometimes left on',emoji: '⚠️', xp: 8  },
          { value: 'unaware', label: "I don't notice",   emoji: '😶', xp: 5  },
        ],
      },
      {
        id: 'q9',
        text: 'Do you charge your devices at school?',
        options: [
          { value: 'never',     label: 'Never',        emoji: '🔋', xp: 25 },
          { value: 'sometimes', label: 'Sometimes',    emoji: '⚡', xp: 18 },
          { value: 'often',     label: 'Often',        emoji: '🔌', xp: 10 },
          { value: 'daily',     label: 'Almost daily', emoji: '🪫', xp: 5  },
        ],
      },
    ],
  },

  {
    id: 'waste',
    number: 4,
    icon: '♻️',
    title: 'Waste & Recycling',
    accent: '#166534',
    light:  '#f0fdf4',
    pill:   '#dcfce7',
    pillText: '#14532d',
    questions: [
      {
        id: 'q10',
        text: 'After a snack, your wrapper usually…',
        options: [
          { value: 'recycling', label: 'Goes to recycling', emoji: '♻️', xp: 30 },
          { value: 'keep',      label: 'I keep it for a bin', emoji: '🤲', xp: 25 },
          { value: 'bin',       label: 'Goes in the bin',    emoji: '🗑️', xp: 20 },
          { value: 'not_sure',  label: 'Not sure',           emoji: '🤷', xp: 8  },
        ],
      },
      {
        id: 'q11',
        text: 'How many plastic bottles per week?',
        options: [
          { value: 'none',  label: 'None!',       emoji: '🌱', xp: 30 },
          { value: '1-2',   label: '1–2 bottles', emoji: '🍶', xp: 20 },
          { value: '3-5',   label: '3–5 bottles', emoji: '🧴', xp: 10 },
          { value: 'over5', label: '5+ bottles',  emoji: '♾️', xp: 5  },
        ],
      },
      {
        id: 'q12',
        text: 'Do you bring a reusable water bottle?',
        options: [
          { value: 'always',    label: 'Always!',   emoji: '💧', xp: 30 },
          { value: 'usually',   label: 'Usually',   emoji: '🙂', xp: 20 },
          { value: 'sometimes', label: 'Sometimes', emoji: '🤔', xp: 10 },
          { value: 'never',     label: 'Never',     emoji: '😕', xp: 5  },
        ],
      },
    ],
  },

  {
    id: 'opinion',
    number: 5,
    icon: '🌍',
    title: 'Your Eco Opinion',
    accent: '#6d28d9',
    light:  '#faf5ff',
    pill:   '#ede9fe',
    pillText: '#4c1d95',
    questions: [
      {
        id: 'q13',
        text: 'Which challenge would you actually join?',
        options: [
          { value: 'plantation',  label: 'Tree plantation',  emoji: '🌱', xp: 20 },
          { value: 'plastic_free',label: 'Plastic-free week',emoji: '♻️', xp: 20 },
          { value: 'cycle_day',   label: 'Cycle to school',  emoji: '🚲', xp: 20 },
          { value: 'cleanup',     label: 'Clean-up drive',   emoji: '🧹', xp: 20 },
        ],
      },
      {
        id: 'q14',
        text: 'What contributes most to YOUR carbon footprint?',
        options: [
          { value: 'travel',   label: 'How I travel', emoji: '🚗', xp: 20 },
          { value: 'food',     label: 'Food choices', emoji: '🍱', xp: 20 },
          { value: 'devices',  label: 'My devices',   emoji: '📱', xp: 20 },
          { value: 'waste',    label: 'Waste I make', emoji: '🗑️', xp: 20 },
        ],
      },
      {
        id: 'q15',
        text: 'Which habit helps the environment most?',
        options: [
          { value: 'walking',     label: 'Walking/cycling',   emoji: '🚶', xp: 20 },
          { value: 'less_meat',   label: 'Eating less meat',  emoji: '🥗', xp: 20 },
          { value: 'recycling',   label: 'Recycling',         emoji: '♻️', xp: 20 },
          { value: 'electricity', label: 'Saving electricity',emoji: '💡', xp: 20 },
        ],
      },
    ],
  },
]

export const achieveMoreSuggestions = [
  {
    id: 'walk',
    icon: '🚶',
    title: 'Walk or Cycle to School',
    desc: 'Save ~2.3 kg CO₂ per week vs. car travel. Builds fitness and cuts emissions.',
    xp: '+200 XP/week',
    color: '#16a34a',
    bg: '#dcfce7',
  },
  {
    id: 'meatless',
    icon: '🥗',
    title: 'Try One Meatless Day',
    desc: 'Beef produces 20× more CO₂ than lentils. One veg day = 350 kg less CO₂ per year.',
    xp: '+150 XP/week',
    color: '#d97706',
    bg: '#fef3c7',
  },
  {
    id: 'reusable',
    icon: '💧',
    title: 'Bring a Reusable Bottle',
    desc: 'Replacing 5 plastic bottles/week saves 2.5 kg of plastic waste per school term.',
    xp: '+100 XP/week',
    color: '#2563eb',
    bg: '#dbeafe',
  },
  {
    id: 'lights',
    icon: '💡',
    title: 'Switch Off Lights & Fans',
    desc: 'Schools waste 30% of electricity from lights left on. Be the change!',
    xp: '+80 XP/day',
    color: '#9333ea',
    bg: '#f3e8ff',
  },
  {
    id: 'notebooks',
    icon: '📓',
    title: 'Reuse & Share Notebooks',
    desc: 'Using both sides of paper halves your paper footprint. Pass old books to juniors!',
    xp: '+120 XP/month',
    color: '#0891b2',
    bg: '#cffafe',
  },
  {
    id: 'screens',
    icon: '📱',
    title: 'Cut Screen Time by 1 Hour',
    desc: 'Streaming 1 hour of video emits ~36 g CO₂. Less screen time helps the grid!',
    xp: '+60 XP/day',
    color: '#dc2626',
    bg: '#fee2e2',
  },
]
