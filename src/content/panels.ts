import { projectsByIds } from './projects.ts';
import { industry, research } from './resume.ts';

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

const baja = projectsByIds(['steering']);
const pointCloud = projectsByIds(['point-cloud']);

function linksFrom(items: { title: string; url?: string }[]): PanelLink[] {
  return items.flatMap((item) => (item.url ? [{ label: item.title, url: item.url }] : []));
}

export const panels: Panel[] = [
  {
    id: 'dalian',
    category: 'Education',
    title: 'Dalian University of Technology',
    dates: 'B.Eng., Mechanical Engineering, 2018–2022',
    summary: 'Bachelor’s degree in mechanical engineering, GPA 3.8/4.0, and the DUT Baja team.',
    details: [
      'Bachelor in Mechanical Engineering at Dalian University of Technology, September 2018–June 2022. GPA 3.8/4.0.',
      ...baja.map((project) => `${project.title}. ${project.summary}`),
    ],
    technologies: [...new Set(baja.flatMap((project) => project.technologies))],
    links: linksFrom(baja),
  },
  {
    id: 'nio',
    category: 'Industry',
    title: 'NIO',
    dates: 'Shenzhen · Mar 2024–present',
    summary: 'Software engineer on the chip middleware team.',
    details: industry.map((item) => `${item.title}. ${item.summary}`),
    technologies: [...new Set(industry.flatMap((item) => item.technologies))],
    links: linksFrom(industry),
  },
  {
    id: 'cmu',
    category: 'Education',
    title: 'Carnegie Mellon University',
    dates: 'MSc, Computational Design and Manufacturing, 2022–2024',
    summary: 'Graduate study in Pittsburgh, GPA 3.7/4.0.',
    details: [
      'MSc in Computational Design and Manufacturing at Carnegie Mellon University, August 2022–February 2024. GPA 3.7/4.0.',
      ...research.map((item) => `${item.title}. ${item.summary}`),
      ...pointCloud.map((project) => `${project.title}. ${project.summary}`),
    ],
    technologies: [
      ...new Set([
        ...research.flatMap((item) => item.technologies),
        ...pointCloud.flatMap((project) => project.technologies),
      ]),
    ],
    links: linksFrom([...research, ...pointCloud]),
  },
  {
    id: 'software',
    category: 'Projects',
    title: 'Projects',
    summary: 'The Baja steering system and warehouse LiDAR perception.',
    details: [...baja, ...pointCloud].map((project) => `${project.title}. ${project.summary}`),
    technologies: [...new Set([...baja, ...pointCloud].flatMap((project) => project.technologies))],
    links: linksFrom([...baja, ...pointCloud]),
  },
];

export function getPanel(id: string): Panel | undefined {
  return panels.find((panel) => panel.id === id);
}
