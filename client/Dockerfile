FROM node:13.12.0-alpine AS build
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json /app/
RUN npm install

COPY . .
RUN npm run build

FROM node:13.12.0-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json /app/
RUN npm install

COPY --from=build /app/build /app/build/

EXPOSE 3000
CMD [ "npm", "start" ]