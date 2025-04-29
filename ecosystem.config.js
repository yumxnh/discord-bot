module.exports = {
    apps : [{
      name: "Discord Bot",
      script: "./main.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '3G',
    }],
  };
  