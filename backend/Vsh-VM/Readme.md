# VirtualShock VirtualMachine
## Introduction
Api+VM to test and simulate assembly code. DLX ISA by Hennessey & Patterson

## Installation
Install with maven:
```
mvn clean install -f pom.xml
```

## Run
Run the output jar in the target directory, configure with cmd line arguments:
```
cd ./target
java -jar vsh-vm-0.0.1-SNAPSHOT.jar -args...
```
### Virtual Machine
```
java -jar vsh-vm-0.0.1-SNAPSHOT.jar vm -program ./testProgram.txt
```
### Api
```
java -jar vsh-vm-0.0.1-SNAPSHOT.jar api -port 8080
```
### Parser
```
java -jar vsh-vm-0.0.1-SNAPSHOT.jar parser (to be implemented)
```
