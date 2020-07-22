'use strict';

const { sanitizeEntity } = require('strapi-utils');

module.exports = {

    async find(ctx) {
        let entities = await strapi.services.tags.find(ctx.query);        
    
        return entities.map(entity => {
          const tag = sanitizeEntity(entity, {
            model: strapi.models.tags,
          });          
          return tag.name;
        });
      },
};


