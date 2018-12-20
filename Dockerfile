
# Proof of concept. Just shy start, don't judge me
FROM node:8.9.1
WORKDIR /app
RUN npm install -g typescript@3.2.1
COPY package.json /app
COPY package-lock.json /app
RUN npm install
COPY main.ts /app
COPY tsconfig.json /app
# this is just a temporary solution
COPY add_user.js /app
RUN tsc
RUN mkdir /app/coffee_bot_db
CMD node "/app/dist/main.js"