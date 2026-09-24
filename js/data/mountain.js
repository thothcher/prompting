/* Page two: one easy prompt, and the mountain of knowledge under each
   technical word. Summits are listed in the order the words appear. */
window.GOP = window.GOP || {};
GOP.data = GOP.data || {};

GOP.data.mountain = {
  prompt: 'Create a Next.js blog with auth, load posts from an API, add routing for every post, render pages fast, and make it SEO-friendly and responsive.',

  layers: [
    { id: 'framework', code: 'L1', name: 'Framework', sub: 'How Next.js does it' },
    { id: 'code', code: 'L2', name: 'Code', sub: 'What you write' },
    { id: 'platform', code: 'L3', name: 'Browser and network', sub: 'What runs it' },
    { id: 'foundations', code: 'L4', name: 'Foundations', sub: 'Ideas that do not change' }
  ],

  summits: [
    {
      word: 'auth',
      match: 'auth',
      tagline: 'Proving who the user is, and deciding what they may do.',
      layers: {
        framework: [
          { name: 'Auth library', note: 'A library such as Better Auth handles sign-up, sign-in, sessions and providers, so you never write security code from scratch.', code: 'const session = await auth.api.getSession({ headers: await headers() })' },
          { name: 'proxy.ts', note: 'Runs before a route renders. A good place to send signed-out users away from private pages. In Next.js 16 it replaced middleware.ts.' },
          { name: 'Session in Server Components', note: 'Read the session on the server and render the right page before any JavaScript reaches the browser.' },
          { name: 'Server Actions', note: 'Sign-in and sign-out run as server functions called from forms. They are public endpoints, so they must check their own input.' }
        ],
        code: [
          { name: 'Login form', note: 'Inputs, labels, error messages and a submit button. The most visible part of auth, and the smallest.' },
          { name: 'Validation', note: 'Check the email format and password length on the server. Checks in the browser are only for convenience.', code: 'z.object({ email: z.email(), password: z.string().min(8) })' },
          { name: 'Password hashing', note: 'Passwords are stored as slow one-way hashes (bcrypt, argon2), never as plain text.' },
          { name: 'Role checks', note: 'Deciding what a user may do is ordinary if/else logic, run on the server.', code: "if (session.user.role !== 'admin') redirect('/')" },
          { name: 'async / await', note: 'Every auth step waits for something: the database, a hash, an outside provider.' }
        ],
        platform: [
          { name: 'Cookies', note: 'Small values the browser sends with every request to the same site. The session id usually lives here.' },
          { name: 'HttpOnly, Secure, SameSite', note: 'Cookie flags: hidden from JavaScript, sent only over HTTPS, and not sent along with requests from other sites.' },
          { name: 'Bearer tokens', note: 'APIs usually receive a token in the Authorization header.', code: 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...' },
          { name: 'HTTPS and TLS', note: 'Encrypts the connection, so passwords and cookies cannot be read on the network.' },
          { name: 'CSRF and XSS', note: 'Two classic attacks: tricking the browser into sending a request for you, and injecting a script that reads the page.' }
        ],
        foundations: [
          { name: 'Sessions vs tokens', note: 'A session is a record on the server. A token carries its own signed data. Each makes logout and scaling work differently.' },
          { name: 'JWT', note: 'A signed token in three parts: header.payload.signature. Anyone can read it; only the server can create a valid one.' },
          { name: 'Expiry and refresh', note: 'Short-lived access tokens plus a refresh token limit the damage if a token is stolen.' },
          { name: 'OAuth 2.0 and OpenID Connect', note: 'The protocols behind "Sign in with GitHub": the user proves who they are to GitHub, and your app receives a verified answer.' },
          { name: 'Hashing vs encryption', note: 'Hashing is one-way and suits passwords. Encryption can be reversed with a key and suits stored secrets.' },
          { name: 'Authentication vs authorization', note: 'Who you are versus what you may do. "Auth" in a prompt usually means both.' }
        ]
      }
    },
    {
      word: 'API',
      match: 'API',
      tagline: 'Asking another program for data over the network.',
      layers: {
        framework: [
          { name: 'fetch in Server Components', note: 'Server Components can wait for data directly, so the page arrives with the posts already in the HTML.', code: 'const posts = await fetch(url).then((r) => r.json())' },
          { name: 'Route Handlers', note: 'Files named route.ts that answer HTTP requests, for when your app is the API.', code: 'export async function GET() { return Response.json(posts) }' },
          { name: "'use cache'", note: 'Marks data or components as cacheable, so repeated visits do not call the API every time.' },
          { name: 'loading.tsx and error.tsx', note: 'Special files that show a loading state and an error state for part of the app.' }
        ],
        code: [
          { name: 'async / await', note: 'Pauses a function until a Promise settles, so code that waits reads from top to bottom.' },
          { name: 'Promises', note: 'An object for a value that arrives later: pending first, then fulfilled or rejected.' },
          { name: 'try / catch', note: 'Networks fail. Catch the error and show something useful instead of a blank page.' },
          { name: 'JSON', note: 'The text format most APIs use. JSON.parse turns it into objects; JSON.stringify does the reverse.' },
          { name: 'Typed responses', note: 'A TypeScript type for the response catches missing fields while you write the code.', code: 'type Post = { id: string; title: string; body: string }' }
        ],
        platform: [
          { name: 'HTTP methods', note: 'GET reads, POST creates, PUT and PATCH update, DELETE removes.' },
          { name: 'Status codes', note: '200 OK, 201 Created, 400 bad input, 401 not signed in, 404 not found, 500 server error.' },
          { name: 'Headers', note: 'Extra information sent with requests and responses: content type, auth token, caching rules.' },
          { name: 'REST', note: 'An API style where URLs name things (/posts/42) and HTTP methods name actions.' },
          { name: 'CORS', note: 'A browser rule that blocks a page from reading responses from another site unless that server allows it.' }
        ],
        foundations: [
          { name: 'Client and server', note: 'One program asks, another answers. Your blog is a client of the posts API.' },
          { name: 'Request and response', note: 'Every exchange is a request (method, URL, headers) and a response (status, headers, body).' },
          { name: 'DNS and TCP/IP', note: 'DNS turns a domain name into an address; TCP/IP delivers the bytes reliably.' },
          { name: 'Latency', note: 'Every request takes time. Fewer, smaller and closer requests make pages faster.' },
          { name: 'Serialization', note: 'Turning data into text or bytes to send it, and back into data on the other side.' }
        ]
      }
    },
    {
      word: 'routing',
      match: 'routing',
      tagline: 'Turning a URL into the right page.',
      layers: {
        framework: [
          { name: 'App Router folders', note: 'Each folder in app/ is a part of the URL; a page.tsx file makes it a page.', code: 'app/blog/[slug]/page.tsx  ->  /blog/my-first-post' },
          { name: 'Dynamic segments', note: 'Square brackets create one route for many URLs, such as one page per post.' },
          { name: 'Layouts', note: 'Shared UI, such as a header, that wraps pages and stays in place while you navigate.' },
          { name: 'Link and prefetching', note: 'Navigation without a full reload that loads the next page in the background before the click.' },
          { name: 'not-found.tsx', note: 'What users see for a URL that does not exist, sent with a 404 status.' },
          { name: 'generateStaticParams', note: 'Lists which posts to build ahead of time, so every post is a ready-made static page.' }
        ],
        code: [
          { name: 'params and searchParams', note: 'The dynamic parts of the URL and the query string, passed to your page.', code: 'const { slug } = await params' },
          { name: 'URLs from data', note: 'Build links from data instead of typing them by hand.', code: 'href={`/blog/${post.slug}`}' },
          { name: 'Slugs', note: 'URL-friendly versions of titles: "My First Post" becomes my-first-post.' },
          { name: 'redirect()', note: 'Sends the user to another URL from server code, for example after signing in.' }
        ],
        platform: [
          { name: 'URL anatomy', note: 'protocol://host/path?query#hash. Each part has its own job.' },
          { name: 'History API', note: 'pushState changes the URL without reloading the page. That is how navigation inside the app works.' },
          { name: 'Back and forward', note: 'Users expect the browser buttons to work. Good routing keeps every screen in the URL.' },
          { name: '301 and 404', note: '301 says a page moved for good; 404 says it does not exist. Search engines rely on both.' }
        ],
        foundations: [
          { name: 'Trees and hierarchies', note: 'URLs form a tree: /blog is the parent of /blog/my-post. So do folders.' },
          { name: 'Lookup', note: 'Routing is a lookup: given a path, find the thing to show.' },
          { name: 'Stable addresses', note: 'Every page needs one address that does not change. Change it and old links break.' }
        ]
      }
    },
    {
      word: 'render',
      match: 'render',
      tagline: 'Turning data into what appears on the screen.',
      layers: {
        framework: [
          { name: 'Server and Client Components', note: 'Server Components render on the server and send HTML. Client Components also run in the browser for interactivity.' },
          { name: 'SSR, SSG and ISR', note: 'Render on every request, once at build time, or at build time with updates in the background.' },
          { name: 'Hydration', note: 'The browser connects React to HTML rendered on the server, so buttons and inputs start working.' },
          { name: 'Suspense and streaming', note: 'Send the page in pieces: show the frame first and stream slow parts when they are ready.' }
        ],
        code: [
          { name: 'JSX', note: 'HTML-like syntax inside JavaScript that describes what to show.', code: '<h1>{post.title}</h1>' },
          { name: 'Array.map() loops', note: 'Turns an array of posts into an array of elements. Each one needs a stable key.', code: 'posts.map((p) => <PostCard key={p.id} post={p} />)' },
          { name: 'Conditionals', note: 'if/else, the ternary operator and && decide what to show.', code: '{posts.length ? <PostList /> : <EmptyState />}' },
          { name: 'Props and state', note: 'Props come in from the parent. State is data a component owns and changes.' },
          { name: 'Components', note: 'Functions that return UI. Small components are easier to test and reuse.' }
        ],
        platform: [
          { name: 'The DOM', note: 'The browser\'s live tree of elements. Every render ends with changes to it.' },
          { name: 'Diffing', note: 'React compares the new UI with the old one and changes only what differs.' },
          { name: 'Events', note: 'Clicks, key presses and input travel through the DOM to your handlers.' },
          { name: 'Rendering pipeline', note: 'The browser parses HTML and CSS, calculates layout, paints pixels and puts the layers together.' }
        ],
        foundations: [
          { name: 'Tree structures', note: 'HTML, the DOM and the component tree are all trees: nodes with children.' },
          { name: 'UI = f(state)', note: 'The core idea of modern frameworks: the screen is a function of the data.' },
          { name: 'Frame budget', note: 'At 60 frames per second each frame has about 16 ms. Slower code causes visible stutter.' },
          { name: 'Immutability', note: 'Creating new objects instead of changing old ones makes changes easy to detect.' }
        ]
      }
    },
    {
      word: 'SEO',
      match: 'SEO',
      tagline: 'Helping search engines find, understand and rank the pages.',
      layers: {
        framework: [
          { name: 'Metadata API', note: 'Export metadata or generateMetadata to set the title, description and share image of each page.', code: "export const metadata = { title: 'Blog', description: '...' }" },
          { name: 'sitemap.ts and robots.ts', note: 'Generate sitemap.xml and robots.txt from code, so new posts appear in them automatically.' },
          { name: 'next/image', note: 'Serves images at the right size and in modern formats, which makes pages faster.' },
          { name: 'HTML from the server', note: 'Crawlers get the full content in the first response, without running JavaScript.' }
        ],
        code: [
          { name: 'Semantic HTML', note: 'One h1, then h2s, and elements like article, nav and main describe the structure of the page.' },
          { name: 'Alt text', note: 'Describes images for screen readers and search engines.' },
          { name: 'Structured data', note: 'A JSON-LD block that tells search engines "this is a blog post, by this author, published on this date".' },
          { name: 'Canonical URLs', note: 'Tells search engines which address is the original when the same content has several.' }
        ],
        platform: [
          { name: 'Title and description', note: 'The blue link and the grey text people see in search results.' },
          { name: 'Open Graph tags', note: 'Control the preview card when a link is shared on social media.' },
          { name: 'Core Web Vitals', note: 'LCP (loading), CLS (layout shift) and INP (responsiveness): the speed signals Google measures.' }
        ],
        foundations: [
          { name: 'Crawling and indexing', note: 'Bots follow links, download pages and store them in an index that can be searched.' },
          { name: 'Links', note: 'Links between pages are how crawlers find content and judge how important it is.' },
          { name: 'Search intent', note: 'What the person searching actually wants. Pages that answer it rank better.' },
          { name: 'Accessibility overlap', note: 'Clear structure, text alternatives and good headings help screen readers and search engines alike.' }
        ]
      }
    },
    {
      word: 'responsive',
      match: 'responsive',
      tagline: 'One layout that works on every screen.',
      layers: {
        framework: [
          { name: 'Tailwind breakpoints', note: 'Prefixes like md: and lg: apply a style from a screen width upward.', code: '<div className="grid md:grid-cols-2 lg:grid-cols-3">' },
          { name: 'next/image sizes', note: 'The sizes attribute tells the browser which image width to download for each screen.' },
          { name: 'Layout shells', note: 'A layout.tsx holding the header and navigation adapts once for every page.' }
        ],
        code: [
          { name: 'Flexbox', note: 'Lays items out in one direction, with wrapping and alignment.' },
          { name: 'CSS Grid', note: 'Two-dimensional layouts: rows and columns at the same time.', code: 'grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));' },
          { name: 'Media queries', note: 'Apply CSS only when the screen matches a condition.', code: '@media (min-width: 48rem) { ... }' },
          { name: 'Container queries', note: 'Style a component by the size of its container instead of the whole screen.' },
          { name: 'Relative units', note: 'rem, %, vw and clamp() scale with the screen and with the user\'s font settings.' }
        ],
        platform: [
          { name: 'Viewport meta tag', note: 'Tells phones to use the real device width instead of pretending to be a desktop.' },
          { name: 'Pixel density', note: 'High-density screens need larger images to look sharp.' },
          { name: 'Touch input', note: 'Fingers need tap targets of about 44 px and have no hover.' },
          { name: 'Device mode in DevTools', note: 'Test many screen sizes without owning every phone.' }
        ],
        foundations: [
          { name: 'Mobile first', note: 'Design for the smallest screen first, then add layout for bigger ones.' },
          { name: 'Fluid layout', note: 'Sizes that stretch smoothly instead of jumping between fixed widths.' },
          { name: 'Visual hierarchy', note: 'Size, weight and spacing tell the eye what to read first.' },
          { name: 'Line length', note: 'About 45 to 75 characters per line is comfortable to read at any width.' }
        ]
      }
    }
  ],

  closing: [
    'A short prompt is not a small request. Each technical word stands for a whole area of knowledge, from the framework down to ideas that never change.',
    'The AI fills in all of these details when it writes the code. You need to know them to check what it built, and to write the next prompt better.'
  ]
};
