# GitLab Artifact Deployer

This service will listen for completed GitLab jobs, retrieves the latest (build) artifact and deploys the artifact on the live production environment.

## Production

### Starting

Install the JavaScript dependencies: `npm install`.

You now need to set several environment variables, you can use the `.env` file.

```sh
cp .env.example .env
```

And adapt the `.env` file. Then start the bot, using:

```sh
npm start
```

You can also change the port, by setting the `PORT` environment variable.

It's adviced to run the bot behind a reverse proxy (eg. Nginx).

### Testing

Some test events will not listen to the triggers (since it will not contain the right trigger information). But the `Releases events` should work from the Test drop-down menu (last option).

### Running Production

For production you could also copy `.env.example` to `.env` file.

In production we use Docker, see [docker-compose.yml](docker-compose.yml) file to start the Docker container leveraging Docker Compose.

Start the container using: `docker compose up` or start in the background using: `docker compose up -d`.
_Note:_ If you instaled Docker Compose manually, the script name is `docker-compose` instead of `docker compose`.

## Adding Webhook

Add your URL as Webhook in your GitLab project, under: `Settings` -> `Webhooks` in the menu.

Add the public URL towards this GitLab Artifact Deployer, be sure to add `/gitlab` to the end of the URL (eg.`https://service.mydomain.com/gitlab`, when the service is running behind a reverse proxy).  
Since the route ending with `/gitlab` is mapped to the HTTP GitLab POST Webhook events.

Adding a Secret token is **strongly advised**, so you know the request is legitaly coming from the GitLab server.

Enable the following triggers or the service will not work as expected:

- Issues Events
- Merge Requests Events
- Pipeline Events
- Releases Events

## Development

### Requirements

- [Node.js v16](https://nodejs.org/en/download/) with `npm`

```sh
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Getting started

Assuming you already fulfilled the requirements above.

1. Clone the project: `git clone git@gitlab.melroy.org:melroy/gitlab-deployer.git`
2. Install the NodeJS depedencies via: `npm install`
3. Prepare the `.env` (see [.env.example](.env.example) file), like setting the `GITLAB_SECRET_TOKEN` environment variable.
4. To start the bot by executing: `npm start`
