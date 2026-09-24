/* The knowledge under each technical word, shared by every mountain prompt.
   framework holds one list per stack (next, angular); the other three
   layers are the same whichever framework the prompt uses.
   Each concept: { name, note, code? } */
window.GOP = window.GOP || {};
GOP.data = GOP.data || {};

GOP.data.words = {
  /* ------------------------------------------------------------ auth */
  auth: {
    tagline: 'Proving who the user is, and deciding what they may do.',
    framework: {
      next: [
        { name: 'Auth library', note: 'A library such as Better Auth handles sign-up, sign-in, sessions and providers, so you never write security code from scratch.', code: 'const session = await auth.api.getSession({ headers: await headers() })' },
        { name: 'proxy.ts', note: 'Runs before a route renders. A good place to send signed-out users away from private pages. In Next.js 16 it replaced middleware.ts.' },
        { name: 'Session in Server Components', note: 'Read the session on the server and render the right page before any JavaScript reaches the browser.' },
        { name: 'Server Actions', note: 'Sign-in and sign-out run as server functions called from forms. They are public endpoints, so they must check their own input.' }
      ],
      angular: [
        { name: 'Route guards', note: 'A CanActivateFn decides whether a route may open. Guards protect pages, not data, so the API must check too.', code: "canActivate: [() => inject(Auth).isLoggedIn() || inject(Router).parseUrl('/login')]" },
        { name: 'HTTP interceptor', note: 'One functional interceptor adds the token to every request and handles 401 answers in one place.', code: 'provideHttpClient(withInterceptors([authInterceptor]))' },
        { name: 'Auth service with signals', note: 'A service keeps the current user in a signal, so every component reacts when someone signs in or out.' },
        { name: 'OIDC library', note: 'Libraries such as angular-auth-oidc-client run the OAuth and OpenID Connect flows for you.' }
      ]
    },
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
  },

  /* ------------------------------------------------------------ API */
  api: {
    tagline: 'Asking another program for data over the network.',
    framework: {
      next: [
        { name: 'fetch in Server Components', note: 'Server Components can wait for data directly, so the page arrives with the posts already in the HTML.', code: 'const posts = await fetch(url).then((r) => r.json())' },
        { name: 'Route Handlers', note: 'Files named route.ts that answer HTTP requests, for when your app is the API.', code: 'export async function GET() { return Response.json(posts) }' },
        { name: "'use cache'", note: 'Marks data or components as cacheable, so repeated visits do not call the API every time.' },
        { name: 'loading.tsx and error.tsx', note: 'Special files that show a loading state and an error state for part of the app.' }
      ],
      angular: [
        { name: 'HttpClient', note: 'Angular\'s HTTP service: typed requests that work with interceptors and testing tools.', code: "http.get<Sale[]>('/api/sales')" },
        { name: 'httpResource', note: 'Loads data as a signal with value, loading and error states. Stable in Angular 22.', code: 'sales = httpResource<Sale[]>(() => `/api/sales?range=${range()}`)' },
        { name: 'Interceptors', note: 'Functions that see every request and response: add headers, retry and map errors in one place.' },
        { name: 'Environment config', note: 'The API base URL lives in configuration, not in components, so development and production can differ.' }
      ]
    },
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
      { name: 'Client and server', note: 'One program asks, another answers. Your site is a client of the API.' },
      { name: 'Request and response', note: 'Every exchange is a request (method, URL, headers) and a response (status, headers, body).' },
      { name: 'DNS and TCP/IP', note: 'DNS turns a domain name into an address; TCP/IP delivers the bytes reliably.' },
      { name: 'Latency', note: 'Every request takes time. Fewer, smaller and closer requests make pages faster.' },
      { name: 'Serialization', note: 'Turning data into text or bytes to send it, and back into data on the other side.' }
    ]
  },

  /* ------------------------------------------------------------ routing */
  routing: {
    tagline: 'Turning a URL into the right page.',
    framework: {
      next: [
        { name: 'App Router folders', note: 'Each folder in app/ is a part of the URL; a page.tsx file makes it a page.', code: 'app/blog/[slug]/page.tsx  ->  /blog/my-first-post' },
        { name: 'Dynamic segments', note: 'Square brackets create one route for many URLs, such as one page per post.' },
        { name: 'Layouts', note: 'Shared UI, such as a header, that wraps pages and stays in place while you navigate.' },
        { name: 'Link and prefetching', note: 'Navigation without a full reload that loads the next page in the background before the click.' },
        { name: 'not-found.tsx', note: 'What users see for a URL that does not exist, sent with a 404 status.' },
        { name: 'generateStaticParams', note: 'Lists which posts to build ahead of time, so every post is a ready-made static page.' }
      ],
      angular: [
        { name: 'Routes array', note: 'Each route maps a path to a component, and provideRouter(routes) switches routing on.', code: "{ path: 'lessons/:id', loadComponent: () => import('./lesson') }" },
        { name: 'Lazy loading', note: 'loadComponent downloads a page\'s code only when someone opens it.' },
        { name: 'Params as inputs', note: 'withComponentInputBinding() passes :id straight into a component input.', code: 'id = input.required<string>()' },
        { name: 'Guards and resolvers', note: 'Guards decide whether a route opens; resolvers load its data first.' }
      ]
    },
    code: [
      { name: 'params and searchParams', note: 'The dynamic parts of the URL and the query string, handed to your page.', code: 'const { slug } = await params' },
      { name: 'URLs from data', note: 'Build links from data instead of typing them by hand.', code: 'href={`/blog/${post.slug}`}' },
      { name: 'Slugs', note: 'URL-friendly versions of titles: "My First Post" becomes my-first-post.' },
      { name: 'Redirects', note: 'Send the user to another URL from code, for example after signing in.' }
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
  },

  /* ------------------------------------------------------------ render */
  render: {
    tagline: 'Turning data into what appears on the screen.',
    framework: {
      next: [
        { name: 'Server and Client Components', note: 'Server Components render on the server and send HTML. Client Components also run in the browser for interactivity.' },
        { name: 'SSR, SSG and ISR', note: 'Render on every request, once at build time, or at build time with updates in the background.' },
        { name: 'Hydration', note: 'The browser connects React to HTML rendered on the server, so buttons and inputs start working.' },
        { name: 'Suspense and streaming', note: 'Send the page in pieces: show the frame first and stream slow parts when they are ready.' }
      ]
    },
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
  },

  /* ------------------------------------------------------------ SEO */
  seo: {
    tagline: 'Helping search engines find, understand and rank the pages.',
    framework: {
      next: [
        { name: 'Metadata API', note: 'Export metadata or generateMetadata to set the title, description and share image of each page.', code: "export const metadata = { title: 'Blog', description: '...' }" },
        { name: 'sitemap.ts and robots.ts', note: 'Generate sitemap.xml and robots.txt from code, so new pages appear in them automatically.' },
        { name: 'next/image', note: 'Serves images at the right size and in modern formats, which makes pages faster.' },
        { name: 'HTML from the server', note: 'Crawlers get the full content in the first response, without running JavaScript.' }
      ],
      angular: [
        { name: 'Server-side rendering', note: '@angular/ssr renders pages on the server, so crawlers receive full HTML.' },
        { name: 'Title and Meta services', note: 'Set the title and description for each page from code.', code: "inject(Meta).updateTag({ name: 'description', content: lesson.summary })" },
        { name: 'Prerendering', note: 'Pages that rarely change are rendered to static HTML at build time.' },
        { name: 'Hydration', note: 'The browser reuses the server HTML instead of rebuilding it, so pages stay fast and stable.' }
      ]
    },
    code: [
      { name: 'Semantic HTML', note: 'One h1, then h2s, and elements like article, nav and main describe the structure of the page.' },
      { name: 'Alt text', note: 'Describes images for screen readers and search engines.' },
      { name: 'Structured data', note: 'A JSON-LD block that tells search engines "this is an article, by this author, published on this date".' },
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
  },

  /* ------------------------------------------------------------ responsive */
  responsive: {
    tagline: 'One layout that works on every screen.',
    framework: {
      next: [
        { name: 'Tailwind breakpoints', note: 'Prefixes like md: and lg: apply a style from a screen width upward.', code: '<div className="grid md:grid-cols-2 lg:grid-cols-3">' },
        { name: 'next/image sizes', note: 'The sizes attribute tells the browser which image width to download for each screen.' },
        { name: 'Layout shells', note: 'A layout.tsx holding the header and navigation adapts once for every page.' }
      ],
      angular: [
        { name: 'CDK BreakpointObserver', note: 'Reports which screen size is active, so components can switch layouts in code.', code: 'inject(BreakpointObserver).observe(Breakpoints.Handset)' },
        { name: 'NgOptimizedImage', note: 'The ngSrc directive adds srcset, lazy loading and warnings for oversized images.' },
        { name: 'Material sidenav', note: 'Angular Material\'s sidenav switches between an overlay on phones and a fixed panel on desktop.' }
      ]
    },
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
  },

  /* ------------------------------------------------------------ charts */
  charts: {
    tagline: 'Turning numbers into shapes people can read at a glance.',
    framework: {
      angular: [
        { name: 'Chart wrapper component', note: 'One small component wraps a library such as Chart.js or ECharts, so the rest of the app never touches it.' },
        { name: 'Signal inputs', note: 'The chart receives its data through input() signals and redraws when they change.', code: 'data = input.required<ChartData>()' },
        { name: 'afterRenderEffect', note: 'Runs after Angular updates the DOM: the right moment to create or update a canvas chart.' }
      ]
    },
    code: [
      { name: 'Data to series', note: 'Raw records are grouped and summed into the labels and values a chart expects.', code: 'const byMonth = Object.groupBy(sales, (s) => s.month)' },
      { name: 'Formatting', note: 'Axes and tooltips need number, currency and date formats that match the user\'s locale.' },
      { name: 'Resizing', note: 'Charts must redraw when their container changes size, not only when the window does.' }
    ],
    platform: [
      { name: 'Canvas vs SVG', note: 'Canvas draws pixels and is fast for many points; SVG keeps shapes in the DOM and is easier to make accessible.' },
      { name: 'Device pixel ratio', note: 'On high-density screens a canvas must be drawn at a higher resolution to stay sharp.' },
      { name: 'requestAnimationFrame', note: 'Chart animations are drawn frame by frame, in step with the screen refresh.' }
    ],
    foundations: [
      { name: 'Choosing a chart', note: 'Lines for change over time, bars for comparing categories, and pies only rarely.' },
      { name: 'Scales', note: 'A scale maps values to pixels. An axis that does not start at zero can exaggerate a change.' },
      { name: 'Aggregation', note: 'Thousands of rows become a few points: sums, averages and time buckets.' }
    ]
  },

  /* ------------------------------------------------------------ search */
  search: {
    tagline: 'Finding the right items as the user types.',
    framework: {
      angular: [
        { name: 'Debounced input', note: 'RxJS debounceTime waits until the user pauses typing before searching.', code: 'query$.pipe(debounceTime(300), distinctUntilChanged())' },
        { name: 'switchMap', note: 'Cancels the previous request when a new query starts, so old results never overwrite new ones.' },
        { name: 'Query params', note: 'The search text lives in the URL, so a filtered view can be shared or bookmarked.' }
      ],
      next: [
        { name: 'searchParams', note: 'The page reads the query from the URL and searches on the server.', code: 'const { q } = await searchParams' },
        { name: 'next/form', note: 'A Form component that updates the URL and navigates on the client, without a full reload.' },
        { name: 'Search on the server', note: 'The database does the searching, so only matching products reach the browser.' }
      ]
    },
    code: [
      { name: 'Filtering', note: 'Match items against the query and the active filters.', code: 'items.filter((p) => p.name.toLowerCase().includes(q))' },
      { name: 'Highlighting', note: 'Marking the matched part of each result shows why it was found.' },
      { name: 'Empty results', note: 'No results is a real state: suggest another spelling or clearing the filters.' }
    ],
    platform: [
      { name: 'Query strings', note: '?q=shoes&size=42 carries the search in the URL, readable by the server and the browser.' },
      { name: 'Request cancellation', note: 'AbortController stops a fetch that is no longer needed.' },
      { name: 'Full-text search', note: 'Databases such as PostgreSQL can search text by words and rank the results.' }
    ],
    foundations: [
      { name: 'Indexes', note: 'An index is a prepared lookup table; without one, every search reads every row.' },
      { name: 'Relevance', note: 'Ranking decides what comes first: a match in the title usually beats one in the description.' },
      { name: 'Fuzzy matching', note: 'Tolerating typos, such as finding "shoes" for "shose", needs edit-distance algorithms.' }
    ]
  },

  /* ------------------------------------------------------------ dark mode */
  darkMode: {
    tagline: 'One design, two color schemes.',
    framework: {
      angular: [
        { name: 'Theme service', note: 'A service keeps the chosen theme in a signal and applies it to the html element with an effect().' },
        { name: 'Material 3 theming', note: 'Angular Material builds its colors from design tokens that can switch between light and dark.' },
        { name: 'No flash on load', note: 'The saved choice is applied before the first paint, so the page does not flash white.' }
      ]
    },
    code: [
      { name: 'CSS variables', note: 'Colors live in custom properties, and the theme swaps their values.', code: ':root[data-theme="dark"] { --bg: #0b1020; }' },
      { name: 'Three choices', note: 'Light, dark and "follow the system" are the usual options.' },
      { name: 'Dark variants', note: 'Logos, shadows and chart colors need their own dark versions too.' }
    ],
    platform: [
      { name: 'prefers-color-scheme', note: 'A media query that reports the operating system setting.', code: '@media (prefers-color-scheme: dark) { ... }' },
      { name: 'color-scheme', note: 'Tells the browser to draw form controls and scrollbars in the matching scheme.' },
      { name: 'light-dark()', note: 'A CSS function that picks one of two colors for the active scheme.' }
    ],
    foundations: [
      { name: 'Contrast', note: 'WCAG asks for at least 4.5:1 contrast for normal text, in both themes.' },
      { name: 'Design tokens', note: 'Named colors such as surface and text make a second theme a matter of new values.' },
      { name: 'Not just inverted', note: 'Dark themes use softer, less saturated colors; a straight inversion looks harsh.' }
    ]
  },

  /* ------------------------------------------------------------ images */
  images: {
    tagline: 'Pictures that look sharp and load fast.',
    framework: {
      next: [
        { name: 'next/image', note: 'Resizes, converts and lazy-loads images, and reserves their space so the page does not jump.', code: '<Image src={p.photo} alt={p.name} width={600} height={600} sizes="(max-width: 768px) 100vw, 33vw" />' },
        { name: 'remotePatterns', note: 'Images from other domains, such as a CMS, must be allowed in next.config.' },
        { name: 'Blur placeholder', note: 'A tiny blurred preview shows while the full image loads.' }
      ]
    },
    code: [
      { name: 'Alt text', note: 'Describes the image for screen readers and search engines; decorative images get alt="".' },
      { name: 'Width and height', note: 'Known dimensions let the browser reserve space before the image arrives.' },
      { name: 'Lazy loading', note: 'Images further down load only when the user scrolls near them.', code: '<img loading="lazy" ...>' },
      { name: 'Art direction', note: 'The picture element can serve a different crop for phones and for desktops.' }
    ],
    platform: [
      { name: 'Modern formats', note: 'WebP and AVIF are often much smaller than JPEG at the same quality.' },
      { name: 'srcset and sizes', note: 'The browser picks the right file for the screen width and pixel density.' },
      { name: 'Image CDN', note: 'Resized versions are cached close to users, so each size is created only once.' }
    ],
    foundations: [
      { name: 'Compression', note: 'Lossy compression drops detail people will not notice; lossless keeps every pixel.' },
      { name: 'Largest Contentful Paint', note: 'The main image is often the largest element, so it decides how fast the page feels.' },
      { name: 'Aspect ratio', note: 'Width divided by height; keeping it fixed prevents stretched or jumping images.' }
    ]
  },

  /* ------------------------------------------------------------ cart */
  cart: {
    tagline: 'Remembering what the customer wants to buy.',
    framework: {
      next: [
        { name: 'Cookies API', note: 'A signed cookie holds the cart id, and the server reads it with cookies().', code: "const cartId = (await cookies()).get('cart')?.value" },
        { name: 'Server Actions', note: 'Add, remove and change quantity run on the server and refresh the page data.' },
        { name: 'useOptimistic', note: 'The cart count updates instantly and rolls back if the server says no.' }
      ]
    },
    code: [
      { name: 'Merging lines', note: 'Adding the same product twice raises its quantity instead of adding a second line.' },
      { name: 'Computed totals', note: 'Totals are calculated from the lines, never stored separately where they can drift.', code: 'const total = lines.reduce((s, l) => s + l.priceCents * l.qty, 0)' },
      { name: 'Money in cents', note: 'Whole numbers avoid floating-point errors such as 0.1 + 0.2 = 0.30000000000000004.' }
    ],
    platform: [
      { name: 'Cookies vs localStorage', note: 'Cookies travel with every request and can be HttpOnly; localStorage stays in the browser.' },
      { name: 'HttpOnly cookies', note: 'JavaScript cannot read them, which protects the cart id from injected scripts.' },
      { name: 'Several tabs', note: 'Two open tabs can change the same cart; the server copy is the one to trust.' }
    ],
    foundations: [
      { name: 'Single source of truth', note: 'The server owns the cart; the page only shows a copy of it.' },
      { name: 'Idempotency', note: 'Pressing "Add" twice on a slow network should not add two items.' },
      { name: 'Expiry', note: 'Forgotten carts need an expiry date, or the database fills up with them.' }
    ]
  },

  /* ------------------------------------------------------------ payments */
  payments: {
    tagline: 'Taking money safely, and knowing when it really arrived.',
    framework: {
      next: [
        { name: 'Stripe Checkout', note: 'A Server Action creates a checkout session and sends the customer to Stripe\'s hosted payment page.' },
        { name: 'Webhook route', note: 'A Route Handler receives Stripe\'s events and marks the order as paid.', code: 'stripe.webhooks.constructEvent(await req.text(), signature, secret)' },
        { name: 'Keys on the server', note: 'The secret key lives in an environment variable and never reaches client code.' }
      ]
    },
    code: [
      { name: 'Amounts in cents', note: 'Stripe expects whole numbers in the smallest currency unit: 19.99 becomes 1999.' },
      { name: 'Order status', note: 'Orders move through pending, paid, failed and refunded, and every change is recorded.' },
      { name: 'Idempotency keys', note: 'A retried request with the same key cannot charge the customer twice.' }
    ],
    platform: [
      { name: 'HTTPS', note: 'Payment pages must be encrypted; browsers mark plain HTTP forms as not secure.' },
      { name: 'Webhooks', note: 'Stripe calls your server with an HTTP POST when something happens, even if the customer closed the tab.' },
      { name: 'Signatures', note: 'Each webhook is signed, so your server can prove it really came from Stripe.' },
      { name: '3-D Secure', note: 'Banks may ask the customer to confirm the payment in their banking app, so the flow must handle that extra step.' }
    ],
    foundations: [
      { name: 'Never trust the browser', note: 'Prices and totals are recalculated on the server, because anything in the page can be edited.' },
      { name: 'PCI DSS', note: 'Card data has strict rules; hosted checkout keeps card numbers away from your servers.' },
      { name: 'Confirmed later', note: 'The payment is confirmed a moment after the redirect, so the success page waits for the webhook.' },
      { name: 'Refunds and disputes', note: 'Money can flow back, so orders need states for refunds and chargebacks too.' }
    ]
  },

  /* ------------------------------------------------------------ caching */
  caching: {
    tagline: 'Remembering answers so the next request is fast.',
    framework: {
      next: [
        { name: "'use cache'", note: 'Marks a function or component as cacheable when Cache Components are enabled.', code: "async function getProducts() { 'use cache'; cacheLife('hours'); /* ... */ }" },
        { name: 'Cache tags', note: 'cacheTag labels cached data, and revalidateTag refreshes everything with that label after a change.' },
        { name: 'Static shells', note: 'Pages are served from a prerendered shell and stream in the parts that change.' },
        { name: 'fetch is not cached by default', note: 'Since Next.js 15, fetch results are only cached when you opt in, which avoids stale surprises.' }
      ]
    },
    code: [
      { name: 'Cache keys', note: 'The inputs that make a result unique, such as category and page, form its key.' },
      { name: 'Invalidation', note: 'After a product changes, every cached page that shows it must be refreshed.' },
      { name: 'How stale is fine', note: 'Decide how old data may be: stock needs minutes, an article can wait hours.' }
    ],
    platform: [
      { name: 'Cache-Control', note: 'The response header that tells browsers and CDNs how long to keep a copy.', code: 'Cache-Control: public, max-age=60, stale-while-revalidate=300' },
      { name: 'CDN', note: 'Servers around the world keep copies close to users.' },
      { name: 'ETag and 304', note: 'The browser asks whether its copy is still current and gets a tiny 304 answer if it is.' }
    ],
    foundations: [
      { name: 'Cache invalidation', note: 'Famously one of the two hard things in computer science: knowing when a copy is wrong.' },
      { name: 'Time to live', note: 'How long a cached value is trusted before it is fetched again.' },
      { name: 'Speed vs freshness', note: 'Every cache trades up-to-date data for faster answers.' }
    ]
  },

  /* ------------------------------------------------------------ real-time */
  realtime: {
    tagline: 'Updates that arrive without refreshing the page.',
    framework: {
      angular: [
        { name: 'RxJS webSocket', note: 'A subject that sends and receives WebSocket messages as a stream.', code: "const socket = webSocket<Message>('wss://chat.example.com')" },
        { name: 'toSignal', note: 'Turns the message stream into a signal the template can read.' },
        { name: 'Zoneless updates', note: 'Signals tell Angular exactly what changed, so a pushed message updates only its part of the page.' }
      ]
    },
    code: [
      { name: 'Typed messages', note: 'Every message has a type and a payload whose shape client and server share.' },
      { name: 'Reconnect with backoff', note: 'When the connection drops, retry after 1, 2 and 4 seconds instead of hammering the server.' },
      { name: 'Optimistic updates', note: 'Show the change at once and roll it back if the server rejects it.' }
    ],
    platform: [
      { name: 'WebSocket protocol', note: 'An HTTP request upgrades to a long-lived, two-way connection over ws:// or wss://.' },
      { name: 'Server-Sent Events', note: 'A simpler one-way stream from server to browser over plain HTTP.' },
      { name: 'Heartbeats', note: 'Small ping messages detect connections that died without closing properly.' },
      { name: 'Scaling connections', note: 'With several servers, a shared message bus makes sure every client hears every update.' }
    ],
    foundations: [
      { name: 'Push vs pull', note: 'Polling asks every few seconds; pushing sends an update the moment it happens.' },
      { name: 'Ordering and conflicts', note: 'Two people can change the same thing at once; version numbers decide who wins.' },
      { name: 'Publish and subscribe', note: 'Clients subscribe to a channel, such as one chat room, and receive only its messages.' }
    ]
  },

  /* ------------------------------------------------------------ file upload */
  fileUpload: {
    tagline: 'Moving files from a device to a server, safely.',
    framework: {
      angular: [
        { name: 'Upload progress', note: 'HttpClient reports upload progress events when asked, which drives a progress bar.', code: "http.post(url, formData, { reportProgress: true, observe: 'events' })" },
        { name: 'Drop zone component', note: 'One component handles drag and drop, previews and the list of waiting files.' },
        { name: 'Status per file', note: 'Each file\'s state (waiting, uploading, done, failed) lives in a signal.' }
      ]
    },
    code: [
      { name: 'File input', note: 'The input element hands you File objects; accept narrows the choice.', code: '<input type="file" accept="image/*,.pdf" multiple>' },
      { name: 'Size and type checks', note: 'Reject a 2 GB video before the upload starts, not after.' },
      { name: 'FormData', note: 'Packs files and fields into one request body.' }
    ],
    platform: [
      { name: 'multipart/form-data', note: 'The encoding that carries files inside an HTTP request.' },
      { name: 'Presigned URLs', note: 'The browser uploads straight to cloud storage with a short-lived signed link.' },
      { name: 'Drag and drop events', note: 'dragover and drop hand you the files the user dropped.' }
    ],
    foundations: [
      { name: 'Never trust the extension', note: 'A file called photo.jpg can contain anything; the server checks the real type.' },
      { name: 'Storage vs database', note: 'Files go to object storage; the database keeps only their address and details.' },
      { name: 'Resumable uploads', note: 'Big files are sent in chunks, so a dropped connection does not start from zero.' }
    ]
  },

  /* ------------------------------------------------------------ notifications */
  notifications: {
    tagline: 'Telling users something happened, without being annoying.',
    framework: {
      angular: [
        { name: 'SwPush', note: 'The Angular service worker package subscribes the browser to push messages.' },
        { name: 'Toast service', note: 'In-app messages come from one service, so any component can show one.' },
        { name: 'Unread counts', note: 'A computed signal counts unread messages for badges and the tab title.' }
      ]
    },
    code: [
      { name: 'Permission flow', note: 'Ask for permission after a clear user action, never on the first page load.' },
      { name: 'Grouping', note: 'Ten messages in one chat become one notification, not ten.' },
      { name: 'Click handling', note: 'Clicking a notification opens the right chat, not just the home page.' }
    ],
    platform: [
      { name: 'Notification API', note: 'Shows a system notification while the page is open.' },
      { name: 'Push API', note: 'Delivers messages through the browser\'s push service, even when the page is closed.' },
      { name: 'Service worker', note: 'The background script that receives a push and shows it.' }
    ],
    foundations: [
      { name: 'Attention is limited', note: 'Every notification competes for focus, so send fewer and more useful ones.' },
      { name: 'Consent', note: 'Users opt in, and turning notifications off must be easy.' },
      { name: 'Delivery is not guaranteed', note: 'Pushes can arrive late or not at all, so the app shows the current state when it opens.' }
    ]
  },

  /* ------------------------------------------------------------ offline */
  offline: {
    tagline: 'An app that keeps working when the connection does not.',
    framework: {
      angular: [
        { name: '@angular/service-worker', note: 'ng add @angular/pwa adds a service worker, configured in ngsw-config.json.' },
        { name: 'SwUpdate', note: 'Notices when a new version of the app is ready and asks the user to reload.' },
        { name: 'Online signal', note: 'A signal follows the online and offline events, so the page can show the right banner.' }
      ]
    },
    code: [
      { name: 'Outbox queue', note: 'Changes made offline wait in a queue and are sent when the connection returns.' },
      { name: 'IndexedDB', note: 'A database inside the browser for data the app needs offline.' },
      { name: 'online and offline events', note: 'window fires them whenever connectivity changes.' },
      { name: 'Conflict messages', note: 'Tell the user clearly when an offline change could not be applied.' }
    ],
    platform: [
      { name: 'Service worker lifecycle', note: 'Install, activate and fetch: the worker sits between the page and the network.' },
      { name: 'Cache Storage', note: 'Keeps responses such as the app\'s files, so they load without a network.' },
      { name: 'Web App Manifest', note: 'Name, icons and colors that let the app be installed like a native one.' }
    ],
    foundations: [
      { name: 'Caching strategies', note: 'Cache first for the app\'s files, network first for fresh data.' },
      { name: 'Sync conflicts', note: 'Changes made offline can clash with changes made elsewhere in the meantime.' },
      { name: 'Eventual consistency', note: 'Devices agree on the data a little later, not instantly.' }
    ]
  },

  /* ------------------------------------------------------------ forms */
  forms: {
    tagline: 'Collecting input without losing it, or trusting it blindly.',
    framework: {
      next: [
        { name: 'Server Actions', note: 'The form posts to a server function, and it works even before JavaScript has loaded.', code: '<form action={createBooking}>' },
        { name: 'useActionState', note: 'Returns the action\'s result and pending state, for error messages and busy buttons.' },
        { name: 'Zod schemas', note: 'One schema validates the data on the server and gives it a TypeScript type.' }
      ],
      angular: [
        { name: 'Signal Forms', note: 'Stable in Angular 22: a form is built from a signal model, with its rules in a schema.', code: 'form(model, (p) => { required(p.email); email(p.email); })' },
        { name: 'Steps share one model', note: 'Each step checks its own fields, and all answers live in one model.' },
        { name: 'Field state', note: 'Touched, dirty, valid and pending decide when an error message appears.' }
      ]
    },
    code: [
      { name: 'Labels and errors', note: 'Every field needs a visible label and an error message linked to it.' },
      { name: 'Submitting', note: 'Block double submits and show progress while the request runs.' },
      { name: 'One source of values', note: 'The form model, not the page, holds the current values.' }
    ],
    platform: [
      { name: 'The form element', note: 'Native forms submit with Enter and work with password managers and autofill.' },
      { name: 'Input types', note: 'type="email", "tel" and "date" bring the right phone keyboard and built-in checks.' },
      { name: 'autocomplete', note: 'Lets the browser fill in names, addresses and card details correctly.' }
    ],
    foundations: [
      { name: 'Validate twice', note: 'Browser checks are for convenience; the server check is the real one.' },
      { name: 'Form states', note: 'Idle, editing, submitting, success and error: a small state machine.' },
      { name: 'Fewer fields', note: 'Every extra field lowers the number of people who finish the form.' }
    ]
  },

  /* ------------------------------------------------------------ database */
  database: {
    tagline: 'Where the data lives when the page is gone.',
    framework: {
      next: [
        { name: 'ORM on the server', note: 'Prisma or Drizzle queries run directly in Server Components and Server Actions.', code: 'const slots = await db.slot.findMany({ where: { date } })' },
        { name: 'Connection pooling', note: 'Serverless functions open many short connections; a pooler keeps the database from running out.' },
        { name: 'Migrations', note: 'Schema changes are versioned files, applied the same way on every machine.' }
      ]
    },
    code: [
      { name: 'Queries', note: 'Select, insert, update and delete, with filters and sorting.' },
      { name: 'Relations', note: 'A booking belongs to a customer and a service, and joins bring them together.' },
      { name: 'Transactions', note: 'Several changes that succeed together or fail together.' }
    ],
    platform: [
      { name: 'Connection string', note: 'Host, user and password in one secret environment variable.' },
      { name: 'Round trips', note: 'Each query travels over the network, so fewer, bigger queries are faster.' },
      { name: 'Backups', note: 'Automatic backups, and a restore you have actually tested.' }
    ],
    foundations: [
      { name: 'Tables and keys', note: 'Rows have primary keys, and foreign keys connect tables.' },
      { name: 'Indexes', note: 'They make lookups fast and writes a little slower.' },
      { name: 'ACID', note: 'Atomic, consistent, isolated, durable: the guarantees that keep data correct.' },
      { name: 'Normalization', note: 'Store each fact once, so an update happens in one place only.' }
    ]
  },

  /* ------------------------------------------------------------ time zones */
  timeZones: {
    tagline: 'The same moment, shown correctly everywhere.',
    framework: {
      next: [
        { name: 'Server clock vs client clock', note: 'Server Components run in the server\'s zone, so always format times with an explicit zone.' },
        { name: 'Temporal', note: 'The modern JavaScript date API handles zones and daylight saving; add a polyfill where it is missing.' },
        { name: 'Locale formatting', note: 'Libraries such as next-intl format dates for each language and zone.' }
      ]
    },
    code: [
      { name: 'Store UTC', note: 'Save every moment in UTC and convert only when showing it.' },
      { name: 'Date maths', note: 'Add days in the user\'s zone, not 24 hours.', code: "Temporal.ZonedDateTime.from('2026-10-25T09:00[Europe/Berlin]').add({ days: 1 })" },
      { name: 'Show the zone', note: 'Always print which zone a time is in.' },
      { name: 'Recurring events', note: 'A weekly 9:00 appointment stays at 9:00 local time when the clocks change.' }
    ],
    platform: [
      { name: 'Intl.DateTimeFormat', note: 'The browser formats dates for any locale and zone.' },
      { name: 'IANA zone names', note: 'Europe/Berlin, not "GMT+1", because offsets change during the year.' },
      { name: 'Daylight saving', note: 'Some days have 23 or 25 hours.' }
    ],
    foundations: [
      { name: 'UTC', note: 'The shared reference clock, with no daylight saving.' },
      { name: 'Epoch time', note: 'Computers count milliseconds since 1 January 1970, UTC.' },
      { name: 'Rules change', note: 'Governments change time zone rules, so the zone database is updated several times a year.' }
    ]
  },

  /* ------------------------------------------------------------ email */
  email: {
    tagline: 'Messages that arrive on time, and not in spam.',
    framework: {
      next: [
        { name: 'React Email', note: 'Email templates written as React components.' },
        { name: 'Sending from the server', note: 'A Server Action or background job calls an email API such as Resend.' },
        { name: 'Scheduled jobs', note: 'Reminders need a scheduler, such as a cron job, because no page is open when they go out.' }
      ]
    },
    code: [
      { name: 'Templates with data', note: 'The name, the date and a link to manage the booking are filled in for each message.' },
      { name: 'Retries', note: 'If the email provider fails, try again later instead of losing the message.' },
      { name: 'Unsubscribe link', note: 'Every reminder needs an easy way to stop them.' }
    ],
    platform: [
      { name: 'SMTP', note: 'The protocol that moves email between servers.' },
      { name: 'SPF, DKIM and DMARC', note: 'DNS records that prove your domain is allowed to send the email.' },
      { name: 'HTML email', note: 'Email clients support old, limited HTML, so layouts use tables and inline styles.' }
    ],
    foundations: [
      { name: 'Queues', note: 'Sending happens in the background, so a slow provider never slows the page.' },
      { name: 'Deliverability', note: 'Your sending reputation decides whether mail lands in the inbox or in spam.' },
      { name: 'At-least-once delivery', note: 'Retries can send twice, so each message carries an id.' }
    ]
  },

  /* ------------------------------------------------------------ validation */
  validation: {
    tagline: 'Rules that keep wrong data out, with messages people understand.',
    framework: {
      angular: [
        { name: 'Schema rules', note: 'Signal Forms rules such as required, min and pattern are declared once in the form\'s schema.' },
        { name: 'Cross-field rules', note: 'A rule can compare fields, such as an end date after the start date.' },
        { name: 'Async rules', note: 'Checks that need the server, such as an unused policy number, run with a pending state.' }
      ]
    },
    code: [
      { name: 'Helpful messages', note: 'Say what is wrong and how to fix it: "Enter a date after today".' },
      { name: 'When to show errors', note: 'After the user leaves a field or submits, not on the first keystroke.' },
      { name: 'Shared rules', note: 'The same rules run in the browser and again on the server.' },
      { name: 'Server errors on fields', note: 'Errors the server returns appear next to the field they belong to.' }
    ],
    platform: [
      { name: 'Built-in constraints', note: 'HTML attributes such as required, min and pattern give free checks.' },
      { name: 'aria-invalid', note: 'Marks a field as invalid for screen readers.' },
      { name: 'aria-describedby', note: 'Links the error text to its field, so it is read aloud.' }
    ],
    foundations: [
      { name: 'Never trust input', note: 'Anything that comes from outside the server can be forged.' },
      { name: 'Validating vs sanitizing', note: 'Validation rejects bad data; sanitizing makes data safe to display.' },
      { name: 'Good defaults', note: 'Sensible pre-filled values prevent many errors before they happen.' }
    ]
  },

  /* ------------------------------------------------------------ i18n */
  i18n: {
    tagline: 'One site, many languages and formats.',
    framework: {
      angular: [
        { name: '@angular/localize', note: 'Marks text with i18n attributes and builds one version of the app per language.' },
        { name: 'Transloco', note: 'A popular runtime option that switches language without a rebuild.' },
        { name: 'Locale pipes', note: 'DatePipe, CurrencyPipe and DecimalPipe format values for the active locale.' }
      ],
      next: [
        { name: 'next-intl', note: 'Loads the messages for each language and provides t() in Server and Client Components.' },
        { name: '[locale] segment', note: 'The language is part of the URL, such as /de/news, so each version can be indexed.' },
        { name: 'Language detection', note: 'proxy.ts can send first-time visitors to their preferred language.' }
      ]
    },
    code: [
      { name: 'Message keys', note: 'Text lives in translation files under keys, not inside components.' },
      { name: 'Plurals', note: 'ICU messages handle "one", "few" and "many" forms, which differ per language.', code: '{count, plural, one {# article} other {# articles}}' },
      { name: 'Intl formatting', note: 'Numbers, dates and currencies follow each locale\'s conventions.' }
    ],
    platform: [
      { name: 'lang attribute', note: '<html lang="de"> tells browsers and screen readers the language of the page.' },
      { name: 'hreflang', note: 'Tells search engines which URL serves which language.' },
      { name: 'Right to left', note: 'Arabic and Hebrew need dir="rtl" and layouts that mirror.' }
    ],
    foundations: [
      { name: 'Unicode', note: 'One character set for every writing system, stored as UTF-8.' },
      { name: 'Locale vs language', note: 'en-US and en-GB share a language but not their date formats.' },
      { name: 'Text expansion', note: 'German text can be about 30% longer than English, so layouts must stretch.' }
    ]
  },

  /* ------------------------------------------------------------ accessibility */
  accessibility: {
    tagline: 'Usable by everyone, including keyboard and screen reader users.',
    framework: {
      angular: [
        { name: 'Angular Aria', note: 'Stable in Angular 22: tested keyboard and ARIA behaviour for common widgets.' },
        { name: 'CDK a11y', note: 'Focus traps, live announcements and keyboard navigation for lists.', code: "inject(LiveAnnouncer).announce('Card moved to Done')" },
        { name: 'Focus after navigation', note: 'After a route change, move focus to the new heading so screen readers follow.' }
      ]
    },
    code: [
      { name: 'Semantic HTML', note: 'Buttons for actions, links for navigation, headings in order.' },
      { name: 'Keyboard support', note: 'Everything a mouse can do must work with Tab, Enter, Space and the arrow keys.' },
      { name: 'Accessible names', note: 'Every control needs a name a screen reader can announce.' },
      { name: 'Visible focus', note: 'A clear focus outline shows keyboard users where they are.' }
    ],
    platform: [
      { name: 'Accessibility tree', note: 'The browser builds a second tree from your HTML for assistive technology.' },
      { name: 'Screen readers', note: 'NVDA, VoiceOver and TalkBack read that tree aloud.' },
      { name: 'Focus order', note: 'Tab follows the order of the HTML, not the order on screen.' },
      { name: 'Reduced motion', note: 'prefers-reduced-motion tells you when to tone animation down.' }
    ],
    foundations: [
      { name: 'WCAG 2.2', note: 'The international standard; level AA is the usual target.' },
      { name: 'Inclusive design', note: 'Designing for disabilities improves the product for everyone.' },
      { name: 'Test with people', note: 'Automated checkers catch only some problems; real users find the rest.' }
    ]
  },

  /* ------------------------------------------------------------ CMS */
  cms: {
    tagline: 'Letting non-developers change the content.',
    framework: {
      next: [
        { name: 'Headless CMS', note: 'Pages fetch content from a CMS API such as Sanity, Contentful or Payload.' },
        { name: 'Draft Mode', note: 'Editors preview unpublished changes on the real site.', code: '(await draftMode()).isEnabled' },
        { name: 'Refresh on publish', note: 'A CMS webhook calls a route that refreshes the cached pages.' }
      ]
    },
    code: [
      { name: 'Content models', note: 'Typed shapes for pages, posts and authors.' },
      { name: 'Rich text', note: 'Structured text from the CMS is mapped to your own components.' },
      { name: 'Missing fields', note: 'An empty image or field should not break the page.' }
    ],
    platform: [
      { name: 'REST or GraphQL', note: 'The CMS serves content as JSON over HTTP.' },
      { name: 'Webhooks', note: 'The CMS tells your site when something is published.' },
      { name: 'Asset CDN', note: 'Images and files come from the CMS\'s own CDN.' }
    ],
    foundations: [
      { name: 'Content vs code', note: 'Changing text should not need a developer or a deploy.' },
      { name: 'Structured content', note: 'Content stored as fields, not HTML, can be reused anywhere.' },
      { name: 'Editorial workflow', note: 'Draft, review and publish, with roles for who may do what.' }
    ]
  },

  /* ------------------------------------------------------------ analytics */
  analytics: {
    tagline: 'Measuring what visitors actually do.',
    framework: {
      next: [
        { name: 'Web Vitals reporting', note: 'useReportWebVitals sends real loading and responsiveness numbers from visitors.' },
        { name: 'next/script', note: 'Loads third-party scripts after the page is interactive.', code: '<Script src="..." strategy="afterInteractive" />' },
        { name: 'Server-side events', note: 'Sign-ups and purchases are recorded on the server, where ad blockers cannot drop them.' }
      ]
    },
    code: [
      { name: 'Event names', note: 'Name events clearly and consistently: signup_started, signup_completed.' },
      { name: 'Consent check', note: 'No tracking before the visitor agrees, where the law requires it.' },
      { name: 'Funnels', note: 'The steps from visit to purchase show where people drop out.' }
    ],
    platform: [
      { name: 'Cookies', note: 'They recognise returning visitors, which is why consent banners exist.' },
      { name: 'sendBeacon', note: 'Sends data reliably even while the page is closing.' },
      { name: 'Ad blockers', note: 'Many visitors block analytics scripts, so browser-side numbers always run low.' }
    ],
    foundations: [
      { name: 'Privacy law', note: 'GDPR and similar laws decide what you may collect and keep.' },
      { name: 'Metrics that matter', note: 'Track numbers that lead to decisions, not numbers that only look good.' },
      { name: 'Correlation is not causation', note: 'Two numbers moving together do not prove that one causes the other.' }
    ]
  },

  /* ------------------------------------------------------------ performance */
  performance: {
    tagline: 'Pages that load fast and respond at once.',
    framework: {
      next: [
        { name: 'Server Components', note: 'Code that renders on the server sends no JavaScript to the browser.' },
        { name: 'next/font', note: 'Fonts are self-hosted and sized in advance, so text does not jump.' },
        { name: 'Partial Prefetching', note: 'New in Next.js 16.3: links prefetch a shared loading shell, so navigation feels instant.' }
      ]
    },
    code: [
      { name: 'Smaller bundles', note: 'Import only what you use, and load heavy widgets when they are needed.' },
      { name: 'No waterfalls', note: 'Start independent requests at the same time.', code: 'const [plans, reviews] = await Promise.all([getPlans(), getReviews()])' },
      { name: 'Memoization', note: 'Do not recompute expensive values on every render.' }
    ],
    platform: [
      { name: 'Core Web Vitals', note: 'LCP, CLS and INP: loading, visual stability and responsiveness.' },
      { name: 'Critical rendering path', note: 'The HTML, CSS and fonts needed for the first view load first.' },
      { name: 'Compression', note: 'Brotli or gzip shrink text files on their way to the browser.' }
    ],
    foundations: [
      { name: 'Measure first', note: 'Lighthouse and real-user data before any optimization.' },
      { name: 'Latency', note: 'Distance and round trips often matter more than bandwidth.' },
      { name: 'Budgets', note: 'Agree limits, such as 170 KB of JavaScript, and check them automatically.' }
    ]
  },

  /* ------------------------------------------------------------ drag and drop */
  dragDrop: {
    tagline: 'Moving things by hand, on every device.',
    framework: {
      angular: [
        { name: 'CDK DragDrop', note: 'cdkDropList and cdkDrag make lists sortable and connect columns to each other.', code: '<div cdkDropList (cdkDropListDropped)="drop($event)">' },
        { name: 'moveItemInArray', note: 'CDK helpers reorder a list or move an item between two lists.' },
        { name: 'Enter predicates', note: 'Rules decide which column may accept which card.' }
      ]
    },
    code: [
      { name: 'Reordering', note: 'Update the array first, then save the new position.' },
      { name: 'Optimistic save', note: 'Leave the card where it was dropped, and roll back if saving fails.' },
      { name: 'Keyboard alternative', note: 'Move buttons or a menu for people who cannot drag.' }
    ],
    platform: [
      { name: 'Pointer events', note: 'One API for mouse, pen and touch.' },
      { name: 'Touch and scrolling', note: 'On phones, dragging must not fight with scrolling.' },
      { name: 'Live regions', note: 'Announce "Card moved to Done" for screen reader users.' }
    ],
    foundations: [
      { name: 'Fractional positions', note: 'A position such as 1.5 between 1 and 2 moves one card without renumbering the column.' },
      { name: 'Direct manipulation', note: 'The item must follow the finger at once, or the interface feels broken.' },
      { name: 'Reversible moves', note: 'Mistakes happen, so every move should be easy to undo.' }
    ]
  },

  /* ------------------------------------------------------------ undo */
  undo: {
    tagline: 'Making every action reversible.',
    framework: {
      angular: [
        { name: 'Store history', note: 'Past and future states live in the store; community add-ons such as withUndoRedo bring this to NgRx SignalStore.' },
        { name: 'Keyboard shortcuts', note: 'A host listener turns Ctrl+Z and Ctrl+Shift+Z into undo and redo.' },
        { name: 'Immutable updates', note: 'Each change creates new objects, so older states stay intact and can be restored.' }
      ]
    },
    code: [
      { name: 'History stack', note: 'Push every change onto a stack; undo pops the last one.' },
      { name: 'Command pattern', note: 'Each action knows how to do and undo itself.', code: '{ run: () => move(card, to), revert: () => move(card, from) }' },
      { name: 'History limits', note: 'Keep the last 50 steps, not every change forever.' }
    ],
    platform: [
      { name: 'Modifier keys', note: 'Ctrl on Windows and Linux, Cmd on a Mac.' },
      { name: 'Native undo', note: 'Text fields already have their own undo; do not break it.' },
      { name: 'Saving the undo', note: 'An undo is a new change, and the server must hear about it too.' }
    ],
    foundations: [
      { name: 'Event sourcing', note: 'Store the list of changes, and the current state follows from it.' },
      { name: 'Forgiving interfaces', note: 'Undo lets people work quickly without fear.' },
      { name: 'Undo with others', note: 'With several people editing, undo must revert only your own change.' }
    ]
  },

  /* ------------------------------------------------------------ tests */
  tests: {
    tagline: 'Proof that the code does what it should, now and later.',
    framework: {
      angular: [
        { name: 'Vitest', note: 'The default test runner in Angular 22: fast, with Jest-style tests.' },
        { name: 'TestBed', note: 'Creates components and services with their dependencies for a test.' },
        { name: 'Component harnesses', note: 'CDK harnesses test Material components through a stable API instead of CSS selectors.' }
      ]
    },
    code: [
      { name: 'Arrange, act, assert', note: 'Set things up, do one thing, check the result.', code: 'expect(board.column("done").cards().length).toBe(3)' },
      { name: 'Test doubles', note: 'Fake services and servers keep tests fast and repeatable.' },
      { name: 'End-to-end tests', note: 'Playwright drives a real browser through complete user journeys.' }
    ],
    platform: [
      { name: 'Headless browsers', note: 'Browsers without a window run the tests on a build server.' },
      { name: 'A simulated DOM', note: 'Unit tests often run in a fake DOM such as jsdom instead of a real browser.' },
      { name: 'Continuous integration', note: 'Every push runs the tests automatically.' }
    ],
    foundations: [
      { name: 'Test pyramid', note: 'Many fast unit tests, fewer integration tests, a few end-to-end tests.' },
      { name: 'Deterministic tests', note: 'A test that fails at random is worse than no test.' },
      { name: 'Regression tests', note: 'A test for every fixed bug keeps it from coming back.' },
      { name: 'Coverage is not quality', note: 'Code can be 100% covered and still miss the cases that matter.' }
    ]
  },

  /* ------------------------------------------------------------ AI */
  ai: {
    tagline: 'Calling a language model safely from your own app.',
    framework: {
      next: [
        { name: 'AI SDK', note: 'The Vercel AI SDK gives one API for many model providers.' },
        { name: 'Route Handler', note: 'The model is called from the server, where the API key stays secret.' },
        { name: 'Model from env', note: 'The model id comes from an environment variable, so it can change without a code change.' }
      ]
    },
    code: [
      { name: 'Messages array', note: 'The conversation is a list of user and assistant messages sent with every request.' },
      { name: 'System prompt', note: 'Instructions that shape every answer, kept in their own file.' },
      { name: 'Context limits', note: 'Long histories are trimmed or summarized to fit what the model can read.' }
    ],
    platform: [
      { name: 'API calls over HTTPS', note: 'Every answer is a request to the provider\'s API.' },
      { name: 'Latency', note: 'Answers take seconds, so the page must show that something is happening.' },
      { name: 'API keys', note: 'A leaked key means someone else spends your money.' }
    ],
    foundations: [
      { name: 'Tokens', note: 'Models read and write text in small pieces called tokens, and you pay per token.' },
      { name: 'Context window', note: 'The maximum amount of text a model can consider at once.' },
      { name: 'Hallucinations', note: 'Models can state false things confidently, so important answers need sources.' }
    ]
  },

  /* ------------------------------------------------------------ streaming */
  streaming: {
    tagline: 'Showing the answer while it is still being written.',
    framework: {
      next: [
        { name: 'streamText', note: 'The AI SDK passes the model\'s tokens on as they are generated.' },
        { name: 'useChat', note: 'A client hook that sends messages and renders the reply as it streams in.' },
        { name: 'Suspense streaming', note: 'Pages can stream too: the shell first, slow parts later.' }
      ]
    },
    code: [
      { name: 'Reading chunks', note: 'Read the stream piece by piece and append each piece.', code: 'for await (const chunk of stream) text += chunk' },
      { name: 'Stop button', note: 'An AbortController ends the stream when the user presses Stop.' },
      { name: 'Unfinished Markdown', note: 'Lists and code blocks must render sensibly while they are still incomplete.' }
    ],
    platform: [
      { name: 'Chunked responses', note: 'HTTP can send a response in parts instead of all at once.' },
      { name: 'ReadableStream', note: 'The browser API for reading data as it arrives.' },
      { name: 'TextDecoder', note: 'Turns bytes into text, even when one character is split across two chunks.' }
    ],
    foundations: [
      { name: 'Time to first token', note: 'Users judge speed by when the first words appear.' },
      { name: 'Backpressure', note: 'A slow reader must be able to slow down a fast writer.' },
      { name: 'Perceived speed', note: 'Visible progress feels faster than an empty wait.' }
    ]
  },

  /* ------------------------------------------------------------ rate limiting */
  rateLimiting: {
    tagline: 'Protecting the app, and the budget, from too many requests.',
    framework: {
      next: [
        { name: 'Check in the route', note: 'The Route Handler checks the limit before it calls the model.', code: 'const { success } = await ratelimit.limit(userId)' },
        { name: 'Shared counters', note: 'A store such as Upstash Redis counts requests across all serverless instances.' },
        { name: 'proxy.ts', note: 'Rough limits by IP address can run before any route renders.' }
      ]
    },
    code: [
      { name: 'Per-user limits', note: 'Signed-in users are limited by account, guests by IP address.' },
      { name: 'Friendly errors', note: 'Tell the user when they can try again.' },
      { name: 'Cost limits', note: 'For AI features, count tokens as well as requests.' }
    ],
    platform: [
      { name: 'HTTP 429', note: 'Too Many Requests, sent with a Retry-After header.' },
      { name: 'IP addresses', note: 'Many people can share one IP, and one person can switch IPs.' },
      { name: 'Forwarded headers', note: 'Behind a proxy, the real client IP comes from headers the platform sets.' }
    ],
    foundations: [
      { name: 'Token bucket', note: 'Requests spend tokens that refill at a steady rate, which allows short bursts.' },
      { name: 'Sliding window', note: 'Counts requests in the last N seconds, smoother than fixed time windows.' },
      { name: 'Abuse prevention', note: 'Limits stop scripts from draining your budget or your database.' }
    ]
  },

  /* ------------------------------------------------------------ video */
  video: {
    tagline: 'Playing lessons smoothly on any connection.',
    framework: {
      angular: [
        { name: '@defer', note: 'The heavy player code loads only when the player scrolls into view.', code: '@defer (on viewport) { <app-player /> } @placeholder { <p>Loading the lesson</p> }' },
        { name: 'YouTube player', note: '@angular/youtube-player embeds YouTube videos with a typed API.' },
        { name: 'Progress in a signal', note: 'The player\'s timeupdate events update a signal that saves the student\'s progress.' }
      ]
    },
    code: [
      { name: 'Player state', note: 'Playing, paused, buffering and ended decide which controls to show.' },
      { name: 'Captions', note: 'Track elements add subtitles in several languages.', code: '<track kind="captions" src="lesson.en.vtt" srclang="en">' },
      { name: 'Resume position', note: 'Start where the student stopped last time.' }
    ],
    platform: [
      { name: 'The video element', note: 'Built-in playback, controls and events.' },
      { name: 'Adaptive streaming', note: 'HLS and DASH switch quality as the connection changes.' },
      { name: 'Range requests', note: 'The browser downloads only the part of the file it needs.' }
    ],
    foundations: [
      { name: 'Codecs', note: 'H.264, VP9 and AV1 trade file size against device support.' },
      { name: 'Bitrate', note: 'More bits per second means better quality and more data.' },
      { name: 'Bandwidth varies', note: 'Mobile connections change all the time, so quality must adapt.' }
    ]
  },

  /* ------------------------------------------------------------ infinite scroll */
  infiniteScroll: {
    tagline: 'Loading more as the reader reaches the end.',
    framework: {
      next: [
        { name: 'Server Action paging', note: 'A Server Action returns the next page of articles.' },
        { name: 'Client list', note: 'A client component appends each page and watches the end of the list.' },
        { name: 'First page on the server', note: 'The first page renders on the server, so search engines see real content.' }
      ]
    },
    code: [
      { name: 'Cursor pagination', note: 'Ask for articles after the last one you have, not for "page 7".', code: 'getArticles({ after: lastId, limit: 20 })' },
      { name: 'Loading and the end', note: 'Show a loader while fetching and a clear message when there is nothing more.' },
      { name: 'No duplicates', note: 'Articles published while reading must not appear twice.' }
    ],
    platform: [
      { name: 'IntersectionObserver', note: 'Tells you when a marker element at the bottom of the list comes into view.' },
      { name: 'Scroll restoration', note: 'Pressing back should return to the same place in the list.' },
      { name: 'DOM size', note: 'Thousands of items slow the page, so very long lists are virtualized.' }
    ],
    foundations: [
      { name: 'Offset vs cursor', note: 'Offsets skip or repeat items when new ones arrive; cursors do not.' },
      { name: 'Virtualization', note: 'Render only the rows that are on screen.' },
      { name: 'Reachable footer', note: 'An endless list hides the footer, so its important links need another place.' }
    ]
  }
};
