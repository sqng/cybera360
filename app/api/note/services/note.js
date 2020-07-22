'use strict';

const axios = require('axios');

module.exports = {

    /** 
   * Return Joke text by calling out Random user and Joke endpoint
   */
    async getFunnyJokeText(ctx) {
        const RANDOM_NAME_ENDPOINT = 'https://randomuser.me/api/?inc=name&nat=us';
        const JOKE_ENDPOINT = 'https://api.icndb.com/jokes/random?firstName={first}&lastName={last}';

        let response = await axios.get(RANDOM_NAME_ENDPOINT);

        if (response.status == 200) {
            let json = response.data;
            let first = json["results"][0]["name"].first;
            let last = json["results"][0]["name"].last;
            let url = JOKE_ENDPOINT
                .replace('{first}', first)
                .replace('{last}', last);

            response = await axios.get(url);
            if (response.status == 200) {
                let json = response.data;
                return json["value"]["joke"];
            }
            else {
                ctx.failedDependency("Random Joke endpoint failed");
            }
        }
        else {
            ctx.failedDependency("Random Name endpoint failed");
        }
    },

    /** 
   * Helper method to create Note not found (404) response
   */
    handleNote404(ctx) {
        let resp = {}
        let requestedId = ctx.params.autoid;

        resp.message = 'Note with ID ' + requestedId + ' not found';
        resp.id = requestedId;
        ctx.set('Content-Type', "application/json; charset=utf-8");
        ctx.status = 404;
        ctx.body = JSON.stringify(resp);
    },

    async createNote(ctx) {
        return this.retryPromise(function () { return strapi.services.note.create(ctx.request.body) });
    },

    /** 
   * Helper method to retry promise
   */
    retryPromise(fn, retriesLeft = 50, interval = 20) {
        return new Promise((resolve, reject) => {
            return fn()
                .then(resolve)
                .catch((error) => {
                    if (retriesLeft === 1) {
                        reject(error);
                        return;
                    }

                    setTimeout(() => {
                        this.retryPromise(fn, retriesLeft - 1, interval + 10).then(resolve, reject);
                    }, interval)
                })
        })
    },


    /**
    * Helper method to update two-way references of note<->tag
    * 
    * @return {Object}
    */
    async updateNoteWithTags(note, newTagNames) {
        return await this.retryPromise(async function () {
            //if new tags are empty, then just update note with tags = null 
            if (!newTagNames) {
                return await strapi.services.note.update({ id: note.id }, { tags: null });;
            }
            let updatedNoteTagIds = [];

            //query for existing tag ids
            const existingTags = await strapi.query('tags').model.find({ name: newTagNames }).cache();
            updatedNoteTagIds = [...existingTags.map(existingTag => existingTag.id)];

            //get tags to create
            const tagsToCreate = newTagNames.filter(newTagName => !existingTags.map(t => t.name).includes(newTagName));

            //handle creation of new tags
            if (tagsToCreate.length > 0) {
                await Promise.all(
                    tagsToCreate.map(async newTagName => {
                        let newTag = await strapi.services.tags.create({ name: newTagName });
                        updatedNoteTagIds.push(newTag.id);
                    })
                );
            }
            //update note with tags
            return await strapi.services.note.update({ id: note.id }, { tags: updatedNoteTagIds });
        });
        
    },

    /**
     * Helper method to make a simple note object for API reponse
     *
     * @return {Object}
     */
    makeNoteResponse(record) {
        const note = {};
        if (record) {
            note.id = record.autoid;
            note.content = record.content;
            if (record.tags) {
                note.tags = record.tags.map(t => t.name);
            }

        }
        return note;
    },

    /**
     *  Helper method to parse tags
     *  - clone and remove tags from request first
     *  - handle tags separately
     */
    parseTags(ctx) {
        let tags = null;
        if (ctx.request.body.tags && Array.isArray(ctx.request.body.tags)) {
            tags = [...ctx.request.body.tags];
            delete ctx.request.body.tags;
        }
        return tags;
    },

};
