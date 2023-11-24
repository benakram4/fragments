# stage 0: Install dependencies
FROM node:18.18.2@sha256:a6385a6bb2fdcb7c48fc871e35e32af8daaa82c518900be49b76d10c005864c2 AS dependencies

LABEL maintainer="Ben Akram bakram4@myseneca.ca" \
  description="Fragments node.js microservice"

ENV NODE_ENV=production

ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn \
  NPM_CONFIG_COLOR=false

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

####################################################
# stage 1: Production | run the app
FROM node:18.18.2-alpine3.18@sha256:435dcad253bb5b7f347ebc69c8cc52de7c912eb7241098b920f2fc2d7843183d AS production

# Tell docker that all future commands should run as the node user
# because node user and group are already created in the node image we don't need to create them 
# https://docs.docker.com/develop/develop-images/instructions/#user
USER node

WORKDIR /app

# copy the dependencies from the first stage
COPY --from=dependencies /app .

# add the rest of the app's source code
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Define an automated healthcheck, using wget instead of curl to avoid another dependency
# --quiet: Don't print anything to stdout
# --spider: Don't download anything
# https://www.gnu.org/software/wget/manual/wget.html
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3  \
  CMD wget --quiet --spider http://localhost:8080 || exit 1

# use Node instead of npm to avoid a the extra npm layer
CMD ["node", "./src/index.js"]

EXPOSE 8080
