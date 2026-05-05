export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string; // ISO date
  readingTime: number; // minutes
  author: string;
  coverEmoji: string;
  category: string;
  content: string; // HTML string
};

export const BLOG_POSTS: BlogPost[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. What is a trading journal
  // ─────────────────────────────────────────────────────────────
  {
    slug: "what-is-a-trading-journal",
    title: "What Is a Trading Journal & Why Every Trader Needs One",
    description:
      "A trading journal is the single most powerful tool a trader can use to improve performance. Learn what it is, what to track, and how to get started.",
    keywords: [
      "what is a trading journal",
      "trading journal",
      "trading diary",
      "trade tracking",
      "how to journal trades",
    ],
    publishedAt: "2026-04-28",
    readingTime: 6,
    author: "Bull & Bear Team",
    coverEmoji: "📓",
    category: "Fundamentals",
    content: `
<h2 id="definition">What Is a Trading Journal?</h2>
<p>A trading journal is a structured record of every trade you make — including the entry price, exit price, position size, the reasoning behind the trade, and the outcome. Think of it as a logbook for your trading decisions.</p>
<p>At its most basic, a trading journal can be a spreadsheet. At its most powerful, it's an analytics platform that reveals patterns in your behaviour, shows you which setups actually work, and tracks your psychological state alongside your profit and loss.</p>

<h2 id="what-to-track">What Should You Track in a Trading Journal?</h2>
<p>A good trading journal captures more than just numbers. Here's what every entry should include:</p>
<ul>
  <li><strong>Date and time</strong> — when you entered and exited the trade</li>
  <li><strong>Instrument</strong> — the asset you traded (forex pair, stock, futures contract, etc.)</li>
  <li><strong>Direction</strong> — long or short</li>
  <li><strong>Entry and exit price</strong> — your exact fill prices</li>
  <li><strong>Position size and lot size</strong> — how much you risked</li>
  <li><strong>Stop loss and take profit</strong> — your planned risk/reward</li>
  <li><strong>Actual profit or loss</strong> — in both currency and percentage</li>
  <li><strong>Trade rationale</strong> — why you took the trade</li>
  <li><strong>Emotional state</strong> — were you calm, anxious, revenge trading?</li>
  <li><strong>Lessons learned</strong> — what would you do differently?</li>
</ul>

<h2 id="why-it-matters">Why Does a Trading Journal Matter?</h2>
<p>Most traders lose money not because they lack knowledge, but because they repeat the same mistakes. A trading journal makes those mistakes visible.</p>
<p>Without a journal, you rely on memory — and memory is unreliable. You'll remember your winners and forget the losing trades that followed a clear pattern. A journal forces honest accounting.</p>
<p>With consistent journaling, you will start to notice things like:</p>
<ul>
  <li>You perform significantly worse on Fridays</li>
  <li>Your best trades come in the first two hours of the session</li>
  <li>You always cut winners too early but let losers run</li>
  <li>One specific setup has a positive expectancy — the rest don't</li>
</ul>
<p>These insights are invisible without data. A trading journal creates that data.</p>

<h2 id="psychology">The Psychological Edge</h2>
<p>Trading is as much a mental game as it is a technical one. Documenting your emotional state alongside your trades creates a link between psychology and performance that most traders never analyse.</p>
<p>Over time you may discover that your win rate drops significantly when you trade after a losing streak, or that your best performance happens on days when you note feeling "calm and focused." This is actionable intelligence.</p>

<h2 id="how-to-start">How to Start a Trading Journal</h2>
<p>Starting is simple. After every trade, record the key data points listed above. Don't skip trades — consistency is what makes the journal valuable. A journal with 20 trades carefully logged is worth more than one with 200 trades missing half the fields.</p>
<p>Review your journal weekly. Look for patterns. Ask yourself: what did my winning trades have in common? What did my losing trades have in common?</p>
<p>If you want to remove the friction of manual logging and get automatic statistics, charts, and insights, <a href="/auth/signup">Bull &amp; Bear</a> does all of this for you — including importing trades directly from cTrader and MetaTrader.</p>

<h2 id="summary">Summary</h2>
<p>A trading journal is not optional for serious traders. It is the difference between guessing and knowing. It turns vague feelings about your performance into hard data — and hard data is what drives improvement.</p>
<p>Start today. Log your next trade. Review it honestly. Repeat.</p>
    `.trim(),
  },

  // ─────────────────────────────────────────────────────────────
  // 2. How to keep a trading journal
  // ─────────────────────────────────────────────────────────────
  {
    slug: "how-to-keep-a-trading-journal",
    title: "How to Keep a Trading Journal: A Step-by-Step Guide",
    description:
      "Learn exactly how to keep a trading journal that actually improves your trading. From what to log to how to review it — a practical, step-by-step guide for traders.",
    keywords: [
      "how to keep a trading journal",
      "trading journal guide",
      "trade journaling tips",
      "trading journal template",
      "how to journal your trades",
    ],
    publishedAt: "2026-05-01",
    readingTime: 7,
    author: "Bull & Bear Team",
    coverEmoji: "✍️",
    category: "Guides",
    content: `
<h2 id="step1">Step 1 — Choose Your Format</h2>
<p>You have three main options for keeping a trading journal:</p>
<ul>
  <li><strong>Spreadsheet (Excel / Google Sheets)</strong> — free and flexible, but tedious to maintain and offers no automatic analysis.</li>
  <li><strong>Dedicated journaling app</strong> — tools like Bull &amp; Bear automatically import your trades, generate statistics, and track your psychology. Far less friction.</li>
  <li><strong>Paper notebook</strong> — works for reflection and notes, but impossible to analyse at scale.</li>
</ul>
<p>For most active traders, a dedicated app is the right choice. The goal is to remove every barrier to logging consistently.</p>

<h2 id="step2">Step 2 — Log Trades Immediately</h2>
<p>The biggest mistake traders make is waiting until the end of the day — or week — to journal. By then, the details are fuzzy and the emotional context is lost.</p>
<p>Log each trade as soon as it closes. Record the facts first: entry, exit, size, P&amp;L. Then immediately add your notes while the trade is fresh: why did you take it, what happened, how did you feel?</p>

<h2 id="step3">Step 3 — Include Your Reasoning</h2>
<p>Numbers alone are not enough. The most valuable part of a trading journal is the <em>why</em>. Before entering a trade, write down:</p>
<ul>
  <li>What is the setup? (e.g. breakout above resistance, trend continuation, news catalyst)</li>
  <li>What is your invalidation level? (Where does the trade idea stop being valid?)</li>
  <li>What is your risk/reward ratio?</li>
  <li>Is this trade within your rules?</li>
</ul>
<p>After the trade closes, add: did it play out as expected? If not, why not?</p>

<h2 id="step4">Step 4 — Track Your Emotional State</h2>
<p>Rate your emotional state before and after each trade on a simple scale: calm, slightly anxious, stressed, or revenge-trading mode. Over hundreds of trades, you will see exactly how your emotional state correlates with your results.</p>
<p>This is one of the most valuable — and most overlooked — dimensions of trading performance.</p>

<h2 id="step5">Step 5 — Review Weekly</h2>
<p>Raw data without review is useless. Set aside 30 minutes every week to review your journal. Ask these questions:</p>
<ul>
  <li>What was my win rate this week? How does it compare to my average?</li>
  <li>What was my biggest mistake? Did I break any of my rules?</li>
  <li>Which setup performed best? Which worst?</li>
  <li>Was there a day or time of day where I consistently underperformed?</li>
  <li>What is one thing I will do differently next week?</li>
</ul>

<h2 id="step6">Step 6 — Review Monthly for Patterns</h2>
<p>Monthly reviews reveal patterns that weekly reviews miss. Look at your statistics over 20–50 trades to find your real edge:</p>
<ul>
  <li><strong>Best performing instrument</strong> — do you trade FX better than indices?</li>
  <li><strong>Best performing session</strong> — London open? New York session?</li>
  <li><strong>Average winner vs average loser</strong> — is your risk/reward working in practice?</li>
  <li><strong>Max drawdown</strong> — how far did your account drop before recovering?</li>
</ul>

<h2 id="mistakes">Common Journaling Mistakes to Avoid</h2>
<ul>
  <li><strong>Skipping losing trades</strong> — this destroys the integrity of your data and creates a false picture of your performance.</li>
  <li><strong>Being vague</strong> — "took a trade on EUR/USD" tells you nothing. Be specific about your reasoning.</li>
  <li><strong>Journaling but never reviewing</strong> — logging without analysis is just data hoarding.</li>
  <li><strong>Changing your process too frequently</strong> — give each system enough trades to evaluate properly (minimum 30–50 trades).</li>
</ul>

<h2 id="tools">Make It Easy with the Right Tool</h2>
<p>The best trading journal is the one you actually use. If the process is too manual or time-consuming, you'll stop doing it after a week.</p>
<p><a href="/auth/signup">Bull &amp; Bear</a> was built to remove that friction. Import your trades directly from cTrader or MetaTrader, get automatic statistics and charts, and keep a daily journal — all in one place. <a href="/auth/signup">Start your free 14-day trial</a> and make journaling a habit that sticks.</p>
    `.trim(),
  },

  // ─────────────────────────────────────────────────────────────
  // 3. Best trading journal for cTrader
  // ─────────────────────────────────────────────────────────────
  {
    slug: "best-trading-journal-ctrader",
    title: "The Best Trading Journal for cTrader Users in 2026",
    description:
      "Looking for a trading journal that works with cTrader? Discover how to import your cTrader trades automatically and start analysing your performance.",
    keywords: [
      "cTrader trading journal",
      "cTrader journal",
      "best trading journal cTrader",
      "import cTrader trades",
      "cTrader performance analysis",
    ],
    publishedAt: "2026-05-03",
    readingTime: 5,
    author: "Bull & Bear Team",
    coverEmoji: "📊",
    category: "Platform Guides",
    content: `
<h2 id="problem">The cTrader Journaling Problem</h2>
<p>cTrader is one of the best trading platforms available — excellent charting, fast execution, and a clean interface. But like most trading platforms, its built-in analytics are limited. You can see your trade history, but you can't easily identify patterns, track your psychology, or measure your performance over time in a meaningful way.</p>
<p>That's where a dedicated trading journal comes in.</p>

<h2 id="what-to-look-for">What to Look for in a cTrader Journal</h2>
<p>Not all trading journals support cTrader imports. When evaluating options, look for:</p>
<ul>
  <li><strong>Native cTrader CSV/XLSX import</strong> — you should be able to export your trade history from cTrader and import it directly, without reformatting</li>
  <li><strong>Multi-currency support</strong> — cTrader traders often use accounts in EUR, USD, or GBP</li>
  <li><strong>Proper handling of partial closes</strong> — cTrader reports partial position closes as separate rows; your journal should merge these correctly</li>
  <li><strong>Support for both English and French exports</strong> — cTrader's export language depends on your platform language setting</li>
</ul>

<h2 id="how-to-import">How to Import cTrader Trades into Bull & Bear</h2>
<p>Bull &amp; Bear was built with cTrader users in mind. Here's how to import your trades in under 2 minutes:</p>
<ol>
  <li>Open cTrader and navigate to your <strong>Trade History</strong> tab</li>
  <li>Select the date range you want to export and click <strong>Export</strong> — choose CSV or XLSX</li>
  <li>Log in to <a href="/auth/login">Bull &amp; Bear</a> and go to the <strong>Journal</strong> page</li>
  <li>Click the <strong>Import</strong> button and upload your file</li>
  <li>Bull &amp; Bear automatically parses your trades, calculates P&amp;L, and updates your statistics</li>
</ol>
<p>The import works whether your cTrader is set to English or French. Both export formats are fully supported.</p>

<h2 id="what-you-get">What You Get After Importing</h2>
<p>Once your trades are imported, Bull &amp; Bear gives you:</p>
<ul>
  <li><strong>Equity curve</strong> — visualise your account growth (or drawdown) over time</li>
  <li><strong>Win rate by instrument</strong> — see which pairs or assets you trade best</li>
  <li><strong>Performance by session</strong> — are you better in the London or New York session?</li>
  <li><strong>Average R-multiple</strong> — are you actually achieving your planned risk/reward?</li>
  <li><strong>Calendar view</strong> — see your P&amp;L by day, week, and month at a glance</li>
  <li><strong>Daily journal</strong> — attach notes and psychological state to each trading day</li>
</ul>

<h2 id="multiple-accounts">Managing Multiple cTrader Accounts</h2>
<p>Many cTrader traders run multiple accounts — a live account, a prop firm account, and a demo account for testing strategies. Bull &amp; Bear lets you create separate account profiles and track each one independently. Switch between them instantly from the dashboard.</p>

<h2 id="get-started">Get Started Free</h2>
<p>Bull &amp; Bear offers a <strong>14-day free trial</strong> with full access to all features — no credit card required. If you trade on cTrader and want to stop guessing and start knowing, <a href="/auth/signup">create your free account</a> and import your first trades today.</p>
    `.trim(),
  },

  // ─────────────────────────────────────────────────────────────
  // 4. Trading journal improve performance
  // ─────────────────────────────────────────────────────────────
  {
    slug: "trading-journal-improve-performance",
    title: "How a Trading Journal Can Improve Your Trading Performance",
    description:
      "Discover the proven ways a consistent trading journal improves win rate, risk management, and trading psychology — backed by data from real trader behaviour.",
    keywords: [
      "trading journal improve performance",
      "does a trading journal help",
      "trading journal benefits",
      "improve trading results",
      "trading performance analytics",
    ],
    publishedAt: "2026-05-05",
    readingTime: 6,
    author: "Bull & Bear Team",
    coverEmoji: "📈",
    category: "Performance",
    content: `
<h2 id="evidence">Does Journaling Actually Work?</h2>
<p>Ask any consistently profitable trader how they got there, and almost all of them will mention one practice: keeping a detailed trading journal. This isn't coincidence — it's a feedback loop.</p>
<p>Trading without a journal is like training for a marathon without tracking your times. You might improve gradually through experience, but you have no way to identify what's working, what's holding you back, or how fast you're actually improving.</p>

<h2 id="pattern-recognition">1. Reveals Hidden Patterns in Your Trading</h2>
<p>The human brain is terrible at identifying statistical patterns from memory. You'll remember your 10-R winner vividly. You won't remember that you gave back the same amount across 20 small, forgettable losses.</p>
<p>A trading journal surfaces the patterns your memory hides. Common discoveries traders make after journaling for 2–3 months:</p>
<ul>
  <li>Their win rate on Mondays is 10% below their weekly average</li>
  <li>One specific setup (e.g. breakout retest) accounts for 80% of their profits</li>
  <li>They consistently underperform when trading more than 3 instruments simultaneously</li>
  <li>Their worst trades almost always happen in the last hour of the session</li>
</ul>
<p>None of these patterns are visible in real-time. They only emerge from data — and your journal creates that data.</p>

<h2 id="risk-management">2. Improves Risk Management</h2>
<p>Most traders believe they follow their risk rules. Their journal often tells a different story.</p>
<p>When you track position size, stop loss distance, and actual risk per trade over hundreds of trades, you start to see the reality: do you actually risk 1% per trade, or does it creep up to 2–3% on "high conviction" setups? Do you move your stop loss when a trade goes against you?</p>
<p>The journal creates accountability. It's hard to pretend you follow your rules when you can see in black and white that you don't.</p>

<h2 id="psychology">3. Builds Psychological Awareness</h2>
<p>Trading psychology is discussed constantly but rarely measured. A trading journal lets you actually measure it.</p>
<p>When you log your emotional state alongside each trade — calm, anxious, stressed, overconfident — you can then correlate it with your results. The data often shows that your win rate when "calm" is dramatically higher than when "anxious" or "revenge-trading."</p>
<p>Once you see that correlation clearly, you have a concrete reason to step away from the screen when you're not in the right headspace. It's no longer a vague feeling — it's a data-backed rule.</p>

<h2 id="accountability">4. Creates Accountability</h2>
<p>A trading journal is an honest mirror. It doesn't lie to protect your ego. If you broke your rules three times this week, it will show three rule breaks. If your "gut feel" trades consistently lose money, the data will say so.</p>
<p>This accountability is uncomfortable at first, but it's exactly what drives improvement. You can't fix what you can't see.</p>

<h2 id="strategy-refinement">5. Helps You Refine Your Strategy</h2>
<p>Most traders run their strategy on gut feel — they know roughly which setups they trade, but they don't know the actual statistics. With a journal, you can answer questions like:</p>
<ul>
  <li>What is my real win rate on this setup (not the backtested one)?</li>
  <li>What is my actual average risk/reward ratio in live trading?</li>
  <li>Which entry trigger has the highest expectancy?</li>
  <li>Should I be taking fewer, higher-quality trades or more frequent ones?</li>
</ul>
<p>These are the questions that separate developing traders from consistently profitable ones.</p>

<h2 id="how-long">How Long Before You See Results?</h2>
<p>Most traders who journal consistently start noticing meaningful patterns after 30–50 trades. After 3 months of consistent journaling, the improvements in discipline and self-awareness are typically significant.</p>
<p>The key word is <em>consistent</em>. Journaling two weeks then stopping gives you nothing. Journaling every single trade, reviewing weekly, and acting on what you find — that's what creates the improvement.</p>

<h2 id="start">Start Tracking Your Performance Today</h2>
<p>Bull &amp; Bear is designed to make consistent journaling as easy as possible. Import your trades from cTrader or MetaTrader, get automatic performance statistics, and keep a daily psychological journal — all in one place.</p>
<p><a href="/auth/signup">Start your free 14-day trial</a> — no credit card required. Your future trading self will thank you.</p>
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
