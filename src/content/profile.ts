export type Link = {
  label: string;
  url: string;
};

export const profile = {
  name: 'Peizhi Chen',
  nameZh: '陳培之',
  pronouns: 'he/him',
  headline: 'Perception, robotics software, and chip middleware.',
  paragraphs: [
    'I am a software engineer at NIO in Shenzhen. I earned an MSc in Computational Design and Manufacturing at Carnegie Mellon University (2022–2024) and a bachelor’s degree in Mechanical Engineering at Dalian University of Technology (2018–2022).',
    'I like photography, music, and traveling.',
  ],
  email: 'chenpeizhi66@gmail.com',
  skills: [
    'C/C++17',
    'Python',
    'MATLAB',
    'PyTorch',
    'CUDA',
    'NumPy',
    'SciPy',
    'TensorFlow',
    'Git',
    'LaTeX',
    'OpenCV',
    'PCL',
    'Linux',
    'ROS 2',
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
      url: '/assets/peizhi-chen-cv.pdf',
    },
    { label: 'Instagram', url: 'https://www.instagram.com/pez_chen/' },
    { label: 'CSDN', url: 'https://blog.csdn.net/chenpeizhi' },
  ] satisfies Link[],
};

export const education = [
  {
    when: '2022–2024',
    title: 'MSc, Computational Design and Manufacturing',
    place: 'Carnegie Mellon University',
    summary: 'Pittsburgh. GPA 3.7/4.0.',
  },
  {
    when: '2018–2022',
    title: 'Bachelor, Mechanical Engineering',
    place: 'Dalian University of Technology',
    summary: 'Dalian. GPA 3.8/4.0.',
  },
];
