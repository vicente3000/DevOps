FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN if [ -f src/prisma/schema.prisma ]; then npx prisma generate --schema=src/prisma/schema.prisma; fi

EXPOSE 3000

CMD ["sh", "-c", "if [ -f src/prisma/schema.prisma ]; then npx prisma migrate deploy --schema=src/prisma/schema.prisma; fi && npm start"]
