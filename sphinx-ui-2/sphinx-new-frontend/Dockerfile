FROM node:14.4.0 as base
RUN mkdir  -p /opt/app
WORKDIR /opt/app

COPY . .

RUN npm install

RUN mkdir -p /opt/app/node_modules/tinymce/plugins/eqneditor

RUN mkdir -p /opt/app/node_modules/tinymce/plugins/eqneditor/img/

COPY eqneditor/* /opt/app/node_modules/tinymce/plugins/eqneditor/

RUN mv /opt/app/node_modules/tinymce/plugins/eqneditor/eqneditor.gif  /opt/app/node_modules/tinymce/plugins/eqneditor/img/

RUN mv /opt/app/node_modules/tinymce/plugins/eqneditor/eqneditor.png  /opt/app/node_modules/tinymce/plugins/eqneditor/img/

RUN  npm run build 

FROM nginx:latest
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=base /opt/app/dist/  /usr/share/nginx/html/