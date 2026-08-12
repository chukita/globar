FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
# npm install en vez de npm ci: ver comentario en .github/workflows/ci.yml
RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "echo '=== Running migrations ===' && npm run db:migrate && echo '=== Migration OK, starting server ===' && npx next start -p 3000"]
