const TALLY = 'https://tally.yuki.sh/hits/github@chenpeizhi66/portfolio.json';
const ABACUS_HIT = 'https://abacus.jasoncameron.dev/hit/chenpeizhi66.github.io/home';
const ABACUS_GET = 'https://abacus.jasoncameron.dev/get/chenpeizhi66.github.io/home';
const TALLY_SESSION = 'peizhi-portfolio-visit-counted';
const ABACUS_SESSION = 'peizhi-portfolio-abacus-counted';

type Count = {
  visit: number;
  visitor: number;
};

function remembered(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function remember(key: string): void {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Private browsing can block storage. The count itself still succeeded.
  }
}

async function fetchJson(url: string, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Counter responded ${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

async function loadTally(): Promise<Count> {
  const url = remembered(TALLY_SESSION) ? `${TALLY}?mode=read` : TALLY;
  const data = (await fetchJson(url, 4000)) as Partial<Count>;
  if (typeof data.visit !== 'number' || typeof data.visitor !== 'number') {
    throw new Error('Counter payload was not a count.');
  }
  remember(TALLY_SESSION);
  return { visit: data.visit, visitor: data.visitor };
}

async function loadAbacus(): Promise<number> {
  const url = remembered(ABACUS_SESSION) ? ABACUS_GET : ABACUS_HIT;
  const data = (await fetchJson(url, 4000)) as { value?: unknown };
  if (typeof data.value !== 'number') throw new Error('Backup counter payload was not a count.');
  remember(ABACUS_SESSION);
  return data.value;
}

function people(count: number): string {
  return count === 1 ? '1 person has opened this page.' : `${count.toLocaleString('en-US')} people have opened this page.`;
}

function views(count: number): string {
  return count === 1 ? '1 page view.' : `${count.toLocaleString('en-US')} page views.`;
}

function show(target: HTMLElement, lines: string[]): void {
  target.replaceChildren();
  for (const [index, line] of lines.entries()) {
    const paragraph = document.createElement('p');
    if (index === 0) paragraph.className = 'visitor-total';
    paragraph.textContent = line;
    target.append(paragraph);
  }
}

export async function loadVisitors(target: HTMLElement): Promise<void> {
  try {
    const tally = await loadTally();
    show(target, [people(tally.visitor), views(tally.visit)]);
    return;
  } catch {
    // The primary counter is blocked or down. Try the backup before giving up.
  }

  try {
    const pageViews = await loadAbacus();
    show(target, [views(pageViews)]);
  } catch {
    target.replaceChildren();
    const message = document.createElement('p');
    message.textContent = 'The visitor count is unavailable right now.';
    target.append(message);
  }
}
