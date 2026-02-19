# telemetry2

## What is it?

Our server for receiving telemetry data from the NetLogo desktop application.  The main instance of this runs at https://telemetry.netlogo.org.

This is the second attempt at said functionality.  Using Matomo was our first.  This was intended as a stopgap, after abandoning Matomo.  We are likely to replace it with something else later.

This system was originally designed to expect the data over HTTP/2, but ultimately shifted to focus on HTTP/1.1.  HTTP/2 uses vastly less bandwidth, but session management is substantially more difficult there.

## Setting up

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
  * Run `nvm install 24.13.1`
    * Gets you the proper version of NPM for this project

### Building this project

  * Run `npm install`
    * Installs the dependencies for this project
  * Run `npm run lint`
    * Verifies the code's basic correctness and style
  * Initialize the file `.env` to like so:

```env
PORT=<the port number that you want to run on; defaults to `3030`>
POSTGRES_USERNAME=<your Postgres username>
POSTGRES_PASSWORD=<your Postgres password>
PG_HOST_NAME=<the domain name where your Postgres instance can be found; defaults to `localhost`>
PG_DB_NAME=nl_telemetry2
CERT_PATH=<path to your SSL cert; defaults to `cert.pem`>
KEY_PATH=< path to your SSL  key; defaults to  `key.pem`>
```

### Running

  * Run `npm run start`

### Running with Docker

This command can be used to launch a totally fresh instance of the application via Docker Compose:

```sh
DOCKER_BUILDKIT=1
docker build -t telemetry2:latest . && \
  docker compose down --volumes && \
  docker compose up
```

### Deploying

#### One-time only: Setting up the schema

You shouldn't need to this, since it's already been done, but, before the app be used on the server, the relevant database needs to get set up with the schema from `sql/schema.sql`.  @TheBizzle has scripts and YAML files laying around, showing how he did this, and can produce them upon request.

#### Uploading to GitHub Container Registry (GHCR)

To publish the Docker images for use on the cluster, navigate to [this GitHub Actions page](https://github.com/NetLogo/telemetry2/actions/workflows/publish-image.yaml) and click "Run workflow".  After choosing the branch/tag that you want to publish, confirming your selection, and waiting less than a minute, the image should become available [here](https://github.com/NetLogo/telemetry2/pkgs/container/telemetry2).

#### Launching the containers

With the container up in the registry, we now need to tell the server to load it.  Critically, this is specified in `kubernetes/01-deployment.yaml`, at the path `spec.template.spec.containers.image`.  The Git commit SHA needs to be updated there, for whichever commit was just uploaded.

The files in `kubernetes/` are exact replicas of what is used for running this application on the cluster.  For the most part, you should be able to just copy and paste them to your own cluster, and run them with `kubectl apply -f <filename>` in order to get the same behavior.  (Though, this also requires ownership of the specified domain, the configuration of various secrets in the Kubernetes configuration, the availability of particular ports, and that the database is accessible at a very particular domain name.)

However, if the circumstance are all met, and you `kubectl apply` those three files, you should then have a fully-functioning instance of the application running on your Kubernetes cluster.
