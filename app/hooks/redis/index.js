module.exports = strapi => {
    const mongoose = require("mongoose");
    const redis = require("redis");
    const util = require("util");

    let client;

    const hook = {
      /**
       * Default options
       */
  
      defaults: {
        // config object
        host : strapi.config.hook.settings.redis.host, 
        port : strapi.config.hook.settings.redis.port, 

      },
  
      /**
       * Initialize the hook
       */
  
      async initialize() {

        client = redis.createClient({
            host: this.defaults.host,
            port: this.defaults.port
          });
        client.FLUSHALL();


        client.get = util.promisify(client.get);
        const exec = mongoose.Query.prototype.exec;

        // create new cache function on prototype
        mongoose.Query.prototype.cache = function(options = { expire: 600 }) {
            this.useCache = true;
            this.expire = options.expire; //seconds
            this.hashKey = JSON.stringify(options.key || this.mongooseCollection.name);
        
            return this;
        }

        // override exec function to first check cache for data
        mongoose.Query.prototype.exec = async function() {
            if (!this.useCache) {
                return await exec.apply(this, arguments);
            }
            const key = JSON.stringify({
                ...this.getQuery()
            });
            
            const cacheValue = await client.get(key);

            if (cacheValue && JSON.parse(cacheValue).length>0) {
                const doc = JSON.parse(cacheValue);
                //console.log("Response from Redis");
                
                return Array.isArray(doc)
                ? doc.map(d => new this.model(d))
                : new this.model(doc);
            }

            const result = await exec.apply(this, arguments);
            await client.set(key, JSON.stringify(result));

            //console.log("Response from MongoDB");
            
            return result;
        };
      },
      async beforeInitialize() {
        
      },
      /**
       * return client
       */
      getClient(){
        return client;
      }
    };
  
    return hook;
  };