export interface StudyAtmosphere {
  id: string;
  name: string;
  institution: string;
  imageUrl: string;
  tagline: string;
  focusQuote: string;
  quoteAuthor: string;
  accentGradient: string;
  badgeColor: string;
}

export const STUDY_ATMOSPHERES: StudyAtmosphere[] = [
  {
    id: 'grand-library',
    name: 'Grand Academic Library',
    institution: "King's College Budo & Makerere Reading Sanctum",
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&q=80',
    tagline: 'Classic mahogany reading tables, warm arched lights & undisturbed scholarly silence.',
    focusQuote: '“Education is the master key that unlocks every locked door in Uganda and across the globe.”',
    quoteAuthor: 'Prof. Asavia Wandira (Former Vice Chancellor, Makerere)',
    accentGradient: 'from-slate-950 via-slate-950/90 to-blue-950/80',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
  },
  {
    id: 'midnight-desk',
    name: 'Midnight Revision Desk',
    institution: 'Gayaza High School Honors Study Hall',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80',
    tagline: 'Pencil on paper, highlighted formula summaries, and laser-sharp focus on UNEB papers.',
    focusQuote: '“Never give up on what you really want to do. The person with big dreams is more powerful than one with all the facts.”',
    quoteAuthor: 'Albert Einstein / NCDC Physics Philosophy',
    accentGradient: 'from-slate-950 via-slate-950/90 to-indigo-950/80',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  },
  {
    id: 'science-sanctum',
    name: 'Distinction Science Lab',
    institution: 'St. Mary’s College Kisubi (SMACK) Science Wing',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&q=80',
    tagline: 'Precision burettes, organic reaction pathways, and physics derivation rigs.',
    focusQuote: '“In science, the credit goes to the one who convinces the world, not to the one to whom the idea first occurs.”',
    quoteAuthor: 'Sir William Osler / Ugandan Science Department Guide',
    accentGradient: 'from-slate-950 via-slate-950/90 to-emerald-950/80',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
  },
  {
    id: 'archival-vault',
    name: 'Archival Past Paper Stacks',
    institution: 'Mt. St. Mary’s Namagunga Knowledge Vault',
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&q=80',
    tagline: 'Quiet aisles containing 20 years of verified UNEB marking guides and top school notes.',
    focusQuote: '“Whatever you do, do it with all your might. Thorough preparation leaves nothing to chance.”',
    quoteAuthor: 'Ugandan Scholarly Motto',
    accentGradient: 'from-slate-950 via-slate-950/90 to-purple-950/80',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  },
  {
    id: 'national-quadrangle',
    name: 'National University Quadrangle',
    institution: 'Path to Makerere University Merit Admission',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80',
    tagline: 'Visualizing national graduation day with Grade 1 Distinction honors.',
    focusQuote: '“The roots of education are bitter, but the fruit is sweet. Concentrate now and reap honors forever.”',
    quoteAuthor: 'Aristotle / National Education Council',
    accentGradient: 'from-slate-950 via-slate-950/90 to-teal-950/80',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
  },
];
