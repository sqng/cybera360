# Documentation for Note REST app

This REST app is based on the open source framework [Strapi](https://strapi.io/documentation/v3.x/getting-started/introduction.html).
Database used is MongoDB and Redis is used for caching of selected queries.
This app can be run on Docker in either development or test mode.

## Docker 

### Development

    > docker-compose up -d

This will start all containers in detached mode. Note that initial run may take **more than 10 minutes** for the dependencies installation. Check logs via `docker-compose logs --tail=all` When you see the following on the logs then server is ready.

![] (images/ready.png)

With the default configuration, the endpoint can be accessed through (example to get all tags):
```bash
curl -X GET "http://127.0.0.1:1337/v1/tags" -H  "accept: application/json"

You can execute external tests on this endpoint while this container is running.

When in development mode, container will restart automatically when there are changes made in the directory. Data is persisted through docker volume, as specified in the `docker-compose.yml`

To bring down the containers, use `docker-compose down` 

### Run all tests

    > docker-compose -f docker-compose.yml -f docker-compose.test.yml up

This will run all the units tests, displaying result and code coverage information in the console. Container will exit once test run is complete.

![](images/unittest.png)


## Configuration
The `./app/.env` file specifies the host IP address and port number this application will listen to. **Note:** Remember to update the port in `docker-compose.yaml` accordingly if this is changed.

This file also contains the 2 endpoints used for this application: random user and random joke. This can be changed easily if needed.

    HOST=0.0.0.0
    PORT=1337
    URL_NOTE_JOKE=https://api.icndb.com/jokes/random?firstName={first}&lastName={last}
    URL_NOTE_USER=https://randomuser.me/api/?inc=name&nat=us

Environment specific (e.g. development or test) configuration can be found under `./app/config/{env}/.env`where {env} correspond to the environment variable `NODE_ENV`.

## File Structure

The following structure explains the key files for this project. Generated files/folders (e.g. build, cache, node_modules, coverage) are not shown here.

 `/app`:
	

 - `/api`: 
    - `/note`: contains routes, controller, model and service codes
     - `/tags`: contains routes, controller, model and service codes
 - `/config`:
   - `/env/test/database.js`: contains test specific config
   - `/database.js`: database connection config
   - `/hook.js`: redis connection config and hook setting
 - `/hooks/redis/index.js`: redis cache implementation code
 - `/tests`: 
   - `/helper/strapi.js`:   strapi framework related startup code
    - `/app.test.js`:   main unit test class
 - `.env`: as explained in previous section
  - `package.json`: npm project dependencies 

 `/.env`: environment variables for docker
 `/docker-compose.yml`: main docker compose file 
 `/docker-compose-test.yml`: additional settings for test environment



