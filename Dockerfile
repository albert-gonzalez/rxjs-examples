FROM node:12

COPY . /src

WORKDIR /src

RUN npm install

CMD ['npm', 'install']