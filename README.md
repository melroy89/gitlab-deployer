# GitLab Artifact Deployer

This service will listen for completed GitLab Deployment jobs, retrieves the latest (build) artifact and deploys the artifact on the live production environment.

By default it will try to download the GitLab Artifact from the same deployment job as where the webhook will trigger from. This GitLab Artifact Deployer will use the project ID and job ID from the webhook response body request, and use this information to download the artifact.

If you wish to download the artifact from another git branch and/or from other GitLab job name, set: `USE_JOB_NAME` to `yes`. See "Environment variables options" for all the available options.

## Production

We will first explain how to use this setup in production. See at the bottom of the readme for running this project in a development setup.

### Setup GitLab Artifact Deployer

#### Environment variables options

You need to set some settings using environment variables, for that we use the `.env` file. You can use the [.env.example](.env.example) file as template:

```sh
cp .env.example .env
```

See below for all the avaialble options, only the `GITLAB_SECRET_TOKEN` environment variable is actually mandatory

| Environment Var       | Description                                                                                        | Required |
| --------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| `GITLAB_SECRET_TOKEN` | GitLab Secret Token, which is **required** for safety reasons.                                     | yes      |
| `GITLAB_HOSTNAME`     | GitLab Host, default: `gitlab.com`                                                                 | no       |
| `USE_JOB_NAME`        | Instead of Job ID from the webhook body request, use job name and branch name (not set by default) | no       |
| `PROJECT_ID`          | GitLab Project ID (not set by default), retrieving project ID from webhook body request            | no       |
| `REPO_BRANCH`         | Branch to download artifact from, default: `main`                                                  | no       |
| `JOB_NAME`            | Job name to download artifact from, default: `deploy`                                              | no       |
| `ACCESS_TOKEN`        | Access token, for private repository (not set by default)                                          | no       |
| `DESTINATION_PATH`    | Destination path where the artifact zip content is extracted, default: `dest` folder               | no       |
| `TEMP_FOLDER`         | Temporarily file path where the artifact zip is stored, default: `tmp` folder                      | no       |

_Hint:_ Adapt the `.env` file to your settings (eg. `GITLAB_SECRET_TOKEN`), read the section below: "Adding GitLab Webhook". As long as this token will match the token you will give it during the webhook setup, everything should be fine.

_Hint:_ You can set `USE_JOB_NAME` to the string value `yes`, if you wish to retrieve the GitLab artifact using repository branch name (`REPO_BRANCH`) and job name (`JOB_NAME`). By default we use the job ID to fetch the artifact from GitLab. Job ID is retrieved from the webhook body request, similar to how the project ID is retrieved from the body request.

_Hint:_ You do **NOT** need to change the `DESTINATION_PATH` environment variable (nor the `TEMP_FOLDER`). Instead try to leverage Docker volume mounting feature. So mount your host destination path to the `/app/dest` container path, see example in [compose.yaml](compose.yaml).

_Hint:_ You can create a personal access token at your GitLab profile, when you need to set `ACCESS_TOKEN` (needed for private repositories).

#### Docker Compose

You can use the [prebuild Docker image from Dockerhub](https://hub.docker.com/r/danger89/gitlab-deployer). Optionally, build your own Docker image using the [Dockerfile](Dockerfile).

In production we use Docker Compose, see [compose.yaml](compose.yaml) file to start the Docker container leveraging Docker Compose. It's advised to run the service behind a reverse proxy (eg. Nginx).

Start the container using: `docker compose up` or start in the background using: `docker compose up -d`.  
_Note:_ If you installed Docker Compose manually, the script name is `docker-compose` instead of `docker compose`.

Be sure your `./dest` destination folder on your host system is created and has the **correct permissions**, which has UID: 1000 and GID: 1000: `sudo chown 1000:1000 -R ./dest/`

Otherwise the GitLab Artifact Deployer is unable to extract the downloaded artifact archive to your system.

---

Instead of using Docker Compose, you could also use `docker run` but that is **not** advised. Anyway, here is an example of docker run:

```sh
docker run -it -v $(pwd)/.env:/app/.env -v $(pwd)/deployment:/app/dest -p 3042:3042  --rm danger89/gitlab-deployer:latest
```

_Note:_ Be sure you set the correct rights to the `deployment` folder (UID: 1000, GUID: 1000): `sudo chown 1000:1000 -R ./deployment/`

#### Setup a GitLab Job

We use a special CI/CD job in GitLab called [Deployment Jobs](https://docs.gitlab.com/ee/ci/jobs/index.html#deployment-jobs).

You need to use the `environment` keyword in order to activate a deployment job. Below an _example_ of such a deploy job, which will trigger our GitLab Artifact Deployer:

```yml
deploy:
  script:
    - build_code_or_artifact.sh
  environment:
    name: production
    url: https://yourliveproduction.com
  artifacts:
    paths:
      - ./dist
```

_Note:_ In this example the GitLab deployment job is the _same job_ that also stores the artifact, allowing the GitLab Artifact Deployer to use the Job ID from the body response (+ project ID) by default to fetch the GitLab Artifact. If you wish to use another branch and/or job name instead set the `USE_JOB_NAME` environment variable to the string `yes`. Which allows you to set and use the `REPO_BRANCH` and `JOB_NAME` variables.

_Note:_ The deployment job doesn't need to be named `deploy` nor doesn't need to be part of the 'deploy' phase in GitLab. As long as it has the `environment` keyword, it should work.

#### Adding GitLab Webhook

Add your URL as Webhook in your GitLab project, in your GitLab repository go to: `Settings` -> `Webhooks` in the menu.

Add the public URL towards this GitLab Artifact Deployer, be sure to add `/gitlab` to the end of the URL (eg.`https://service.mydomain.com/gitlab`).  
Since the route ending with `/gitlab` is mapped to the HTTP GitLab POST Webhook events.

If you are _testing locally_ on your LAN network, you can set the webhook URL to: `http://<your_internal_ip>:3042/gitlab` (disable SSL verification in this case). However, it's advised to run this service behind a reverse proxy like Nginx with proper SSL/TLS encrypted connection.

Adding a Secret Token is **required** for security reasons, so you know the request is legitimately coming from the GitLab server.

Finally, check the trigger: "Deployment events" where the webhook should then trigger on.

## FAQ

### ERROR: Failed to extract artifact zip file: ENOENT: no such file or directory, chmod

**Solution:** Fix the destination folder access permissions by setting the correct user ID & group ID, using: `sudo chown 1000:1000 -R ./dest`

**Root cause:** Your destination folder has _incorrect_ permissions (eg. root user for example).

### WARN: Artifact not found!

**Solution 1:** Be sure you add the artifact as part of the deployment job. See "Setup a GitLab Job" section above for an example. Alternavitely, you can also set `USE_JOB_NAME` to `yes` if you wish to use another job name to fetch the artifact from.

**Solution 2:** If your repository is private, be sure to set the `ACCESS_TOKEN`. Otherwise this service is unable to access the artifact.

**Root cause:** Your GitLab Job didn't contain any artifact or the GitLab Artifact Deployer could not access the artifact file.

### WARN: GitLab Secret Token mismatch!

**Solution:** Provide the same secret via `GITLAB_SECRET_TOKEN` as you did during configuring the GitLab Webhook secret token.

**Root cause:** The receiving GitLab secret token from the webhook call is not matching the GitLab secret token you provided with `GITLAB_SECRET_TOKEN`.

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
2. Install the NodeJS dependencies via: `npm install`
3. Prepare the `.env` (see [.env.example](.env.example) file), like setting the `GITLAB_SECRET_TOKEN` and `GITLAB_HOSTNAME` environment variables.
4. To start the bot by executing: `npm start`
