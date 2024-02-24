#---BUILD---
FROM maven:3.6-openjdk-17-slim as BUILD
WORKDIR /usr/src/app
COPY . .
RUN mvn clean install


#---RUN---
FROM openjdk:17
#Copy source files
WORKDIR /usr/src/app
COPY --from=BUILD /usr/src/app/target/vsh-vm-0.0.1-SNAPSHOT.jar ./vsh-vm
COPY --from=BUILD /usr/src/app/target/testProgram.txt ./testProgram.txt


ENTRYPOINT [ "java", "-jar", "./vsh-vm", "api" ]