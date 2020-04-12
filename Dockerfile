FROM node:12

RUN mkdir -p /var/www
WORKDIR /var/www

COPY package*.json ./
RUN npm install --production
COPY  . .

EXPOSE $APP_PORT

ENTRYPOINT ["npm", "start"]