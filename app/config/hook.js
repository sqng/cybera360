module.exports  = ({ env }) => ({
  settings: {
    'redis': {
      enabled: true,      
      host: env('REDIS_HOST', 'localhost'),        
      port: env.int('REDIS_PORT', 6379),
    },
  },
});