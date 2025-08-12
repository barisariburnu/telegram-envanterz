/**
 * PM2 Ecosystem Configuration
 * This file is used to configure PM2 for running the bot as a service
 * 
 * To use this file:
 * 1. Install PM2 globally: npm install -g pm2
 * 2. Start the bot: pm2 start ecosystem.config.js
 * 3. Save the PM2 configuration: pm2 save
 * 4. Set up PM2 to start on system boot: pm2 startup
 */

module.exports = {
  apps: [{
    name: 'telegram-inventory-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
    },
    env_development: {
      NODE_ENV: 'development',
      WATCH: true
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: 'logs/error.log',
    out_file: 'logs/output.log',
    merge_logs: true,
  }]
};