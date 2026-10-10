const COUNTER = 'https://tally.yuki.sh/hits/github@chenpeizhi66/portfolio.json';
const SESSION_KEY = 'peizhi-portfolio-visit-counted';

type Count = {
  visit: number;
  visitor: number;
};

function people(count: number): string {
  return count === 1 ? '1 person has opened this page.' : `${count.toLocaleString('en-US')} people have opened this page.`;
}

function views(count: number): string {
  return count === 1 ? '1 page view.' : `${count.toLocaleString('en-US')} page views.`;
}

export async function loadVisitors(target: HTMLElement): Promise<void> {
  let alreadyCounted = false;
  try {
    alreadyCounted = sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    alreadyCounted = false;
  }

  const url = alreadyCounted ? `${COUNTER}?mode=read` : COUNTER;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Counter responded ${response.status}`);
    const data = (await response.json()) as Partial<Count>;
    if (typeof data.visit !== 'number' || typeof data.visitor !== 'number') {
      throw new Error('Counter payload was not a count.');
    }
    if (!alreadyCounted) {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // Private browsing can block storage. The count itself still succeeded.
      }
    }

    const peopleLine = document.createElement('p');
    peopleLine.className = 'visitor-total';
    peopleLine.textContent = people(data.visitor);
    const viewLine = document.createElement('p');
    viewLine.textContent = views(data.visit);
    const note = document.createElement('p');
    note.className = 'visitor-note';
    note.textContent =
      'Unique visitors are distinct IP addresses. The number is kept by tally.yuki.sh because this site is a static page.';
    target.replaceChildren(peopleLine, viewLine, note);
  } catch {
    target.replaceChildren();
    const message = document.createElement('p');
    message.textContent = 'The visitor count is unavailable right now.';
    target.append(message);
  }
}
