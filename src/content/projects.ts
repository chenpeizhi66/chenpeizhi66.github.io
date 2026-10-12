export type Project = {
  id: string;
  title: string;
  year?: string;
  context: string;
  summary: string;
  technologies: string[];
  url?: string;
  /** Shown in the Projects section. Other entries stay available to the walk. */
  listed?: boolean;
};

export const projects: Project[] = [
  {
    id: 'leg',
    title: 'Quadruped leg path planning',
    year: '2021',
    context: 'Mechanical Design I',
    summary:
      'Course project. I compared an existing leg mechanism, tried an Assur-group replacement, sized the design graphically and analytically, and checked the forces.',
    technologies: ['MATLAB'],
    url: 'https://github.com/chenpeizhi66/Path-planning-of-quadruped-robot-s-leg',
  },
  {
    id: 'steering',
    title: 'Steering system for Baja',
    year: '2021',
    context: 'DUT Baja team',
    summary:
      'Modeled a steering system in Adams, simulated Ackermann geometry, plotted Ackermann and camber curves, used Adams Insight on the design, then did solid modeling and a strength check.',
    technologies: ['Adams'],
    url: 'https://github.com/chenpeizhi66/Use-CAE-software-analysis-to-optimize-the-design-of-steering-system',
    listed: true,
  },
  {
    id: 'point-cloud',
    title: '3D point cloud processing',
    context: 'Carnegie Mellon University',
    summary:
      'Localized window frames in a warehouse LiDAR scan, about 85% detection accuracy, using RANSAC, DBSCAN, and PointNet++.',
    technologies: ['LiDAR', 'RANSAC', 'DBSCAN', 'PointNet++'],
    listed: true,
  },
  {
    id: 'reducer',
    title: 'Two-stage reducer',
    year: '2021',
    context: 'Mechanical Design II',
    summary:
      'Course design with CAD drawings, an Inventor 3D model, MATLAB gear-strength checks, and Ansys finite-element analysis of a gear.',
    technologies: ['CAD', 'Inventor', 'MATLAB', 'Ansys'],
    url: 'https://github.com/chenpeizhi66/Two-stage-reducer-design',
  },
  {
    id: 'webserver',
    title: 'HTTP server',
    context: 'C++',
    summary:
      'A C++ HTTP server with an epoll loop, request and response handling, a buffer, a thread pool, and timers.',
    technologies: ['C++', 'Linux'],
    url: 'https://github.com/chenpeizhi66/webserver',
  },
  {
    id: 'monitor',
    title: 'Distributed Linux Monitor',
    context: 'C++17',
    summary:
      'A CMake project split into an RPC manager, protocol files, a display monitor, tests, and Docker files.',
    technologies: ['C++', 'CMake', 'Docker'],
    url: 'https://github.com/chenpeizhi66/Distributed-Linux-Monitor',
  },
  {
    id: 'opencv',
    title: 'OpenCV notes',
    context: 'C++',
    summary: 'Exercises from learning OpenCV in C++.',
    technologies: ['C++', 'OpenCV'],
    url: 'https://github.com/chenpeizhi66/C-openCV',
  },
  {
    id: 'django',
    title: 'Django blog',
    context: 'Python',
    summary: 'A Django project with blog and user apps.',
    technologies: ['Python', 'Django'],
    url: 'https://github.com/chenpeizhi66/Django-Blog',
  },
];

export const listedProjects = projects.filter((project) => project.listed);

export function projectsByIds(ids: readonly string[]): Project[] {
  return ids.flatMap((id) => {
    const project = projects.find((item) => item.id === id);
    return project ? [project] : [];
  });
}
