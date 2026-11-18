FROM node:24-alpine AS build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts
COPY frontend/ ./
COPY favicon.png /app/favicon.png
COPY ["Земля пнг.png", "/app/Земля пнг.png"]
RUN npm run check && npm run build
RUN npm prune --omit=dev --ignore-scripts

FROM node:24-alpine AS frontend
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/frontend/build ./build
COPY --from=build --chown=node:node /app/frontend/package.json ./package.json
COPY --from=build --chown=node:node /app/frontend/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "build"]

FROM nginx:stable-alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/build/client /usr/share/nginx/html
EXPOSE 80
