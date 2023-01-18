# GitLab Artifact Deployer

This service will listen for completed GitLab jobs, retrieves the latest (build) artifact and deploys the artifact on the live production environment.

## Production

We will first explain how to use this setup in production. See below for running a development setup.

### Setup GitLab Artifact Deployer

You need to set some settings using environment variables, for that we use the `.env` file. You can use the `.env.example` file as template.

```sh
cp .env.example .env
```

Adapt the `.env` file to your settings for the `GITLAB_SECRET_TOKEN`, see the section below "Adding Webhook". As long as this token will match the token you will give it during the webhook setup, everything should be fine.

In production we use Docker, see [docker-compose.yml](docker-compose.yml) file to start the Docker container leveraging Docker Compose. It's advised to run the service behind a reverse proxy (eg. Nginx).

Start the container using: `docker compose up` or start in the background using: `docker compose up -d`.  
_Note:_ If you instaled Docker Compose manually, the script name is `docker-compose` instead of `docker compose`.

### Setup a GitLab Job

We use a special CI/CD job in GitLab called [Deployment Jobs](https://docs.gitlab.com/ee/ci/jobs/index.html#deployment-jobs).

You need to use the `environment` keyword in order to activate a deployment job. Below an _example_ of such a deploy job, which will trigger our GitLab Artifact Deployer:

```yml
deploy:
  script:
    - deploying.sh
  environment:
    name: production
    url: https://live.production.com
```

## Adding Webhook

Add your URL as Webhook in your GitLab project, in your GitLab repository go to: `Settings` -> `Webhooks` in the menu.

Add the public URL towards this GitLab Artifact Deployer, be sure to add `/gitlab` to the end of the URL (eg.`https://service.mydomain.com/gitlab`, when the service is running behind a reverse proxy).  
Since the route ending with `/gitlab` is mapped to the HTTP GitLab POST Webhook events.

Adding a Secret Token is **strongly advised**, so you know the request is legitaly coming from the GitLab server.

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
