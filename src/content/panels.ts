export type PanelLink = {
  label: string;
  url: string;
};

export type Panel = {
  id: string;
  category: string;
  title: string;
  dates?: string;
  summary: string;
  details: string[];
  technologies?: string[];
  links: PanelLink[];
};

export const panels: Panel[] = [
  {
    id: 'dalian',
    category: 'Place',
    title: 'Dalian',
    summary: 'My birthplace, and the place I have lived the longest.',
    details: [
      'The sea wraps three sides of the city. The coast is beautiful, and it is a good place to travel or to settle.',
    ],
    links: [],
  },
  {
    id: 'pittsburgh',
    category: 'Place',
    title: 'Pittsburgh',
    summary: 'I spent two years here as a graduate student.',
    details: ['The surroundings are beautiful, and the people are friendly.'],
    links: [],
  },
  {
    id: 'shenzhen',
    category: 'Place',
    title: 'Shenzhen',
    summary: 'I have worked in this city for two years.',
    details: ['Daily life is convenient, and the pace is fast.'],
    links: [],
  },
];

export function getPanel(id: string): Panel | undefined {
  return panels.find((panel) => panel.id === id);
}
