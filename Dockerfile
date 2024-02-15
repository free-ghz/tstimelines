FROM node:latest
WORKDIR /opt/tstimelines
COPY . .
RUN yarn
ENTRYPOINT ["yarn", "node", "index"]
