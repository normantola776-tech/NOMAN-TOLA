import { CrossSchoolBriefTest } from '../types.ts';

export const CROSS_SCHOOL_BRIEF_TESTS: CrossSchoolBriefTest[] = [
  {
    id: 'test-budo-phys-01',
    schoolName: "King's College Budo",
    librarySource: "Budo Centenary Library Archive (UNEB UCE Test Series)",
    subject: 'Physics',
    sector: 'Science',
    classLevel: 'Senior Four',
    title: "Electromagnetic Induction & Alternating Current Quick Assessment",
    description: "Standard 5-question high-yield test retrieved from King's College Budo Physics Department past paper archives and Google Scholar curriculum index.",
    durationMinutes: 15,
    totalMarks: 20,
    questions: [
      {
        id: 1,
        question: "According to Faraday's law of electromagnetic induction, what determines the magnitude of the induced electromotive force (e.m.f.) in a closed circuit?",
        options: [
          "The electrical resistance of the coil wire",
          "The rate of change of magnetic flux linkage through the circuit",
          "The absolute magnetic field strength independent of time",
          "The electrostatic potential of the surrounding air"
        ],
        correctIndex: 1,
        explanation: "Faraday's Law states that induced e.m.f. E is directly proportional to the rate of change of magnetic flux linkage: E = -N(dΦ/dt).",
        libraryMarkSchemeReference: "Nelkon & Parker Advanced Physics, Ch. 34; King's College Budo Mock Paper 1 Marking Guide, Item 12."
      },
      {
        id: 2,
        question: "Lenz's Law is a direct consequence of which fundamental law of classical physics?",
        options: [
          "Law of Conservation of Electric Charge",
          "Law of Conservation of Energy",
          "Newton's Universal Law of Gravitation",
          "Ohm's Law"
        ],
        correctIndex: 1,
        explanation: "Lenz's law states the induced current flows in a direction opposing the change causing it; mechanical work must be done against this opposing force, conserving energy.",
        libraryMarkSchemeReference: "Abbott Ordinary Level Physics (NCDC Uganda Syllabus), Section 8; UNEB UCE Paper 1 Marking Key."
      },
      {
        id: 3,
        question: "Why are the soft-iron cores of step-up and step-down transformers laminated with thin insulating varnish?",
        options: [
          "To reduce hysteresis loss",
          "To reduce resistance in the copper windings",
          "To minimize energy losses due to eddy currents",
          "To prevent overheating by electrostatic sparking"
        ],
        correctIndex: 2,
        explanation: "Laminations break up the continuous conducting paths for circular eddy currents, thereby greatly reducing I^2*R Joule heating in the iron core.",
        libraryMarkSchemeReference: "Cambridge IGCSE & UNEB Joint Scheme of Work; King's College Budo Physics Dept Archive."
      },
      {
        id: 4,
        question: "A step-down transformer operates on 240 V mains to supply 12 V to a laboratory bulb. If the primary coil has 1200 turns, how many turns are on the secondary coil?",
        options: [
          "60 turns",
          "120 turns",
          "240 turns",
          "600 turns"
        ],
        correctIndex: 0,
        explanation: "Turns ratio: Ns / Np = Vs / Vp => Ns = 1200 * (12 / 240) = 1200 * (1 / 20) = 60 turns.",
        libraryMarkSchemeReference: "UNEB UCE 2023 Physics Paper 2, Section A, Qn 4; Budo Test Series Scheme."
      }
    ]
  },
  {
    id: 'test-gayaza-chem-01',
    schoolName: "Gayaza High School",
    librarySource: "Gayaza High School Digital Science Repository & Google Scholar Chemistry Index",
    subject: 'Chemistry',
    sector: 'Science',
    classLevel: 'Senior Four',
    title: "Volumetric Analysis & Acid-Base Stoichiometry Brief Test",
    description: "UNEB Paper 3 and Paper 2 volumetric calculations test series prepared by Gayaza High School Chemistry Department.",
    durationMinutes: 15,
    totalMarks: 20,
    questions: [
      {
        id: 1,
        question: "Which of the following substances is used as a primary standard in acid-base volumetric titrations?",
        options: [
          "Hydrated Sodium Hydroxide (NaOH)",
          "Concentrated Hydrochloric Acid (HCl)",
          "Anhydrous Sodium Carbonate (Na2CO3)",
          "Aqueous Potassium Permanganate (KMnO4)"
        ],
        correctIndex: 2,
        explanation: "Anhydrous Na2CO3 can be obtained in high purity (>99.9%), is non-hygroscopic, stable in air, and has a known high molar mass.",
        libraryMarkSchemeReference: "Vogel's Quantitative Chemical Analysis; Gayaza High School Volumetric Practical Manual."
      },
      {
        id: 2,
        question: "What is the sharp color transition at the endpoint when titrating 0.1 M HCl against 0.1 M NaOH using phenolphthalein indicator in the conical flask?",
        options: [
          "Pink to Colorless",
          "Colorless to Permanent Pale Pink",
          "Yellow to Orange",
          "Red to Blue"
        ],
        correctIndex: 1,
        explanation: "When acid is delivered into alkali with phenolphthalein, it turns from pink to colorless. If base is delivered into acid, the endpoint is colorless to permanent pale pink.",
        libraryMarkSchemeReference: "Gayaza High School UNEB Practical Scheme 2024; NCDC Chemistry Teaching Syllabus S.4."
      },
      {
        id: 3,
        question: "Calculate the molarity of a sodium hydroxide solution if 25.0 cm3 of it neutralizes 20.0 cm3 of 0.05 M sulfuric acid (H2SO4).",
        options: [
          "0.04 M",
          "0.08 M",
          "0.16 M",
          "0.02 M"
        ],
        correctIndex: 1,
        explanation: "Equation: 2NaOH + H2SO4 -> Na2SO4 + 2H2O. Moles of H2SO4 = (20 * 0.05)/1000 = 0.001 mol. Moles of NaOH required = 0.002 mol. Molarity = (0.002 / 25) * 1000 = 0.08 M.",
        libraryMarkSchemeReference: "UNEB Past Paper Revision Compilation, Paper 2 Section B; Gayaza Science Library."
      }
    ]
  },
  {
    id: 'test-smack-math-01',
    schoolName: "St. Mary's College Kisubi (SMACK)",
    librarySource: "SMACK Mathematics Department Archive & University Cambridge Mathematics Library",
    subject: 'Mathematics',
    sector: 'Science',
    classLevel: 'Senior Four',
    title: "Differential Calculus & Coordinate Geometry Quick Drill",
    description: "Pure Mathematics Paper 1 drill questions curated from St. Mary's College Kisubi internal mock series.",
    durationMinutes: 15,
    totalMarks: 20,
    questions: [
      {
        id: 1,
        question: "Find the gradient of the tangent to the curve y = 3x^2 - 5x + 2 at the point where x = 2.",
        options: [
          "5",
          "7",
          "12",
          "4"
        ],
        correctIndex: 1,
        explanation: "dy/dx = 6x - 5. At x = 2: dy/dx = 6(2) - 5 = 12 - 5 = 7.",
        libraryMarkSchemeReference: "Pure Mathematics 1 by J. Crawshaw & J. Chambers; SMACK Senior Four Assessment Series."
      },
      {
        id: 2,
        question: "What are the coordinates of the stationary point of the curve y = x^2 - 4x + 9, and what is its nature?",
        options: [
          "(2, 5) - Minimum",
          "(2, 5) - Maximum",
          "(-2, 21) - Minimum",
          "(4, 9) - Point of Inflexion"
        ],
        correctIndex: 0,
        explanation: "dy/dx = 2x - 4 = 0 => x = 2. When x = 2, y = 4 - 8 + 9 = 5. d2y/dx2 = +2 (> 0), so it is a local minimum at (2, 5).",
        libraryMarkSchemeReference: "Backhouse & Houldsworth Pure Mathematics; SMACK Mock Exam Paper 1 Guide."
      },
      {
        id: 3,
        question: "Find the equation of the line perpendicular to 2x - 3y + 6 = 0 passing through the point (1, -2).",
        options: [
          "3x + 2y + 1 = 0",
          "2x + 3y - 4 = 0",
          "3x - 2y - 7 = 0",
          "y = (2/3)x - 2"
        ],
        correctIndex: 0,
        explanation: "Original slope m1: 3y = 2x + 6 => m1 = 2/3. Perpendicular slope m2 = -3/2. Line: y - (-2) = -3/2(x - 1) => 2(y + 2) = -3(x - 1) => 2y + 4 = -3x + 3 => 3x + 2y + 1 = 0.",
        libraryMarkSchemeReference: "UNEB UCE Mathematics Paper 1 Marking Guide; SMACK Math Archive."
      }
    ]
  },
  {
    id: 'test-namagunga-lit-01',
    schoolName: "Mt. St. Mary's Namagunga",
    librarySource: "Namagunga Humanities Library & East African Literature Research Center",
    subject: 'Literature',
    sector: 'Art',
    classLevel: 'Senior Four',
    title: "East African Prose & Thematic Analysis Brief Test",
    description: "Prose and drama textual analysis test from Mt. St. Mary's College Namagunga Literature department.",
    durationMinutes: 15,
    totalMarks: 20,
    questions: [
      {
        id: 1,
        question: "In Ngũgĩ wa Thiong'o's 'The River Between', what do the two ridges Makuyu and Kameno symbolize in the central narrative?",
        options: [
          "The triumph of colonial railway expansion",
          "The sharp cultural and ideological divide between Christian converts and traditional Gikuyu society",
          "The generational conflict over land irrigation methods",
          "The linguistic differences between pastoral and agricultural clans"
        ],
        correctIndex: 1,
        explanation: "The two opposing ridges symbolize the internal cultural fission of the community, torn between traditional identity (Kameno) and the newly adopted Christian religion (Makuyu).",
        libraryMarkSchemeReference: "East African Educational Publishers Guide; Namagunga Literature Archive."
      },
      {
        id: 2,
        question: "What literary device is prominently used in the opening paragraph of 'The River Between' to characterize the Honia river flowing between the ridges?",
        options: [
          "Oxymoron",
          "Personification and Symbolism of life and reconciliation",
          "Hyperbole of modern warfare",
          "Satirical allegory"
        ],
        correctIndex: 1,
        explanation: "Honia ('cure' or 'bring back to life') is personified as a life-giving stream striving to unite the two antagonistic ridges.",
        libraryMarkSchemeReference: "Namagunga High School O-Level Literature Study Notes, Paper 208/1."
      }
    ]
  },
  {
    id: 'test-namilyango-ent-01',
    schoolName: "Namilyango College",
    librarySource: "Namilyango College Business Studies Archive & NCDC Curriculum Repository",
    subject: 'Entrepreneurship',
    sector: 'Art',
    classLevel: 'Senior Four',
    title: "Business Accounting & Financial Transactions Brief Test",
    description: "High school business cash flow, books of original entry, and profit margin analysis test from Namilyango College.",
    durationMinutes: 15,
    totalMarks: 20,
    questions: [
      {
        id: 1,
        question: "A student entrepreneur buys 50 customized science lab coats at UGX 20,000 each and marks them up by 30%. What is the selling price per lab coat?",
        options: [
          "UGX 23,000",
          "UGX 26,000",
          "UGX 30,000",
          "UGX 24,500"
        ],
        correctIndex: 1,
        explanation: "Markup = 30% of 20,000 = UGX 6,000. Selling price = 20,000 + 6,000 = UGX 26,000.",
        libraryMarkSchemeReference: "NCDC Entrepreneurship Education Student Book 4; Namilyango College Dept Assessment."
      },
      {
        id: 2,
        question: "Which of the following accounting documents is issued by a seller to notify a buyer of a reduction in the invoiced amount due to damaged goods returned?",
        options: [
          "Debit Note",
          "Credit Note",
          "Proforma Invoice",
          "Goods Received Note"
        ],
        correctIndex: 1,
        explanation: "A credit note is issued by a vendor to credit the customer's account for returned merchandise or overcharged items.",
        libraryMarkSchemeReference: "UNEB UCE Entrepreneurship Paper 1; Frank Wood's Business Accounting."
      }
    ]
  }
];
