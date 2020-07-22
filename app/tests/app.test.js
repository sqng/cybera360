const fs = require('fs');
const { setupStrapi } = require('./helpers/strapi');

const request = require('supertest');


let app; // this is instance of the the strapi

/** this code is called once before any test is called */
beforeAll(async done => {
  app = await setupStrapi(); 
  done();
});

/** this code is called once before all the tested are finished */
afterAll(async done => {
  const dbSettings = strapi.config.get('database.connections.default.settings');

  //delete test database after all tests
  if (dbSettings && dbSettings.filename) {
    const tmpDbFile = `${__dirname}/../${dbSettings.filename}`;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
  //remove data from TEST database
  if (dbSettings && dbSettings.database && dbSettings.database.indexOf('TEST') > 0){
    await strapi.query('note').model.deleteMany({  autoid: { $gte: 0 } });    
    await strapi.query('tags').model.deleteMany({  name: {$ne : null} });
    await strapi.hook.redis.getClient().FLUSHALL();
  }
  done();
});


it('app is defined', async done => {
  expect(app).toBeDefined();
  done();
});


//tags releated
describe('tags releated', () => {

  beforeAll( async () => {
    await strapi.query('tags').model.deleteMany({  name: {$ne : null} });
    await prepareNote("Note 1", ["tag1"]);
    await prepareNote("Note 2", ["tag1"]);
    await prepareNote("Note 3", ["tag1"]);
    await prepareNote("Other note", ["tag1", "Other tag"]);
  });
  //get all notes for a tag
  it('get all notes for a tag',  function(done) {   
  
    request(app.server)
      .get('/v1/note/tag/tag1')      
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.length).toBe(4);
        
        done();
      });
  });

  //get all tags
  it('get all tags',  function(done) {
  
    request(app.server)
      .get('/v1/tags')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        //console.log(res.body);
        expect(res.body.length).toBe(2);
        done();
      });
  });

});


describe('Create, get, delete notes', () => {
  //creates a note with 200
  it('creates a note with 200', function(done) {
    request(app.server)
      .post('/v1/note')
      .send({content: 'test note', tags: ['tag1']})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  //creates a funny note with 200
  it('creates a funny note with 200', function(done) {
    request(app.server)
      .post('/v1/note/funny')    
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  //get a note with 200
  it('get a note with 200', async function(done) {
    let existingNote = await prepareNote();
        request(app.server)
        .get('/v1/note/'+existingNote.id)    
        .set('Accept', 'application/json')    
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });

   //get all notes with 200
  it('get all notes with 200', async function(done) {    
        request(app.server)
        .get('/v1/note/')    
        .set('Accept', 'application/json')    
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });

  //delete all notes with 204
  it('delete all notes with 204', function(done) {
    request(app.server)
      .delete('/v1/note')    
      .set('Accept', 'application/json')    
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  //get a (missing) note with 404
  it('get a (missing) note with 404', function(done) {
    request(app.server)
      .get('/v1/note/999')    
      .set('Accept', 'application/json')    
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  //edit a (missing) note with 404
  it('edit a (missing) note with 404', function(done) {
    request(app.server)
      .put('/v1/note/999')    
      .set('Accept', 'application/json')    
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
//update and delete a note
describe('update and delete a note', () => {

  let existingNote;
  beforeAll( async () => existingNote= await prepareNote());
  //update a note
  it('updates existing note with 200',  function(done) {   
  
    request(app.server)
      .put('/v1/note/'+existingNote.id)
      .send({content: 'modified note'})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.content).toBe('modified note');
        done();
      });
  });
  //delete a note
  it('delete existing Note with 204',  function(done) {
  
    request(app.server)
      .delete('/v1/note/'+existingNote.id)
      .set('Accept', 'application/json')
      .expect(204)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

});

//helper function to prepare note
async function prepareNote(content = "New note", tags = ["New Tag"]){
  let ctx = {};
  ctx.request = {};
  ctx.request.body = { content , tags };
  return await strapi.controllers.note.newNote(ctx);
}