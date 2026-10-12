export type ResumeProject = {
  title: string;
  place: string;
  summary: string;
  technologies: string[];
  url?: string;
};

/** Research entry from the public CV. CERLAB, Pittsburgh. */
export const research = [
  {
    when: 'CERLAB',
    title: 'Distributed Linux performance analysis and monitoring',
    place: 'Pittsburgh, PA',
    summary:
      'Built the monitor with Docker, CMake, gRPC, and protobuf. A factory constructs the monitor interfaces for CPU status, system load, soft interrupts, memory, and network. The gRPC server runs on the machine being watched, and the client library is called by the monitor and display modules. The Qt display uses QWidget, QTableView, QStackedLayout, and QPushButton, with table models refreshed every 3 seconds.',
    url: 'https://github.com/chenpeizhi66/Distributed-Linux-Monitor',
  },
];

/** Project entries from the public CV. Links are included only where a repository exists. */
export const resumeProjects: ResumeProject[] = [
  {
    title: 'Personal blog',
    place: 'Carnegie Mellon University',
    summary:
      'Django blog with a customizable sidebar built from function-based views, including sorting, display toggles, and embedded HTML. Registration, login, and profile editing use custom CSS and Bulma. Deployed on AWS Elastic Beanstalk with an EC2 instance and MySQL.',
    technologies: ['Django', 'CSS', 'Bulma', 'AWS'],
    url: 'https://github.com/chenpeizhi66/Django-Blog',
  },
  {
    title: 'Lightweight web server',
    place: 'Ubuntu 20.04',
    summary:
      'A multi-threaded reactor built with epoll and a thread pool. Regular expressions and a finite-state machine parse HTTP requests. An automatically growing buffer holds the bytes, and a min-heap timer closes idle connections. Stress-tested with webbench.',
    technologies: ['C++', 'Linux', 'epoll'],
    url: 'https://github.com/chenpeizhi66/webserver',
  },
  {
    title: 'Hero breakout',
    place: 'Carnegie Mellon University',
    summary:
      'A third-person shooting game in C++ and OpenGL. Virtual prop types share extensible methods so new props can inherit them.',
    technologies: ['C++', 'OpenGL'],
  },
  {
    title: '3D point cloud processing',
    place: 'Carnegie Mellon University',
    summary:
      'Located window frames in a warehouse lidar scan, with about 85% detection accuracy on the résumé. RANSAC removes the ground, DBSCAN clusters the cloud, and PointNet++ classifies the objects.',
    technologies: ['Point cloud', 'RANSAC', 'DBSCAN', 'PointNet++'],
  },
];
