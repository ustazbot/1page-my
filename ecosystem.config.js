module.exports = {
  apps: [
    {
      name: '1page-my',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/1page-my',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/1page-my-error.log',
      out_file: '/var/log/pm2/1page-my-out.log',
    },
  ],
}
