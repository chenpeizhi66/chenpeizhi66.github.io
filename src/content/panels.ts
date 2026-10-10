import { projectsByIds } from './projects.ts';

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

const mechanical = projectsByIds(['leg', 'steering', 'reducer']);
const software = projectsByIds(['webserver', 'monitor', 'opencv', 'django']);

export const panels: Panel[] = [
  {
    id: 'dalian',
    category: 'Education',
    title: 'Dalian University of Technology',
    dates: 'B.S., 2022',
    summary: 'Undergraduate study, mechanical design courses, and the DUT Baja team.',
    details: [
      'My bachelor’s degree is from Dalian University of Technology, 2022.',
      ...mechanical.map((project) => `${project.title} (${project.context}). ${project.summary}`),
    ],
    technologies: [...new Set(mechanical.flatMap((project) => project.technologies))],
    links: mechanical.map((project) => ({ label: project.title, url: project.url })),
  },
  {
    id: 'crrc',
    category: 'Internship',
    title: 'Engineer assistant, CRRC',
    dates: 'Summer 2021 · China',
    summary: 'A summer internship. The duty I recorded was basic machining.',
    details: [
      'I interned at CRRC in China in summer 2021 as an engineer assistant.',
      'On my CV, the work listed for this internship is basic machining.',
    ],
    links: [],
  },
  {
    id: 'cmu',
    category: 'Education',
    title: 'Carnegie Mellon University',
    dates: 'M.S., Mechanical Engineering, 2024',
    summary: 'Graduate study advised by Prof. Kenji Shimada in CERLAB.',
    details: [
      'My master’s degree is from the School of Mechanical Engineering at Carnegie Mellon University, 2024.',
      'I have been advised by Prof. Kenji Shimada in CERLAB.',
      'I am interested in computer vision, machine learning, and software development.',
      'I am currently learning Kratos.',
    ],
    links: [
      {
        label: 'Prof. Kenji Shimada',
        url: 'https://www.meche.engineering.cmu.edu/directory/bios/shimada-kenji.html',
      },
      {
        label: 'Mechanical Engineering at CMU',
        url: 'https://www.meche.engineering.cmu.edu/',
      },
    ],
  },
  {
    id: 'software',
    category: 'Projects',
    title: 'Software practice',
    summary: 'Programs I wrote while learning systems, vision, and the web.',
    details: software.map((project) => `${project.title}. ${project.summary}`),
    technologies: [...new Set(software.flatMap((project) => project.technologies))],
    links: software.map((project) => ({ label: project.title, url: project.url })),
  },
];

export function getPanel(id: string): Panel | undefined {
  return panels.find((panel) => panel.id === id);
}
