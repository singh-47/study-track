/**
 * GATE 2027 CS & IT syllabus (IIT Madras), transcribed from:
 * https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/CS_GATE2027_Syllabus.pdf
 * https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/GA_GATE2027_Syllabus.pdf
 * Each entry is [topic, subtopics?].
 */
export type SyllabusTopic = [string, string[]?];

export interface SyllabusSubject {
  id: string;
  name: string;
  icon: string;
  topics: SyllabusTopic[];
}

export const GATE_2027_SYLLABUS: SyllabusSubject[] = [
  {
    id: 'mathematics',
    name: 'Discrete & Engineering Mathematics',
    icon: 'Calculator',
    topics: [
      ['Propositional and first order logic'],
      ['Sets, relations, functions, partial orders and lattices'],
      ['Monoids, Groups'],
      ['Graphs', ['Connectivity', 'Matching', 'Colouring']],
      ['Combinatorics', ['Counting', 'Recurrence relations', 'Generating functions']],
      [
        'Linear Algebra',
        ['Matrices', 'Determinants', 'System of linear equations', 'Eigenvalues and eigenvectors', 'LU decomposition'],
      ],
      ['Calculus', ['Limits, continuity and differentiability', 'Maxima and minima', 'Mean value theorem', 'Integration']],
      [
        'Probability and Statistics',
        [
          'Random variables',
          'Uniform, normal, exponential, Poisson and binomial distributions',
          'Mean, median, mode and standard deviation',
          'Conditional probability and Bayes theorem',
        ],
      ],
    ],
  },
  {
    id: 'digital-logic',
    name: 'Digital Logic',
    icon: 'Cpu',
    topics: [
      ['Boolean algebra and minimization', ['Algebraic technique', 'Karnaugh map', 'Tabular method']],
      ['Design of combinational and sequential circuits'],
      ['Number representation and arithmetic', ['Fixed point', 'Floating point']],
    ],
  },
  {
    id: 'coa',
    name: 'Computer Organization & Architecture',
    icon: 'Server',
    topics: [
      ['Instruction set and addressing modes'],
      ['Design of arithmetic and logic unit (ALU)'],
      ['Design of control unit', ['Hardwired', 'Microprogrammed']],
      ['Memory interfacing and hierarchy', ['Performance', 'Cache memory mapping']],
      ['I/O interface', ['Interrupt', 'DMA']],
      ['Instruction pipelining, pipeline hazards'],
    ],
  },
  {
    id: 'pds',
    name: 'Programming & Data Structures',
    icon: 'Code',
    topics: [
      ['Programming in C'],
      ['Recursion'],
      ['Arrays'],
      ['Stacks'],
      ['Queues'],
      ['Linked lists'],
      ['Trees'],
      ['Binary search trees'],
      ['Binary heaps'],
      ['Graphs'],
    ],
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    icon: 'GitBranch',
    topics: [
      ['Searching'],
      ['Sorting'],
      ['Hashing'],
      ['Asymptotic worst case time and space complexity'],
      ['Algorithm design techniques', ['Greedy', 'Dynamic programming', 'Divide-and-conquer']],
      ['Graph traversals'],
      ['Minimum spanning trees'],
      ['Shortest paths'],
    ],
  },
  {
    id: 'toc',
    name: 'Theory of Computation',
    icon: 'Workflow',
    topics: [
      ['Regular expressions and finite automata'],
      ['Context-free grammars and push-down automata'],
      ['Regular and context-free languages, pumping lemma'],
      ['Turing machines and undecidability'],
    ],
  },
  {
    id: 'compiler',
    name: 'Compiler Design',
    icon: 'FileCode',
    topics: [
      ['Lexical analysis'],
      ['Parsing'],
      ['Syntax-directed translation'],
      ['Runtime environments'],
      ['Intermediate code generation'],
      ['Local optimisation'],
      ['Data flow analyses', ['Constant propagation', 'Liveness analysis', 'Common sub expression elimination']],
    ],
  },
  {
    id: 'os',
    name: 'Operating Systems',
    icon: 'Monitor',
    topics: [
      ['System calls'],
      ['Processes'],
      ['Threads'],
      ['Inter-process communication'],
      ['Concurrency and synchronization'],
      ['Deadlock'],
      ['CPU and I/O scheduling'],
      ['Memory management and virtual memory'],
      ['File systems'],
    ],
  },
  {
    id: 'databases',
    name: 'Databases',
    icon: 'Database',
    topics: [
      ['ER-model'],
      ['Relational model', ['Relational algebra', 'Tuple calculus', 'SQL']],
      ['Integrity constraints'],
      ['Normal forms'],
      ['File organization'],
      ['Indexing', ['B trees', 'B+ trees']],
      ['Transactions and concurrency control'],
    ],
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    icon: 'Network',
    topics: [
      ['Principles of layering'],
      ['Basics of switching', ['Circuit switching', 'Packet switching', 'Virtual circuit switching']],
      ['Performance metrics'],
      ['Data link layer', ['Error detection', 'Medium Access Control', 'Ethernet']],
      ['Distance vector and link state routing'],
      ['IPv4', ['Fragmentation', 'CIDR notation', 'Network Address Translation']],
      ['TCP', ['Flow control', 'Congestion control']],
      ['Socket API'],
      ['DNS and HTTP'],
    ],
  },
  {
    id: 'aptitude',
    name: 'General Aptitude',
    icon: 'Brain',
    topics: [
      [
        'Basic English grammar',
        ['Tenses', 'Articles', 'Adjectives', 'Prepositions', 'Conjunctions', 'Verb-noun agreement', 'Other parts of speech'],
      ],
      ['Basic vocabulary', ['Words, idioms, and phrases in context']],
      ['Reading and comprehension'],
      ['Narrative sequencing'],
      [
        'Data interpretation',
        ['Data graphs (bar graphs, pie charts, and other graphs)', '2- and 3-dimensional plots', 'Maps', 'Tables'],
      ],
      [
        'Numerical computation and estimation',
        ['Ratios', 'Percentages', 'Powers, exponents and logarithms', 'Permutations and combinations', 'Series'],
      ],
      ['Mensuration and geometry'],
      ['Elementary statistics and probability'],
      ['Logic: deduction and induction'],
      ['Analogy'],
      ['Numerical relations and reasoning'],
      [
        'Transformation of shapes',
        ['Translation', 'Rotation', 'Scaling', 'Mirroring', 'Assembling', 'Grouping'],
      ],
      ['Paper folding, cutting, and patterns in 2 and 3 dimensions'],
    ],
  },
];
