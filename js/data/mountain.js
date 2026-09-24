/* Page two: eleven one-sentence prompts that each ask for a whole website.
   words lists [word id, text as it appears in the prompt], in prompt order.
   The knowledge under each word lives in mountain-words.js. */
window.GOP = window.GOP || {};
GOP.data = GOP.data || {};

GOP.data.mountain = {
  stacks: { next: 'Next.js', angular: 'Angular' },

  layers: [
    { id: 'framework', code: 'L1', name: 'Framework', sub: 'How {stack} does it' },
    { id: 'code', code: 'L2', name: 'Code', sub: 'What you write' },
    { id: 'platform', code: 'L3', name: 'Browser and network', sub: 'What runs it' },
    { id: 'foundations', code: 'L4', name: 'Foundations', sub: 'Ideas that do not change' }
  ],

  prompts: [
    {
      id: 'm01', stack: 'next', title: 'Blog with sign-in',
      text: 'Create a Next.js blog with auth, load posts from an API, add routing for every post, render pages fast, and make it SEO-friendly and responsive.',
      words: [['auth', 'auth'], ['api', 'API'], ['routing', 'routing'], ['render', 'render'], ['seo', 'SEO'], ['responsive', 'responsive']]
    },
    {
      id: 'm02', stack: 'angular', title: 'Admin dashboard',
      text: 'Build an Angular admin dashboard with auth, charts from an API, search and filters, dark mode, and a responsive layout.',
      words: [['auth', 'auth'], ['charts', 'charts'], ['api', 'API'], ['search', 'search'], ['darkMode', 'dark mode'], ['responsive', 'responsive']]
    },
    {
      id: 'm03', stack: 'next', title: 'Online store',
      text: 'Build a Next.js online store with search, optimized images, a shopping cart, Stripe payments, and caching for fast pages.',
      words: [['search', 'search'], ['images', 'images'], ['cart', 'cart'], ['payments', 'payments'], ['caching', 'caching']]
    },
    {
      id: 'm04', stack: 'angular', title: 'Team chat',
      text: 'Build an Angular team chat with auth, real-time messages, file upload, notifications, and offline support.',
      words: [['auth', 'auth'], ['realtime', 'real-time'], ['fileUpload', 'file upload'], ['notifications', 'notifications'], ['offline', 'offline']]
    },
    {
      id: 'm05', stack: 'next', title: 'Booking site',
      text: 'Make a Next.js booking site with forms, a database, time zones, email reminders, and payments.',
      words: [['forms', 'forms'], ['database', 'database'], ['timeZones', 'time zones'], ['email', 'email'], ['payments', 'payments']]
    },
    {
      id: 'm06', stack: 'angular', title: 'Insurance quote',
      text: 'Build an Angular insurance quote site with multi-step forms, validation, i18n, and accessibility.',
      words: [['forms', 'forms'], ['validation', 'validation'], ['i18n', 'i18n'], ['accessibility', 'accessibility']]
    },
    {
      id: 'm07', stack: 'next', title: 'SaaS landing site',
      text: 'Build a Next.js SaaS landing site with a CMS, SEO, analytics, optimized images, and top performance.',
      words: [['cms', 'CMS'], ['seo', 'SEO'], ['analytics', 'analytics'], ['images', 'images'], ['performance', 'performance']]
    },
    {
      id: 'm08', stack: 'angular', title: 'Kanban board',
      text: 'Create an Angular Kanban board with drag and drop, real-time sync, undo, accessibility, and tests.',
      words: [['dragDrop', 'drag and drop'], ['realtime', 'real-time'], ['undo', 'undo'], ['accessibility', 'accessibility'], ['tests', 'tests']]
    },
    {
      id: 'm09', stack: 'next', title: 'AI chat',
      text: 'Build a Next.js AI chat with auth, streaming answers, a database for chat history, and rate limiting.',
      words: [['ai', 'AI'], ['auth', 'auth'], ['streaming', 'streaming'], ['database', 'database'], ['rateLimiting', 'rate limiting']]
    },
    {
      id: 'm10', stack: 'angular', title: 'E-learning site',
      text: 'Build an Angular e-learning site with routing, video lessons, quiz forms, SEO, and offline mode.',
      words: [['routing', 'routing'], ['video', 'video'], ['forms', 'forms'], ['seo', 'SEO'], ['offline', 'offline']]
    },
    {
      id: 'm11', stack: 'next', title: 'News site',
      text: 'Make a Next.js news site with i18n, infinite scroll, optimized images, caching, and SEO.',
      words: [['i18n', 'i18n'], ['infiniteScroll', 'infinite scroll'], ['images', 'images'], ['caching', 'caching'], ['seo', 'SEO']]
    }
  ],

  closing: [
    'A short prompt is not a small request. Each technical word stands for a whole area of knowledge, from the framework down to ideas that never change.',
    'The AI fills in all of these details when it writes the code. You need to know them to check what it built, and to write the next prompt better.'
  ]
};
