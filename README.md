# Documentation for Note REST app

This REST app is based on the open source framework [Strapi](https://strapi.io/documentation/v3.x/getting-started/introduction.html).
Database used is MongoDB and Redis is used for caching of selected queries.
This app can be run on Docker in either development or test mode.

## Docker 

### Development

    > docker-compose up -d

This will start all containers in detached mode. Note that initial run may take **more than 10 minutes** for the dependencies installation. Check logs via `docker-compose logs --tail=all` When you see the following on the logs then server is ready.

![enter image description here](https://lh3.googleusercontent.com/8EoyyNMddNXg6ChlISMWacdM3xhrKxXhFlYHrpLHzufPZsFZBV6uX4eRvnLZIAtfqW0-4uelfn2_T2DO57_nd27dfIvsODPEI5KKjn7fLQd5KLs5iAjoSI6jgvCdjunPj_-2SfwzWAgBrXuJqEfDB9YJJx6dtWWjrbFUb--UtjpdFnfbjv2MhEjco47taSrdC174q0jccFsjoQ-4OgpY-P3y0iJp_hoyqshJVdkauMak0EKLAp0bPXqImoOD4f4QNTqxo7ClW6N_eQJJ4ed7civsOB5SbEUg4BBG8KMDDlnisD626OdgDN90DPGjYLzKl6gsWRKrvCjyG8TxK1e8jlqmpPvNyLj0VZCZMtTehNJT0Auxjb4TWlP7eUeTdjK-QUoeRKEmabMmnOQ8idrVrWI_S2Vr-r6087j29n8Tj5AkPJSzofe7twRCDT1TzfhoMLa13GHcyFQP6pFIpmbah-ZrgR1M4SQq8_Vpnz9SUd3h7MqBsF9PUKZSbqVK9tDNZj95ZebD_ZjpDXhD2RFHK6ifXt4BWsQF81Q_WuCd193rMQetNuF3yt8NFVRr9Z1kQU6p-n2qsAR7H5qfNKHtyNcFvooA13X6Q57P3tOzBWkECCcMj1x5qkSQEyCRZxPWoz88QMS3ICnuqTqI-qFB4OKwCCv-YXgYoMxq_-vCkNRmRX2IwBTGyR7WU9jFpQ=w906-h383-no?authuser=0)

When in development mode, container will restart automatically when there are changes made in the directory. Data is persisted through docker volume, as specified in the `docker-compose.yml`

To bring down the containers, use `docker-compose down` 

### Run all tests

    > docker-compose -f docker-compose.yml -f docker-compose.test.yml up

This will run all the units tests, displaying result and code coverage information in the console. Container will exit once test run is complete.

![Console log](https://lh3.googleusercontent.com/XOQhWVvTgcUVa4LJOkKwt9RVpQYBSU7wxt8Ij414JY8uEnEhqZVZtNhGxREKZmnjROKxtEZ8FgQxFtNEGcmCeYve0-NphLZMVjIpF3WUKkmKf8OyPkQw8QMdYmNQEqy2BZe6zB-zkKpJfNOUK1NPexACBPLAqguysxCq01KePDv8JnwthKdeEhuyZ2_8KfWfyytO-9SmtNWsCE5esUpGcZSdhqTZy57uBsGLOol1snpelDr2kPsg1OYbcCiSoO_dRXARyPjTGvtV6tx-QacQ9cyuwO_azk9mBuCWLQbFk8yGJOgOUdqdVaTwtSWJ_EETlyBcKnASAhpztaYHIKSAc6Fczx-5S2WBrN5vhCOn0qOp_YsHQX1IR0wjaY0L3jU1jY3x1VUtdGIJUe07LGJcelr90vrToSh9XpKF05gNMuoUg06qBEmQyYIsESLhsqhApho44-SaOddTYD0-8iXkoXQ1IeXhdHRE0Mw7mGPQ5w2lRYWl5TCcv6wnvoI8h-ruRp_QtizYI_FHWYM2W45EH4ACZyVrG-muEdizz5jbtMMjKJicG7Vc7eEq0AK8-JiervaoahhrSF1gOKqNqsP2zz0C6c_chM81P18FQ2JY74cIUKXMLJ7RIQPb9gQpLkulBA7bMOx1AXxgVROm25Qgh7ivU8VpIeSKV0XFFA0XOwt4oa34RO3JECoQhArqKA=w744-h583-no?authuser=0)


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



