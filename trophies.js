/* ==========================================================================
   P5R PLATINUM COMPANION — DATA MODULE (trophies.js)
   PS5 Persona 5 Royal · 53 trophies (1 Platinum · 1 Gold · 7 Silver · 44 Bronze)

   HOW TO ADD BATCHES 2 & 3
   Paste each new batch at the very bottom of this file using the same call:
       P5R.addTrophies([ { ...trophy... }, { ... } ]);
   The app de-duplicates by `id`, so pasting a batch twice is harmless.
   ========================================================================== */

var P5R = window.P5R = window.P5R || {};

/* ---------- Official totals (used by the dashboard even before all batches are added) ---------- */
P5R.TOTALS = { platinum: 1, gold: 1, silver: 7, bronze: 44, all: 53 };

/* Rough time to Platinum for one careful playthrough (hours). */
P5R.HOURS = { min: 80, max: 100 };

/* Allowed filter tags */
P5R.TAGS = ['Missable', 'Third Semester', 'Story', 'Combat', 'Activities'];

/* Dynamic Phantom Thief rank, unlocked by completion % */
P5R.RANKS = [
  { at: 0,   title: 'Transfer Student',            blurb: 'Fresh off the train to Yongen-Jaya.' },
  { at: 10,  title: 'Awakened Wild Card',          blurb: 'Arsène answers your call.' },
  { at: 25,  title: 'Rookie Phantom Thief',        blurb: 'Your first calling card is out.' },
  { at: 40,  title: 'Palace Infiltrator',          blurb: 'Security levels fear you.' },
  { at: 55,  title: 'Mementos Regular',            blurb: 'Jose knows your name.' },
  { at: 70,  title: 'Heart Thief',                 blurb: 'Tokyo is talking about you.' },
  { at: 85,  title: 'Trickster',                   blurb: 'The finish line is in sight.' },
  { at: 100, title: 'The Phenomenal Phantom Thief', blurb: 'Platinum secured. Take a bow.' }
];

/* Internal registry ------------------------------------------------------- */
P5R.trophies = P5R.trophies || [];
P5R.addTrophies = function addTrophies(list) {
  const seen = new Set(P5R.trophies.map(t => t.id));
  list.forEach(t => {
    if (!seen.has(t.id)) { P5R.trophies.push(t); seen.add(t.id); }
  });
  P5R.trophies.sort((a, b) => a.num - b.num);
  if (typeof P5R.onDataChanged === 'function') P5R.onDataChanged();
};

/* ==========================================================================
   COMPANION DATA — CLASSROOM & EXAM ANSWERS (sorted by date)
   exam: true = written exam question (counts toward "A Most Studious Disguise")
   ========================================================================== */
P5R.classroom = [
  // April
  { date: '4/12', month: 'April', q: 'Devil\'s Dictionary: what drives human progress?', a: 'Villains', exam: false },
  { date: '4/19', month: 'April', q: 'Which line looks longer, A or B?', a: 'They\'re the same', exam: false },
  { date: '4/23', month: 'April', q: 'Which events did Nero win at the Olympics?', a: 'All of them', exam: false },
  { date: '4/25', month: 'April', q: '"My country, right or wrong" — the common meaning', a: 'You unquestionably support it', exam: false },
  { date: '4/25', month: 'April', q: '"My country, right or wrong" — the original meaning', a: 'You have a duty to correct it', exam: false },
  { date: '4/27', month: 'April', q: 'Theorem named after this number', a: 'Four-color theorem', exam: false },
  { date: '4/30', month: 'April', q: 'Meaning of "wunder"', a: 'Wonder', exam: false },
  { date: '4/30', month: 'April', q: 'Meaning of "kind"', a: 'Child', exam: false },
  { date: '4/30', month: 'April', q: 'So what does "wunderkind" make you?', a: 'A prodigy', exam: false },
  // May
  { date: '5/7',  month: 'May', q: 'Literal translation of "femme fatale"', a: 'Fatal woman', exam: false },
  { date: '5/10', month: 'May', q: 'Era when Yoshitsune was active', a: 'The Heian period', exam: false },
  { date: '5/11', month: 'May', q: 'Figure behind "favoring the magistrate"', a: 'Minamoto no Yoshitsune', exam: true },
  { date: '5/11', month: 'May', q: 'Yoshitsune\'s brother', a: 'Minamoto no Yoritomo', exam: true },
  { date: '5/11', month: 'May', q: 'Who won the brothers\' conflict?', a: 'Yoritomo won', exam: true },
  { date: '5/11', month: 'May', q: 'Who do people tend to sympathize with?', a: 'The weak', exam: true },
  { date: '5/12', month: 'May', q: 'Brain function behind the optical illusion', a: 'Cognition', exam: true },
  { date: '5/12', month: 'May', q: 'Which maps can be colored with no adjacent matches?', a: 'Both', exam: true },
  { date: '5/13', month: 'May', q: 'Book that defines "male factor"', a: 'The Devil\'s Dictionary', exam: true },
  { date: '5/13', month: 'May', q: 'The mysterious, seductive woman archetype', a: 'Femme Fatale', exam: true },
  { date: '5/16', month: 'May', q: 'Believing in a treatment improves your condition', a: 'The placebo effect', exam: false },
  { date: '5/19', month: 'May', q: 'Edo artist who moved over 100 times', a: 'Katsushika Hokusai', exam: false },
  { date: '5/21', month: 'May', q: 'The silver ratio', a: '1:1.414', exam: false },
  { date: '5/23', month: 'May', q: 'Meaning of "syn"', a: 'Together', exam: false },
  { date: '5/23', month: 'May', q: 'Meaning of "aisthesis"', a: 'Senses', exam: false },
  { date: '5/23', month: 'May', q: 'So the full word means…', a: 'Senses coming together', exam: false },
  { date: '5/26', month: 'May', q: 'Author Leblanc borrowed a character from', a: 'Arthur Conan Doyle', exam: false },
  { date: '5/31', month: 'May', q: 'Character behind the classic pirate image', a: 'John Silver', exam: false },
  // June
  { date: '6/4',  month: 'June', q: 'Name of this perception phenomenon', a: 'The halo effect', exam: false },
  { date: '6/7',  month: 'June', q: 'How a red king crab differs from true crabs', a: 'The number of legs', exam: false },
  { date: '6/8',  month: 'June', q: 'Totalitarianism goes beyond authoritarianism by…', a: 'Controlling public thought', exam: false },
  { date: '6/13', month: 'June', q: 'Hair color after washing with copper', a: 'Green', exam: false },
  { date: '6/15', month: 'June', q: 'Which money is government-issued?', a: 'Coins', exam: false },
  { date: '6/20', month: 'June', q: 'Item containing minor metals', a: 'Smartphone', exam: false },
  { date: '6/23', month: 'June', q: 'The woman\'s position', a: 'A pope', exam: false },
  { date: '6/27', month: 'June', q: 'Animal in an English weather idiom', a: 'Dogs', exam: false },
  { date: '6/29', month: 'June', q: 'What\'s on the back of the shogi piece?', a: 'Gold', exam: false },
  // July
  { date: '7/1',  month: 'July', q: 'Original meaning of the dumplings\' name', a: 'Barbarian\'s head', exam: false },
  { date: '7/4',  month: 'July', q: 'Who gave July and August 31 days?', a: 'Julius and Augustus', exam: false },
  { date: '7/7',  month: 'July', q: 'What the Tanabata lovers must cross', a: 'The Milky Way', exam: false },
  { date: '7/7',  month: 'July', q: 'Traditional Tanabata food', a: 'Somen noodles', exam: false },
  { date: '7/9',  month: 'July', q: 'What shape is it?', a: 'A triangle', exam: false },
  { date: '7/11', month: 'July', q: 'What is long-term memory?', a: 'Memories that last a long time', exam: false },
  { date: '7/11', month: 'July', q: 'How much can it store?', a: 'Infinite', exam: false },
  { date: '7/11', month: 'July', q: 'How long can it be retained?', a: 'Forever', exam: false },
  { date: '7/12', month: 'July', q: 'What did he do?', a: 'Thievery', exam: false },
  { date: '7/13', month: 'July', q: 'Angles of B and E', a: '64 degrees', exam: true },
  { date: '7/13', month: 'July', q: 'Strategist from Romance of the Three Kingdoms', a: 'Zhuge Liang', exam: true },
  { date: '7/13', month: 'July', q: 'What was offered to calm the river?', a: 'Barbarians\' heads', exam: true },
  { date: '7/13', month: 'July', q: 'Why the strategist made the buns', a: 'To offer them instead of heads', exam: true },
  { date: '7/14', month: 'July', q: 'Name and genus of the organism', a: 'Red King Crab (Paralithodes)', exam: true },
  { date: '7/14', month: 'July', q: 'Result of Japan\'s first paper money', a: 'It caused confusion in the economy', exam: true },
  { date: '7/15', month: 'July', q: 'English equivalent of "raining witches"', a: 'Raining cats and dogs', exam: true },
  { date: '7/15', month: 'July', q: 'Another name for the Tanabata noodles', a: 'Demon guts', exam: true },
  // September
  { date: '9/3',  month: 'September', q: 'What the statue\'s raised right hand represents', a: 'Prosperity', exam: false },
  { date: '9/6',  month: 'September', q: 'Second hand seems frozen — the phenomenon', a: 'Chronostasis', exam: false },
  { date: '9/14', month: 'September', q: 'What a pawn shop offers that a secondhand shop doesn\'t', a: 'Money loans for collateral', exam: false },
  { date: '9/17', month: 'September', q: 'Origin of "cat got your tongue"', a: 'Cats eating human tongues', exam: false },
  { date: '9/21', month: 'September', q: 'Where is the Czech Republic?', a: 'Central Europe', exam: false },
  { date: '9/24', month: 'September', q: 'White and black panels on a soccer ball', a: '20 white, 12 black', exam: false },
  { date: '9/28', month: 'September', q: 'The "P" in PVS', a: 'Phantom', exam: false },
  { date: '9/28', month: 'September', q: 'The "V" in PVS', a: 'Vibration', exam: false },
  { date: '9/28', month: 'September', q: 'The "S" in PVS', a: 'Syndrome', exam: false },
  { date: '9/29', month: 'September', q: 'Who employs the Nagara River cormorant fishers?', a: 'Imperial Household Agency', exam: false },
  // October
  { date: '10/3',  month: 'October', q: 'What the melons stand for in the size comparison', a: 'Stars', exam: false },
  { date: '10/6',  month: 'October', q: 'Who the guillotine is named after', a: 'Joseph-Ignace Guillotin', exam: false },
  { date: '10/11', month: 'October', q: 'The name most people give shape B', a: 'Bouba', exam: false },
  { date: '10/17', month: 'October', q: 'Total surfaces on a soccer ball', a: '32 surfaces', exam: true },
  { date: '10/17', month: 'October', q: 'How many colors did the ball originally have?', a: 'It used to be one color', exam: true },
  { date: '10/17', month: 'October', q: 'How matches used to be broadcast', a: 'Black and white picture', exam: true },
  { date: '10/18', month: 'October', q: 'Who carried out executions with the device?', a: 'Charles-Henri Sanson', exam: true },
  { date: '10/18', month: 'October', q: 'Why few can become cormorant fishers', a: 'It\'s a hereditary profession', exam: true },
  { date: '10/19', month: 'October', q: 'Meaning of "robota"', a: 'Slave labor', exam: true },
  { date: '10/19', month: 'October', q: 'How sparse stars are in space', a: '3 bees in all of Europe', exam: true },
  { date: '10/22', month: 'October', q: 'Sum of each column in the magic square', a: '15', exam: false },
  { date: '10/24', month: 'October', q: 'Why memories differ from what happened', a: 'Memory bias', exam: false },
  // November
  { date: '11/2',  month: 'November', q: 'Meaning of "wack" in thieves\' cant', a: 'A share of stolen goods', exam: false },
  { date: '11/4',  month: 'November', q: 'What the spade suit represents', a: 'A sword', exam: false },
  { date: '11/8',  month: 'November', q: 'Age needed to watch a trial', a: 'Any age', exam: false },
  { date: '11/10', month: 'November', q: 'Why the kanji for crow is missing a stroke', a: 'Crow eyes are hard to see', exam: false },
  { date: '11/12', month: 'November', q: 'Why voices sound different on the phone', a: 'Because the voice is synthetic', exam: false },
  { date: '11/14', month: 'November', q: 'Why the sun looks different over Mt. Fuji', a: 'Because of high altitude', exam: false },
  { date: '11/15', month: 'November', q: 'Nezumi Kozo\'s punishment', a: 'His head was put on display', exam: false },
  { date: '11/17', month: 'November', q: 'Name of the snail-shaped graph', a: 'Cochleoid', exam: false },
  // December (finals — last chance for A Most Studious Disguise)
  { date: '12/20', month: 'December', q: 'Graph named after the diabolo', a: 'D', exam: true },
  { date: '12/20', month: 'December', q: 'How much the Edo thief stole', a: 'Over one billion yen', exam: true },
  { date: '12/20', month: 'December', q: 'His sentence', a: 'Having his head displayed', exam: true },
  { date: '12/20', month: 'December', q: 'Why criminals were paraded around', a: 'Public performance', exam: true },
  { date: '12/21', month: 'December', q: 'Card suit that represents the Holy Grail', a: 'Hearts', exam: true },
  { date: '12/21', month: 'December', q: 'What even an infant may do in a Japanese court', a: 'Attend', exam: true },
  { date: '12/22', month: 'December', q: 'Country with a "prime minister in black"', a: 'Japan', exam: true },
  { date: '12/22', month: 'December', q: 'English word behind "do" in dokyuu', a: 'Dreadnought', exam: true },
  // January (Third Semester only)
  { date: '1/11', month: 'January', q: 'What the phrase about Shinto gods illustrates', a: 'How numerous they are', exam: false, thirdSemester: true },
  { date: '1/11', month: 'January', q: 'Name of that phrase', a: 'The eight million gods', exam: false, thirdSemester: true },
  { date: '1/14', month: 'January', q: 'Region the fictional "Ihatov" is based on', a: 'Iwate', exam: false, thirdSemester: true },
  { date: '1/18', month: 'January', q: 'Original meaning of "awful"', a: 'Impressive', exam: false, thirdSemester: true },
  { date: '1/20', month: 'January', q: 'What is she stepping on?', a: 'A snake', exam: false, thirdSemester: true },
  { date: '1/24', month: 'January', q: 'Meaning of "sweet" for a person', a: 'Kind-hearted', exam: false, thirdSemester: true },
  { date: '1/24', month: 'January', q: 'Connotation of "salty" here', a: 'Negative', exam: false, thirdSemester: true },
  { date: '1/24', month: 'January', q: 'Meaning of "salty"', a: 'Resentful', exam: false, thirdSemester: true },
  { date: '1/27', month: 'January', q: 'How far happiness spreads, per the study', a: 'To friends of friends of friends', exam: false, thirdSemester: true }
];

/* ==========================================================================
   COMPANION DATA — CONFIDANT CHEAT SHEET
   deadline: shown as a red badge (Third Semester requirements)
   romance: can enter a special relationship (for "My Closest Partner")
   ========================================================================== */
P5R.confidants = [
  { arcana: 'Fool',        name: 'Igor',                       where: 'Velvet Room',                       how: 'Story-driven — ranks up automatically.', auto: true },
  { arcana: 'Magician',    name: 'Morgana',                    where: 'Story',                             how: 'Story-driven — ranks up automatically.', auto: true },
  { arcana: 'Priestess',   name: 'Makoto Niijima',             where: 'Shujin Academy (after school)',     how: 'Bring a Priestess Persona. Romanceable.', romance: true },
  { arcana: 'Empress',     name: 'Haru Okumura',               where: 'Shujin rooftop garden',             how: 'Opens later in the story. Romanceable.', romance: true },
  { arcana: 'Emperor',     name: 'Yusuke Kitagawa',            where: 'Phone invites',                     how: 'Bring an Emperor Persona.' },
  { arcana: 'Hierophant',  name: 'Sojiro Sakura',              where: 'Leblanc (evenings)',                how: 'His coffee/curry perks save money on SP items.' },
  { arcana: 'Lovers',      name: 'Ann Takamaki',               where: 'Shujin Academy / phone',            how: 'Bring a Lovers Persona. Romanceable.', romance: true },
  { arcana: 'Chariot',     name: 'Ryuji Sakamoto',             where: 'Shujin Academy / phone',            how: 'Easy early max — good pick for True Confidence.' },
  { arcana: 'Justice',     name: 'Goro Akechi',                where: 'Phone / Kichijoji',                 how: 'Does NOT rank automatically in Royal. Some ranks gated by stats.', deadline: 'Rank 8 by 11/17' },
  { arcana: 'Hermit',      name: 'Futaba Sakura',              where: 'Yongen-Jaya / phone',               how: 'Opens later in the story. Romanceable.', romance: true },
  { arcana: 'Fortune',     name: 'Chihaya Mifune',             where: 'Shinjuku (night)',                  how: 'Affinity Reading at Rank 5 (¥5,000) — see the tip card above. Romanceable.', romance: true },
  { arcana: 'Strength',    name: 'Caroline & Justine',         where: 'Velvet Room',                       how: 'Fuse the Personas they request.' },
  { arcana: 'Hanged Man',  name: 'Munehisa Iwai',              where: 'Untouchable, Shibuya Central St.',  how: 'Unlocks gun customization perks.' },
  { arcana: 'Death',       name: 'Tae Takemi',                 where: 'Takemi Medical Clinic, Yongen-Jaya',how: 'Cheap healing items early on. Romanceable.', romance: true },
  { arcana: 'Temperance',  name: 'Sadayo Kawakami',            where: 'Phone from Leblanc attic (night)',  how: 'Frees up time-of-day actions. Romanceable.', romance: true },
  { arcana: 'Devil',       name: 'Ichiko Ohya',                where: 'Crossroads Bar, Shinjuku (night)',  how: 'Lowers alert levels in Palaces. Romanceable.', romance: true },
  { arcana: 'Tower',       name: 'Shinya Oda',                 where: 'Arcade, Akihabara',                 how: 'Gun combat perks.' },
  { arcana: 'Star',        name: 'Hifumi Togo',                where: 'Kanda Church',                      how: 'Swap party members mid-battle. Romanceable.', romance: true },
  { arcana: 'Moon',        name: 'Yuuki Mishima',              where: 'Shujin Academy / phone',            how: 'EXP for benched party members.' },
  { arcana: 'Sun',         name: 'Toranosuke Yoshida',         where: 'Shibuya Station Square (Sundays)',  how: 'Negotiation perks.' },
  { arcana: 'Judgement',   name: 'Sae Niijima',                where: 'Story',                             how: 'Story-driven — ranks up automatically.', auto: true },
  { arcana: 'Faith',       name: 'Kasumi Yoshizawa',           where: 'Shujin Academy / phone',            how: 'Capped at Rank 5 until the Third Semester. Romanceable there.', romance: true, deadline: 'Rank 5 by 12/18' },
  { arcana: 'Councillor',  name: 'Takuto Maruki',              where: 'Shujin counselor\'s office',        how: 'Capped at Rank 5 until 9/20. Rank 10 is automatic.', deadline: 'Rank 9 by 11/17' }
];

/* ==========================================================================
   ROADMAP STEPS (checkable — saved in localStorage)
   ========================================================================== */
P5R.roadmap = [
  {
    id: 'rm-1', phase: 'Before You Start', title: 'Know the rules of this Platinum',
    body: [
      'One careful playthrough on any difficulty. Difficulty doesn\'t affect trophies.',
      'Only one trophy is tied to the Third Semester (Take Back the Future), but the Platinum needs it. Plan around the Councillor deadline from day one.',
      'Save in multiple slots, at least one per in-game month, so you can roll back if you miss a deadline.'
    ]
  },
  {
    id: 'rm-2', phase: 'April (4/12 onward)', title: 'Decide on the PS5 DLC box',
    body: [
      'The PS5 version bundles nearly all previously released DLC. Claim it from the cardboard box in Joker\'s attic, available from 4/12.',
      'Warning: the box hands you 100,000+ yen, strong items, and overpowered DLC Personas that can be summoned free. Great for speed, but it trivializes early Palaces. You can\'t un-claim it.',
      'DLC Personas occupy level slots in their Arcana, so some Velvet Room fusion results shift. If a recipe from a guide gives you a different Persona, switch the "DLC" toggle on in your fusion calculator.'
    ]
  },
  {
    id: 'rm-3', phase: 'April – July', title: 'Clear Palaces fast, build stats, start key Confidants',
    body: [
      'Aim to clear each Palace in 1–2 in-game days. Every free day goes to stats and Confidants.',
      'Pick up the easy Bronze activity trophies as you unlock each area (part-time job, batting cages, Leblanc cleanup, darts, billiards and so on).',
      'Meet Maruki (Councillor) as soon as he\'s available and push him to Rank 5 early. He is capped at Rank 5 until 9/20.',
      'Use the Classroom Answers tab every school day. Correct answers raise Knowledge, which is needed for the exam trophy.'
    ]
  },
  {
    id: 'rm-4', phase: '9/20 – 11/17', title: 'THE CRITICAL WINDOW',
    critical: true,
    body: [
      'Councillor (Maruki) to Rank 9 by 11/17. This is mandatory for the Third Semester.',
      'Justice (Akechi) to Rank 8 by 11/17 (strongly recommended) for the true ending and extra scenes.',
      'Carry a Persona of the matching Arcana to every hangout, and use Chihaya\'s Affinity Reading on whoever is closest to ranking up.'
    ]
  },
  {
    id: 'rm-5', phase: 'December', title: 'Kasumi, finals, and the depths of Mementos',
    body: [
      'Faith (Kasumi) to Rank 5 by 12/18 (strongly recommended). Some guides say 12/22, but 12/18 is the safe target.',
      'Finals run 12/20 – 12/22 and are your last chance at top of the class. All the answers are in the Classroom tab.',
      'Always refuse any "deal" an antagonist offers you. Accepting leads to a bad ending and locks story trophies.'
    ]
  },
  {
    id: 'rm-6', phase: 'Late Game', title: 'Hunt the Reaper and max your social stats',
    body: [
      'The Reaper shows up if you linger too long on one floor of a Palace or Mementos. Come back once your team is high level.',
      'Finish off any remaining social stats and confirm you have one maxed Confidant and one romance.'
    ]
  },
  {
    id: 'rm-7', phase: 'Third Semester', title: 'Finish the final Palace and watch the ending',
    body: [
      'Clear the Third Semester Palace for Take Back the Future, then reach the ending for The Path Chosen.',
      'Thieves Den awards (P Medals) are in-game only and separate from PlayStation trophies. They still overlap with many trophy activities, so they make a good second checklist.'
    ]
  },
  {
    id: 'rm-8', phase: 'Cleanup', title: 'Mop up with New Game+ if needed',
    body: [
      'If you missed anything, NG+ carries over your social stats and Compendium, so cleanup goes quickly.'
    ]
  }
];

/* ==========================================================================
   TROPHIES — BATCH 1 OF 3  (#1 – #18)
   Fields:
     id, num, name, description (in-game text), grade,
     tags[], spoiler (blurred by Spoiler Shield), missable (bool),
     when (earliest / timing), guide[] (steps), tip (pro tip)
   ========================================================================== */
P5R.addTrophies([
  {
    id: 'phenomenal-phantom-thief', num: 1,
    name: 'The Phenomenal Phantom Thief',
    description: 'Obtained all trophies.',
    grade: 'platinum', tags: [], spoiler: false, missable: false,
    when: 'After all 52 other trophies',
    guide: [
      'Unlocks automatically once every other trophy is earned. This tracker checks it for you when the other 52 are ticked.',
      'The biggest risk is missing the Third Semester. Councillor Rank 9 by 11/17 is non-negotiable.'
    ],
    tip: 'Keep a backup save from early November. If Maruki is behind schedule, you can reload instead of replaying 80 hours.'
  },
  {
    id: 'spirit-of-rebellion', num: 2,
    name: 'Spirit of Rebellion',
    description: 'Obtained Arsène.',
    grade: 'bronze', tags: ['Story'], spoiler: false, missable: false,
    when: 'Prologue (April)',
    guide: ['Story-related and can\'t be missed. It unlocks during the opening hours.'],
    tip: 'Use the early free days to get started on Charm and Knowledge.'
  },
  {
    id: 'phantom-thieves-assemble', num: 3,
    name: 'Phantom Thieves: Assemble!',
    description: 'Established your own squad of thieves.',
    grade: 'bronze', tags: ['Story'], spoiler: true, missable: false,
    when: 'First story arc',
    guide: ['Story-related and can\'t be missed. It unlocks when the team officially forms.'],
    tip: 'You get to name the team. It\'s purely cosmetic and doesn\'t affect trophies.'
  },
  {
    id: 'castle-of-lust', num: 4,
    name: 'Castle of Lust: Seized',
    description: 'Completed the castle Palace.',
    grade: 'bronze', tags: ['Story', 'Combat'], spoiler: true, missable: false,
    when: 'First Palace',
    guide: [
      'Clear the first Palace before its calendar deadline.',
      'Recommended: secure the route on day one, send the calling card, and take the Treasure the next day.'
    ],
    tip: 'Collect all three Will Seeds here to knock out Talent Thief early.'
  },
  {
    id: 'museum-of-vanity', num: 5,
    name: 'Museum of Vanity: Repossessed',
    description: 'Completed the museum Palace.',
    grade: 'bronze', tags: ['Story', 'Combat'], spoiler: true, missable: false,
    when: 'Second Palace',
    guide: ['Clear the second Palace before its deadline.'],
    tip: 'Clearing fast frees extra days for Maruki, who opens up around this time.'
  },
  {
    id: 'bank-of-gluttony', num: 6,
    name: 'Bank of Gluttony: Cleaned Out',
    description: 'Completed the bank Palace.',
    grade: 'bronze', tags: ['Story', 'Combat'], spoiler: true, missable: false,
    when: 'Third Palace',
    guide: ['Clear the third Palace before its deadline.'],
    tip: 'Stock up on SP items first. Sojiro\'s coffee and Takemi\'s clinic help a lot here.'
  },
  {
    id: 'pyramid-of-wrath', num: 7,
    name: 'Pyramid of Wrath: Plundered',
    description: 'Completed the pyramid Palace.',
    grade: 'bronze', tags: ['Story', 'Combat'], spoiler: true, missable: false,
    when: 'Fourth Palace',
    guide: ['Clear the fourth Palace before its deadline.'],
    tip: 'Summer break follows. It\'s the best stretch for stats and activity trophies.'
  },
  {
    id: 'spaceport-of-greed', num: 8,
    name: 'Spaceport of Greed: Obliterated',
    description: 'Completed the spaceport Palace.',
    grade: 'bronze', tags: ['Story', 'Combat'], spoiler: true, missable: false,
    when: 'Fifth Palace',
    guide: ['Clear the fifth Palace before its deadline.'],
    tip: 'Maruki\'s ranks 6+ open on 9/20. Have him at Rank 5 and ready.'
  },
  {
    id: 'casino-of-jealousy', num: 9,
    name: 'Casino of Jealousy: Bankrupted',
    description: 'Completed the casino Palace.',
    grade: 'bronze', tags: ['Story', 'Combat'], spoiler: true, missable: false,
    when: 'Sixth Palace (deadline lines up with 11/17)',
    guide: [
      'Clear the sixth Palace before its deadline.',
      'Its deadline coincides with the Councillor/Justice cutoff. Finish Maruki R9 and Akechi R8 before this Palace locks the calendar.'
    ],
    tip: 'Clear this Palace in as few days as you can. Every day saved goes to Maruki and Akechi.'
  },
  {
    id: 'cruiser-of-pride', num: 10,
    name: 'Cruiser of Pride: Capsized',
    description: 'Completed the cruise ship Palace.',
    grade: 'bronze', tags: ['Story', 'Combat', 'Missable'], spoiler: true, missable: true,
    when: 'Seventh Palace (December)',
    guide: [
      'Clear the seventh Palace before its deadline.',
      'Missable: refuse every deal an antagonist offers before this point. Accepting leads to a bad ending and you never reach this Palace.'
    ],
    tip: 'Keep a separate save before any big story choice in late November.'
  },
  {
    id: 'thorough-trickster', num: 11,
    name: 'The Thorough Trickster',
    description: 'Completed Mementos.',
    grade: 'bronze', tags: ['Story', 'Missable'], spoiler: true, missable: true,
    when: 'December',
    guide: [
      'Reach the bottom of Mementos as part of the main story.',
      'Missable only if you take a bad ending first. Stay on the "refuse all deals" path.'
    ],
    tip: 'Finish your Mementos requests before the depths so you don\'t need extra trips later.'
  },
  {
    id: 'take-back-the-future', num: 12,
    name: 'Take Back the Future',
    description: 'Completed every Palace.',
    grade: 'bronze', tags: ['Story', 'Third Semester', 'Missable'], spoiler: true, missable: true,
    when: 'Third Semester (January)',
    guide: [
      'You must clear the Third Semester Palace as well as the original seven.',
      'Requires Councillor (Maruki) Rank 9 by 11/17. Without it the game skips the Third Semester and this trophy is gone for this playthrough.',
      'Also refuse the Third Semester offer. The good path leads you through the final Palace.'
    ],
    tip: 'This is the main reason the Platinum needs the Third Semester. Treat the 11/17 deadline as your top priority.'
  },
  {
    id: 'path-chosen', num: 13,
    name: 'The Path Chosen',
    description: 'Watched the ending.',
    grade: 'gold', tags: ['Story', 'Third Semester'], spoiler: true, missable: false,
    when: 'End of the game',
    guide: [
      'Any ending counts, including a bad one.',
      'Bad endings cut the game short, though, and lock out other story trophies. For the Platinum, aim for the true ending.'
    ],
    tip: 'True ending: Maruki R9 + Akechi R8 by 11/17, Kasumi R5 by 12/18, and refuse every offer.'
  },
  {
    id: 'most-studious-disguise', num: 14,
    name: 'A Most Studious Disguise',
    description: 'Scored the highest on your exams.',
    grade: 'silver', tags: ['Activities', 'Missable'], spoiler: false, missable: true,
    when: 'Exams: May · July · October · December (12/20–22 is the last)',
    guide: [
      'Answer every exam question correctly and have a high enough Knowledge rank when exams start.',
      'Most players get it at the December finals once Knowledge is maxed.',
      'Missable after the December finals, since there are no exams after that.'
    ],
    tip: 'Answer every class question correctly too. They raise Knowledge, and the exam questions build on the same topics.'
  },
  {
    id: 'pure-perfection', num: 15,
    name: 'Pure Perfection',
    description: 'Maxed out all social stats.',
    grade: 'silver', tags: ['Activities'], spoiler: false, missable: false,
    when: 'Usually October – December',
    guide: [
      'Max all five stats: Knowledge, Guts, Proficiency, Kindness, Charm.',
      'Rainy days and certain weekdays give bonus points at many study and activity spots.',
      'Chihaya\'s Luck Reading (Fortune Rank 1) temporarily boosts growth of a chosen stat.',
      'Read books on train rides and at night. Several also count toward other activity unlocks.'
    ],
    tip: 'Some Confidants (Akechi included) gate ranks behind stat levels, so build stats early to keep the 11/17 plan on track.'
  },
  {
    id: 'closest-partner', num: 16,
    name: 'My Closest Partner',
    description: 'Entered a special relationship.',
    grade: 'silver', tags: ['Activities'], spoiler: false, missable: false,
    when: 'When a romanceable Confidant reaches the romance rank',
    guide: [
      'Choose the romance dialogue when a romanceable Confidant offers it, usually at Rank 9.',
      'Romanceable: Ann, Makoto, Haru, Futaba, Kasumi, Hifumi, Tae, Sadayo, Ichiko, Chihaya.',
      'Kasumi\'s romance only happens in the Third Semester. Pick someone else if you want this trophy earlier.'
    ],
    tip: 'Dating more than one person at once has in-game consequences. Pick one partner unless you\'re deliberately going for that scene.'
  },
  {
    id: 'true-confidence', num: 17,
    name: 'True Confidence',
    description: 'Maxed out one of your Confidants.',
    grade: 'silver', tags: ['Activities'], spoiler: false, missable: false,
    when: 'Mid-game',
    guide: [
      'Max any single Confidant to Rank 10.',
      'Ryuji (Chariot), Takemi (Death), and Sojiro (Hierophant) are quick, low-commitment picks.'
    ],
    tip: 'Carry a Persona of the matching Arcana to every hangout for bonus affinity.'
  },
  {
    id: 'talent-thief', num: 18,
    name: 'Talent Thief',
    description: 'Obtained a Skill Accessory from a Palace ruler.',
    grade: 'silver', tags: ['Combat'], spoiler: false, missable: false,
    when: 'Possible in the first Palace',
    guide: [
      'Collect all three Will Seeds in a single Palace to earn that ruler\'s Skill Accessory.',
      'Will Seeds glow red and sit along the main path or in side rooms. Each one fully restores your SP when you collect it.',
      'The first Palace is the easiest place to do it.'
    ],
    tip: 'If you miss a seed, you can usually go back before sending the calling card.'
  }
]);

/* ==========================================================================
   ▼▼▼  PASTE BATCH 2 (#19 – #36) BELOW THIS LINE  ▼▼▼
   ========================================================================== */


/* ==========================================================================
   ▼▼▼  PASTE BATCH 3 (#37 – #53) BELOW THIS LINE  ▼▼▼
   ========================================================================== */
