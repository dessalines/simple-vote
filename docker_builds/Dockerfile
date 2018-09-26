FROM node:9 as node-builder

# Hacky workaround for installing @angular/cli
# RUN chmod a+w /usr/local/lib/node_modules && chmod a+w /usr/local/bin
# USER node
# RUN npm i -g @angular/cli@latest

# Build front end resources
USER root
ARG UI_PATH=/opt/simple-vote/ui
COPY ui ${UI_PATH}
WORKDIR ${UI_PATH}
RUN yarn
RUN yarn build --prod --aot


FROM maven:3.5-jdk-8 as java-builder

COPY service /opt/simple-vote/service
COPY --from=node-builder /opt/simple-vote/ui/dist /opt/simple-vote/service/src/main/resources

WORKDIR /opt/simple-vote/service
RUN mvn clean install -DskipTests -Dliquibase.skip

FROM openjdk:8-jre-slim

COPY --from=java-builder /opt/simple-vote/service/target/simplevote.jar /opt/simplevote.jar