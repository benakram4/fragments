#First Docket file for Lab05

# Use node version 18.13.0
FROM node:18.17.0

# The LABEL instruction adds key=value pairs with arbitrary metadata about your image.
# https://docs.docker.com/engine/reference/builder/#label
LABEL maintainer="Ben Akram bakram4@myseneca.ca"
LABEL description="Fragments node.js microservice"

# We define environment variables using the ENV instruction, which also uses key=value pairs like LABEL
# https://docs.docker.com/engine/reference/builder/#env
#  can be overridden at runtime using the --env, -e or --env-file flags.
# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Set the working directory
# Use /app as our working directory
WORKDIR /app

#  We use the COPY instruction to copy files and folders into our image
# https://docs.docker.com/engine/reference/builder/#copy
# Copy the package.json and package-lock.json files
# into the working directory
COPY package*.json ./

# Install dependencies
# We use the RUN instruction to execute a command and cache this layer 
# https://docs.docker.com/engine/reference/builder/#run
RUN npm install

# Copy the source code into the working directory
# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD npm start

#We use EXPOSE in order to indicate the port(s) that a container will listen on when run. 
# For example, a web server might EXPOSE 80, indicating that port 80 is the typical port used by this container.
# We run our service on port 8080
EXPOSE 8080
