/* BLUEPRINTS: the 10-block framework used on page one, plus the classic
   frameworks it builds on. Edit the text here; the page renders from it. */
window.GOP = window.GOP || {};
GOP.data = GOP.data || {};

GOP.data.framework = {
  name: 'BLUEPRINTS',
  note: 'BLUEPRINTS was built for this lecture from CRAFT, CO-STAR, RISEN and current coding-agent practice. It is a teaching tool, not an industry standard.',

  groups: {
    intent: { label: 'Intent', text: 'Why the project exists and who the AI should be.' },
    engineering: { label: 'Engineering', text: 'What to build it with and how it is organised.' },
    delivery: { label: 'Quality and delivery', text: 'How good it must be and how the work comes back.' }
  },

  parts: [
    {
      key: 'B', name: 'Brief', group: 'intent',
      question: 'What are we building, for whom, and why?',
      does: 'Sets the scene: the product, its users, the problem it solves and what success looks like. Every later decision the AI makes is checked against this paragraph.',
      include: ['The product and its purpose in one sentence', 'Who uses it and in what situation', 'What a finished project looks like'],
      mistake: 'Starting with a feature list. Without the reason behind the project, the AI fills every gap with generic guesses.',
      example: 4
    },
    {
      key: 'L', name: 'Lens', group: 'intent',
      question: 'Who should the AI be while it works?',
      does: 'Chooses the expertise, level and attitude the AI works with. A senior architect and a patient mentor write very different code and explanations.',
      include: ['A role with a level: senior, lead, mentor', 'The area it is expert in', 'How it should behave: explain, ask, push back'],
      mistake: 'A vague role such as "You are an expert". Name the stack, the seniority and the behaviour you want.',
      example: 1
    },
    {
      key: 'U', name: 'Use cases', group: 'intent',
      question: 'What can the user actually do?',
      does: 'Turns the idea into concrete actions: pages, flows and user stories. This is the scope the AI must deliver.',
      include: ['Features written as user actions', 'The main flows from start to finish', 'What is out of scope'],
      mistake: 'Listing nouns ("dashboard, profile, settings") instead of actions. "A user can filter orders by status" can be built. "Orders page" cannot.',
      example: 4
    },
    {
      key: 'E', name: 'Environment', group: 'engineering',
      question: 'Which stack, versions and tools?',
      does: 'Pins the framework version, language settings, libraries and tools. It stops the AI from writing code for an older version it saw more often in training.',
      include: ['Framework and major version', 'Language settings, styling and key libraries', 'Package manager, runtime and test tools'],
      mistake: 'Writing "use Angular" or "use Next.js" without a version. The AI then mixes APIs from several years.',
      quote: 'Next.js 16.3 writes this into AGENTS.md for coding agents: "This is NOT the Next.js you know. This version has breaking changes."',
      example: 1
    },
    {
      key: 'P', name: 'Patterns', group: 'engineering',
      question: 'How should the code be organised?',
      does: 'Describes the architecture: folder structure, state management, data flow and naming. It makes the project look like one developer wrote it.',
      include: ['Folder or feature structure', 'Where state lives and how data flows', 'Conventions: naming, file size, component style'],
      mistake: 'Leaving architecture to chance. The AI will pick a different pattern for every feature.',
      example: 5
    },
    {
      key: 'R', name: 'Routes and data', group: 'engineering',
      question: 'Which pages exist and what data do they use?',
      does: 'Lists the URLs, the data models and the API contracts. Routes and types are the skeleton the rest of the code hangs on.',
      include: ['Every route and what it shows', 'Data models with fields and types', 'API endpoints with inputs and outputs'],
      mistake: 'Letting the AI invent the data model. Changing it later touches every file.',
      example: 5
    },
    {
      key: 'I', name: 'Interface', group: 'engineering',
      question: 'How should it look, feel and behave?',
      does: 'Sets the UI and UX rules: layout, design direction, behaviour on phones, loading, empty and error states, and accessibility.',
      include: ['Visual direction and components', 'Breakpoints and behaviour on phones', 'Loading, empty and error states; accessibility level'],
      mistake: 'Saying "make it modern and beautiful". Describe layout, components and states instead.',
      example: 3
    },
    {
      key: 'N', name: 'Non-negotiables', group: 'delivery',
      question: 'What must always happen, and what must never happen?',
      does: 'States the hard constraints: security rules, performance limits, forbidden libraries and patterns, and what not to build.',
      include: ['Security rules: secrets, validation, permissions', 'Performance and quality limits', 'Forbidden patterns and non-goals'],
      mistake: 'Assuming the AI knows your rules. If a secret must never reach the browser, say so.',
      example: 6
    },
    {
      key: 'T', name: 'Tests', group: 'delivery',
      question: 'How do we know it works?',
      does: 'Defines the test strategy and the definition of done. It turns "looks right" into checks that pass or fail.',
      include: ['What to test and with which tools', 'Acceptance criteria per feature', 'Commands that must pass before it is done'],
      mistake: 'Asking for tests at the end, or not at all. Tests written with the code catch the AI\'s mistakes early.',
      example: 4
    },
    {
      key: 'S', name: 'Shape', group: 'delivery',
      question: 'What should the AI hand back, and in what order?',
      does: 'Controls the output and the process: plan or code first, file order, commands, summaries, and when to stop and ask.',
      include: ['Questions, plan or code first', 'Output format: file tree, full files, commands', 'How to report: summary, next steps, open questions'],
      mistake: 'Accepting whatever format comes back. A long answer with half-finished files is hard to use.',
      example: 2
    }
  ],

  classics: [
    {
      name: 'CRAFT', year: 'Classic',
      letters: [['C', 'Context'], ['R', 'Role'], ['A', 'Action'], ['F', 'Format'], ['T', 'Target audience']],
      note: 'One of the most taught prompt frameworks. Several variants exist; this is the common one.'
    },
    {
      name: 'CO-STAR', year: '2023',
      letters: [['C', 'Context'], ['O', 'Objective'], ['S', 'Style'], ['T', 'Tone'], ['A', 'Audience'], ['R', 'Response']],
      note: 'From GovTech Singapore\'s data science team. It was used to win Singapore\'s first GPT-4 prompt engineering competition.'
    },
    {
      name: 'RISEN', year: 'Popular',
      letters: [['R', 'Role'], ['I', 'Instructions'], ['S', 'Steps'], ['E', 'End goal'], ['N', 'Narrowing']],
      note: 'Popular for multi-step tasks because it asks for the steps and the limits.'
    }
  ],

  context: {
    name: 'Context engineering', year: '2025 onward',
    text: 'The shift from clever wording to complete context: the spec, the files, the rules, examples, and a way to check the result. Coding agents now read project files such as AGENTS.md before they write code.',
    quote: '"This is NOT the Next.js you know." (the first line Next.js 16.3 writes into AGENTS.md for coding agents)',
    note: 'BLUEPRINTS applies this idea to one prompt.'
  },

  /* Coverage: 2 = covered, 1 = partly covered, 0 = not covered */
  coverage: {
    B: { CRAFT: [2, 'C Context, T Target audience'], 'CO-STAR': [2, 'C Context, O Objective, A Audience'], RISEN: [1, 'E End goal'] },
    L: { CRAFT: [2, 'R Role'], 'CO-STAR': [1, 'S Style, T Tone'], RISEN: [2, 'R Role'] },
    U: { CRAFT: [2, 'A Action'], 'CO-STAR': [1, 'O Objective'], RISEN: [2, 'I Instructions'] },
    E: { CRAFT: [0, ''], 'CO-STAR': [0, ''], RISEN: [0, ''] },
    P: { CRAFT: [0, ''], 'CO-STAR': [0, ''], RISEN: [0, ''] },
    R: { CRAFT: [0, ''], 'CO-STAR': [0, ''], RISEN: [0, ''] },
    I: { CRAFT: [0, ''], 'CO-STAR': [0, ''], RISEN: [0, ''] },
    N: { CRAFT: [0, ''], 'CO-STAR': [0, ''], RISEN: [2, 'N Narrowing'] },
    T: { CRAFT: [0, ''], 'CO-STAR': [0, ''], RISEN: [1, 'E End goal'] },
    S: { CRAFT: [2, 'F Format'], 'CO-STAR': [2, 'R Response'], RISEN: [2, 'S Steps'] }
  },
  coverageSummary: 'The classic frameworks cover intent and output well. The engineering rows (Environment, Patterns, Routes and data, Interface, Tests) are almost empty, and they are where project prompts usually fail. BLUEPRINTS adds them.',

  rules: [
    {
      title: 'Say exactly what you want',
      text: 'Current models follow instructions closely. If you want a feature, a file or a test, ask for it by name.',
      parts: ['U', 'S']
    },
    {
      title: 'Give the reason behind each rule',
      text: '"Never store the token in localStorage, because any script on the page can read it" works better than the rule alone. The AI applies the reason to cases you did not list.',
      parts: ['B', 'N']
    },
    {
      title: 'Pin the stack',
      text: 'Name the framework version and the features that only exist in it. The AI\'s training data is older than the framework.',
      parts: ['E']
    },
    {
      title: 'Show one example',
      text: 'A sample JSON record or a small component in your style says more than a paragraph of adjectives.',
      parts: ['R', 'P']
    },
    {
      title: 'Define done',
      text: 'List the checks that must pass: build, tests, lint and acceptance criteria. Then ask the AI to run them.',
      parts: ['T']
    },
    {
      title: 'Plan before building',
      text: 'For anything bigger than one screen, ask for questions and a plan first, and approve it before any code is written.',
      parts: ['S']
    }
  ]
};
