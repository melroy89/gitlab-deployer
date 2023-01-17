#!/usr/bin/env bash
docker build -t danger89/gitlab-deployer .
docker push danger89/gitlab-deployer:latest
