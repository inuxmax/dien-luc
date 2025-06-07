module.exports = {
  apps: [
    {
      name: 'dien-luc',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      exp_backoff_restart_delay: 100
    }
  ]
}; 
