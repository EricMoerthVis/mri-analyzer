module.exports = {
  baseUrl: '/mri-analyzer',
  work: './build-tmp',
  examples: [],
  config: {
    title: 'mri analyzer',
    description: '"MRI analyzer for the web"',
    subtitle: '"Enable medical imaging to the Web."',
    author: 'Visgroup Eric Moerth',
    timezone: 'UTC',
    url: 'https://vis.uib.no/',
    root: '',
    github: 'EricMoerthUiB/mri-analyzer',
    google_analytics: 'UA-90338862-7',
  },
  copy: [
    { src: '../dist/*', dest: './build-tmp/public/app' },
  ],
};
