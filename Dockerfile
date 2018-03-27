FROM node:9 as node-builder

ARG UI_PATH=/opt/simple-vote/ui

# Hacky workaround for installing @angular/cli
RUN chmod a+w /usr/local/lib/node_modules && chmod a+w /usr/local/bin
USER node
RUN npm i -g @angular/cli@latest
USER root

COPY ui/package.json ${UI_PATH}/package.json
WORKDIR ${UI_PATH}
RUN yarn

COPY ui ${UI_PATH}
RUN ng build -prod -aot


FROM maven:3.5-jdk-8 as java-builder

COPY service /opt/simple-vote/service
COPY --from=node-builder /opt/simple-vote/ui/dist /opt/simple-vote/service/src/main/resources

WORKDIR /opt/simple-vote/service
RUN mvn clean install


FROM openjdk:8-jre-slim

COPY --from=java-builder /opt/simple-vote/service/target/simplevote.jar /opt/simplevote.jar

RUN unzip -o /opt/simplevote.jar -d /tmp/.simplevote.tmp
CMD ["java", "-jar", "/opt/simplevote.jar", "-liquibase"]
