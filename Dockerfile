FROM node:lts-slim
ENV NODE_ENV production

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

# Worarkound https://github.com/npm/cli/issues/5900
RUN npm install --omit=dev && \
  chown -R node:node node_modules

COPY --chown=node:node . .

# Create temp folder
RUN mkdir -p /app/tmp
RUN chown node:node /app/tmp

# Create dest folder, but should not be used in production,
# instead the user should volume mount /app/dest folder
RUN mkdir -p /app/dest
RUN chown node:node /app/dest

USER node

EXPOSE 3042

HEALTHCHECK --interval=30s --timeout=12s --start-period=6s \
  CMD node healthcheck.js

CMD ["npm", "start"]
