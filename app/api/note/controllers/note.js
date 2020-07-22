'use strict';

const { sanitizeEntity } = require('strapi-utils');


module.exports = {
  /**
   * Retrieve a record.
   *
   * @return {Object}
   */
  async findOne(ctx) {
    const query = { autoid : ctx.params.autoid} 
    const entity = await strapi.services.note.findOne( query );
    if (!entity){
      strapi.services.note.handleNote404(ctx);
      return;
    }
    return strapi.services.note.makeNoteResponse(sanitizeEntity(entity, { model: strapi.models.note }));
    
  },

  /**
   * Retrieve all records.
   *
   * @return [{Object}]
   */
  async find(ctx) {
    const entities = await strapi.services.note.find(
       { autoid : ctx.params.autoid, _limit : 10000} );
    
    return entities.map(entity => {
      const record = sanitizeEntity(entity, {
        model: strapi.models.note,
      });        
      return strapi.services.note.makeNoteResponse(record);
    });
  },

  /**
   * Retrieve all records with the same tag
   *
   * @return [{Object}]
   */
  async findByTag(ctx) {    
    const entities = await strapi.services.note.find({ "tags.name" : ctx.params.tag});
    
    return entities.map(entity => {
      const record = sanitizeEntity(entity, {
        model: strapi.models.note,
      });        
      return strapi.services.note.makeNoteResponse(record);
    });
  },

  /**
   * Delete all notes
   *
   */
  async deleteAll(ctx){    
    await strapi.query('note').model.deleteMany({  autoid: { $gte: 0 } });
    await strapi.query('tags').model.deleteMany({  name: {$ne : null} });    
    await strapi.hook.redis.getClient().FLUSHALL();
    ctx.status=204;    
    return [];

  },

  /**
   * Delete one note
   *
   */
  async delete(ctx){
    await strapi.services.note.delete({ autoid : ctx.params.autoid} );
    ctx.status=204;    
    return [];

  },

  /**
   * Create a note
   * 
   * @return {Object}
   */
  async newNote(ctx){
    const tags = strapi.services.note.parseTags(ctx);

    let entity = await strapi.services.note.createNote(ctx);   
    entity = await strapi.services.note.updateNoteWithTags(entity, tags);

    return strapi.services.note.makeNoteResponse(entity);
  },

  /**
   * Update a note
   * 
   * @return {Object}
   */
  async editNote(ctx){    
    const tags = strapi.services.note.parseTags(ctx);
    let entity = await strapi.services.note.findOne( { autoid : ctx.params.autoid}  );
    if (!entity){
      strapi.services.note.handleNote404(ctx);
      return;
    }
    
    entity = await strapi.services.note.update( { id : entity.id} ,  ctx.request.body);
    
    entity = await strapi.services.note.updateNoteWithTags(entity, tags);
    
    return strapi.services.note.makeNoteResponse(entity);
  },
  
  /** 
   * Create a funny note
   */
  async newFunnyNote(ctx){
    
    let jokeText = await strapi.services.note.getFunnyJokeText(ctx);
    ctx.request.body.content =  jokeText;
    ctx.request.body.tags = ["funny"];
    return this.newNote(ctx);
  }

};
