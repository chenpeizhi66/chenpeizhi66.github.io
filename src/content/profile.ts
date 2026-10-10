export type Link = {
  label: string;
  url: string;
};

export const profile = {
  name: 'Peizhi Chen',
  nameZh: '陳培之',
  pronouns: 'he/him',
  headline: 'Mechanical engineering, computer vision, and software.',
  paragraphs: [
    'I studied at Dalian University of Technology (B.S., 2022) and in the School of Mechanical Engineering at Carnegie Mellon University (M.S., 2024). At CMU I have been advised by Prof. Kenji Shimada in CERLAB.',
    'I am interested in computer vision, machine learning, and software development, and I am currently learning Kratos. I also like photography, music, and traveling.',
  ],
  email: 'chenpeizhi66@gmail.com',
  skills: [
    'Python',
    'C/C++',
    'Java',
    'JavaScript',
    'TypeScript',
    'HTML & CSS',
    'MATLAB',
    'PyTorch',
    'NumPy',
    'SciPy',
    'TensorBoard',
    'Git',
    'LaTeX',
    'Node.js',
    'OpenGL',
    'OpenCV',
    'Open3D',
    'PCL',
    'AWS',
    'Linux',
    'ROS',
    'Bash',
    'Conda',
    'Vim',
    'Docker',
  ],
  links: [
    { label: 'Email', url: 'mailto:chenpeizhi66@gmail.com' },
    { label: 'GitHub', url: 'https://github.com/chenpeizhi66' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/peizhi-chen/' },
    {
      label: 'CV (PDF)',
      url: 'https://chenpeizhi66.github.io/peizhichen.github.io/assets/peizhic.pdf',
    },
    { label: 'Instagram', url: 'https://www.instagram.com/pez_chen/' },
    { label: 'CSDN', url: 'https://blog.csdn.net/chenpeizhi' },
  ] satisfies Link[],
};

export const education = [
  {
    when: '2024',
    title: 'M.S., Mechanical Engineering',
    place: 'Carnegie Mellon University',
    summary: 'School of Mechanical Engineering. Advised by Prof. Kenji Shimada in CERLAB.',
  },
  {
    when: '2022',
    title: 'B.S.',
    place: 'Dalian University of Technology',
    summary: 'Mechanical design coursework and the DUT Baja team.',
  },
];

export const work = [
  {
    when: 'Summer 2021',
    title: 'Engineer assistant, intern',
    place: 'CRRC, China',
    summary: 'The duty recorded for this internship is basic machining.',
  },
];
