FROM nginx
WORKDIR /usr/share/nginx/html
COPY dist         dist/
COPY js           js/
COPY index.html   ./
COPY css          css/

