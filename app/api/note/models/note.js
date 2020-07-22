'use strict';

module.exports = {
  /**
   * Triggered before note creation.
   */
  lifecycles: {
    async beforeCreate(data) {
/*
        const result = await strapi.query('counter').findOne({ name: 'noteid' });
        let nextSeq = 1;
        if (result == null){
            strapi.query('counter').create(
                { name: 'noteid' , seq: nextSeq }
            );
        }
        else{
            nextSeq  = parseInt(result.seq) + 1;
            strapi.query('counter').update(
                { name: 'noteid' },
                { seq: nextSeq }
            );
        }
        */
       let nextSeq = Math.abs(Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER) | 0));
        data.autoid = nextSeq;
    },
  },


};
