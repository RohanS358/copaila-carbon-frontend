export const schools = [
  { id: 1, name: "ABC School", city: "Kathmandu", students: 450, grade: "A" },
  { id: 2, name: "Green Valley School", city: "Lalitpur", students: 320, grade: "A+" },
  { id: 3, name: "Everest Academy", city: "Bhaktapur", students: 580, grade: "B+" },
  { id: 4, name: "Little Flowers School", city: "Kathmandu", students: 210, grade: "A" },
  { id: 5, name: "Kathmandu Public School", city: "Kathmandu", students: 720, grade: "B" },
]

export const pets = [
  {
    id: 'cat',
    name: 'Eco Cat',
    type: 'Energy',
    color: '#f59e0b',
    bgColor: '#fef3c7',
    description: 'Curious and agile, Eco Cat loves finding ways to save power around the school. A master of turning off lights and unplugging devices!',
    specialPower: 'Clean Energy Mastery',
    abilities: ['Energy Shield', 'Solar Spark'],
    evolutionStages: ['Sprout', 'Glow', 'Solar-Guardian'],
  },
  {
    id: 'dog',
    name: 'Eco Dog',
    type: 'Waste',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    description: 'Loyal and enthusiastic! Eco Dog is always sniffing out recyclables and making sure compost ends up in the right place.',
    specialPower: 'Recycle Rush',
    abilities: ['Compost Boost', 'Zero-Waste Shield'],
    evolutionStages: ['Pup', 'Recycler', 'Waste-Guardian'],
  },
  {
    id: 'penguin',
    name: 'Eco Penguin',
    type: 'Water',
    color: '#06b6d4',
    bgColor: '#cffafe',
    description: 'Cool under pressure! Eco Penguin is dedicated to water conservation and reminding everyone to take shorter showers.',
    specialPower: 'Ice Blast',
    abilities: ['Water Shield', 'Glacier Guard'],
    evolutionStages: ['Hatchling', 'Swimmer', 'Ocean-Guardian'],
  },
  {
    id: 'panda',
    name: 'Eco Panda',
    type: 'Education',
    color: '#4E7D5B',
    bgColor: '#d1fae5',
    description: 'Wise and gentle. Eco Panda loves spreading knowledge about sustainable farming and sharing eco facts with classmates.',
    specialPower: 'Wisdom Wave',
    abilities: ['Knowledge Boost', 'Eco Shield'],
    evolutionStages: ['Sprout', 'Grow', 'Flourish'],
  },
  {
    id: 'rabbit',
    name: 'Eco Rabbit',
    type: 'Flora',
    color: '#22c55e',
    bgColor: '#dcfce7',
    description: 'Energetic and green-thumbed! Eco Rabbit helps tend to the school garden and loves planting trees wherever it goes.',
    specialPower: 'Tree Whisperer',
    abilities: ['Garden Bloom', 'Seed Storm'],
    evolutionStages: ['Seedling', 'Bloom', 'Forest-Guardian'],
  },
  {
    id: 'giraffe',
    name: 'Eco Giraffe',
    type: 'Air Quality',
    color: '#a16207',
    bgColor: '#fef9c3',
    description: 'Head in the clouds (in a good way)! Eco Giraffe monitors clean air initiatives and promotes walking to reduce emissions.',
    specialPower: 'Wind Rider',
    abilities: ['Air Purify', 'Sky Shield'],
    evolutionStages: ['Calf', 'Strider', 'Sky-Guardian'],
  },
]

export const allBadges = [
  { id: 'eco-beginner', name: 'Eco Beginner', emoji: '🌱', description: 'Started your eco journey!', pts: 50 },
  { id: 'green-hero', name: 'Green Hero', emoji: '🌿', description: 'Earned 200+ eco points', pts: 200 },
  { id: 'climate-champion', name: 'Climate Champion', emoji: '🌍', description: 'Earned 500+ eco points', pts: 500 },
]

// NOTE: Hardcoded dashboard sample data (monthlyTrend / scopeData /
// emissionSources / insights) was removed — the School portal now renders
// each school's REAL calculated result from the backend (see
// hooks/useSchoolAudit.js + pages/CarbonDashboard.jsx).

export const recommendations = [
  { icon: '🚲', title: 'Promote Cycling', text: 'Launch a school cycling program to reduce transport emissions by up to 20%.', priority: 'High' },
  { icon: '📄', title: 'Reduce Paper Use', text: 'Switch to digital assignments. Cut paper consumption by 60% with e-learning tools.', priority: 'High' },
  { icon: '💡', title: 'Install LED Lights', text: 'Replace all fluorescent lights with LEDs — save up to 40% on electricity costs.', priority: 'Medium' },
  { icon: '🗑️', title: 'Improve Waste Segregation', text: 'Set up color-coded bins and run a student awareness campaign on recycling.', priority: 'Medium' },
  { icon: '☀️', title: 'Solar Panels', text: 'Install rooftop solar panels to generate clean energy and reduce Scope 2 emissions.', priority: 'Low' },
  { icon: '🌧️', title: 'Rainwater Harvesting', text: 'Collect rainwater for irrigation and toilets to reduce water consumption by 30%.', priority: 'Low' },
]
