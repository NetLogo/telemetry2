# telemetry2

## What is it?

Our server for receiving telemetry data from the NetLogo desktop application.  This is the second attempt at said functionality.  Using Matomo was our first.

This is intended as a stopgap, after abandoning Matomo.  We're likely to replace it with something else later.

This system was originally designed to expect the data over HTTP/2, but ultimately shifted to focus on HTTP/1.1.

## Setting up

### Localhost HTTPS

The server only accepts traffic over HTTPS.  To generate a localhost-only certificate for that, run this command:

```sh
openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -keyout key.pem -out cert.pem \
  -subj "/CN=localhost"
```

Then, use this command to import it into your Java keytool, so that NetLogo will accept the certificate:

```sh
keytool -import \
  -trustcacerts \
  -alias localserver \
  -file cert.pem \
  -keystore $JAVA_HOME/lib/security/cacerts \
  -storepass changeit
```

And then change `CERT_PATH` and `KEY_PATH` in `./.env` to point to your certificate files.

### Postgres database

  * [Install Postgres](https://www.postgresql.org/download/)
    * This will serve as the underlying database for storing the uploaded data
    * Version 16.10 is confirmed to work, but in @TheBizzle's experience, Postgres is pretty flexible on version number.
  * Run `psql -f ./sql/schema.sql`
    * Alternative forms, depending on your configuration:
      * `psql -f ./sql/schema.sql -U postgres`
      * `sudo -u postgres psql -f ./sql/schema.sql`
    * Initializes the database schema

### NodeJS

  * [Install NVM](https://github.com/nvm-sh/nvm)
    * Allows you to manage multiple NPM versions, and to install specific versions on demand
  * Run `nvm install 24`
    * Gets you the proper version of NPM for this project

### Building this project

  * Run `npm install`
    * Installs the dependencies for this project
  * Run `npm run lint`
    * Verifies the code's basic correctness and style
  * Initialize the file `.env` to like so:

```
PORT=<the port number that you want to run on; defaults to `3030`>
PG_USERNAME=<your Postgres username>
PG_PASSWORD=<your Postgres password>
PG_HOST_NAME=<the domain name where your Postgres instance can be found; defaults to `localhost`>
PG_DB_NAME=nl_telemetry2
CERT_PATH=<path to your SSL cert; defaults to `cert.pem`>
KEY_PATH=< path to your SSL  key; defaults to  `key.pem`>
```

### Running

  * Run `npm run start`

