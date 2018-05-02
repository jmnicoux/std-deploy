FROM node:4-alpine

RUN apk --no-cache --update add openssh-client
COPY /var/lib/jenkins/.ssh/id_rsa_servson /home/jenkins/.ssh/id_rsa_servson
