FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --registry=https://registry.npmmirror.com --fetch-retries=5 --fetch-timeout=60000
COPY . .
RUN npm run build

FROM nginx:1.31.3-alpine
LABEL com.defaultbot.managed="true"
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
