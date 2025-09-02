FROM node:20-alpine

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies including NestJS CLI globally
RUN npm install
RUN npm install -g @nestjs/cli
RUN npm install @nestjs/swagger swagger-ui-express

# Bundle app source
COPY . .

# Creates a 'dist' folder with the production build
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"] 