mvn clean install
pkill -9 -f target/simplevote.jar
nohup java -jar target/simplevote.jar $@ >> log.out &
