export type ExperienceItem = {
  title: string;
  meta: string;
  summary: string;
  technologies: string[];
  url?: string;
};

/** Research Experience on the latest CV. The warehouse LiDAR item is shown under Projects. */
export const research: ExperienceItem[] = [
  {
    title: 'UAV autonomous navigation',
    meta: 'Carnegie Mellon University · Pittsburgh',
    summary:
      'Built an RRT planner for UAV navigation with dynamic obstacle avoidance, a perception stack for moving obstacles, and Isaac Sim checks, then validated it on real hardware.',
    technologies: ['RRT', 'YOLO', 'DBSCAN', 'Kalman filter', 'Isaac Sim'],
    url: 'https://github.com/chenpeizhi66/uav-autonomous-navigation',
  },
  {
    title: 'Autonomous navigation for Unitree G1',
    meta: 'Carnegie Mellon University · Pittsburgh',
    summary:
      'Set up a Unitree G1 navigation stack in Isaac Gym with LiDAR SLAM, FAST-LIO2 odometry, and TARE and FAR planners for goal-directed motion around dynamic obstacles.',
    technologies: ['Isaac Gym', 'FAST-LIO2', 'TARE', 'FAR Planner', 'LiDAR'],
    url: 'https://github.com/chenpeizhi66/unitree-g1-navigation',
  },
];

/** Industry Experience on the latest CV. */
export const industry: ExperienceItem[] = [
  {
    title: 'Software engineer, Nxperf',
    meta: 'NIO · Chip Middleware · Shenzhen · Mar 2024–present',
    summary:
      'Built Nxperf, an NPU profiler that traces operator execution down to hardware scheduling, and sped up CVA operators in CUDA by up to 40%.',
    technologies: ['CUDA', 'LTTng', 'C++'],
    url: 'https://github.com/chenpeizhi66/nio-nxperf',
  },
  {
    title: 'Software engineer, RDK',
    meta: 'NIO · Chip Middleware · Shenzhen · Mar 2024–present',
    summary:
      'Built the camera and perception stack in NIO’s Robot Development Kit as ROS 2 nodes, with a gRPC control plane and a vision-language-action model on the same chip.',
    technologies: ['ROS 2', 'gRPC', 'Protobuf', 'C++'],
    url: 'https://github.com/chenpeizhi66/nio-rdk',
  },
];
