FROM node:14.9.0
WORKDIR /app
COPY . .
RUN npm i
CMD npm start