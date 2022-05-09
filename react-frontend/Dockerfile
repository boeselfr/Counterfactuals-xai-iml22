# Base layer for the image
FROM node:lts-alpine

# ENV NODE_ENV=production

# Copy the rest of the files over
COPY . /usr/src/app

# Specify work directory within the image repository
# Future lines will run here
WORKDIR /usr/src/app

# Copy over dependencies
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

# Install dependencies in image
# RUN npm install && mv node_modules ../
RUN npm install
RUN npm install -g serve

# Determine connection port 
# EXPOSE 3000
# 
# RUN chown -R node /usr/src/app
# USER node
RUN npm run build

# CMD ["npm", "list"]
CMD ["serve", "-s", "build", "-l", "3000"]
