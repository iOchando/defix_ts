FROM node:16

WORKDIR /app

COPY . .

RUN npm install -- 

EXPOSE 3072

CMD ["npm", "run", "defix"]