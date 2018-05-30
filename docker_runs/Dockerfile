FROM openjdk:8-jre-slim
USER root
WORKDIR /opt/
RUN apt-get update && apt-get install -y curl wget
RUN curl -s https://api.github.com/repos/dessalines/simple-vote/releases/latest | grep browser_download_url | cut -d '"' -f 4 | xargs wget