package api;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;
import java.util.stream.Collectors;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import Vm.ProgramLoader;
import Vm.VshVirtualMachine;
public class VmApi {
    private final int port;
    private final String basePath;
    public VmApi(int port,String basePath){
        this.port=port;
        this.basePath=basePath;
    }

    // Starts the API
    public void start() throws IOException {
        // Create an HTTP server that listens on port 8080
        HttpServer server = HttpServer.create(new InetSocketAddress(this.port), 0); //default: 8084
        // Create a context for the "/api/hello" endpoint
        server.createContext(this.basePath+"/ping", new PingHandler());
        server.createContext(this.basePath+"/execute", new ExecuteProgramHandler());
        // Start the server
        server.start();

        System.out.println("Server started on port "+this.port);
    }

    // Custom handler for the "/api/hello" endpoint
    static class PingHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            System.out.println("Received ping request");
            // Send a simple response
            String response = "Hello from VSH Api!";
            exchange.sendResponseHeaders(200, response.length());

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        }
    }

    static class ExecuteProgramHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if(exchange.getRequestMethod().equals("POST")){
                System.out.println("Received program execution request");
                String requestBody = new BufferedReader(new InputStreamReader(exchange.getRequestBody()))
                        .lines().collect(Collectors.joining("\n"));
                // PARSE JSON
                System.out.println("POST body:" + requestBody);
                Gson gson= new Gson();
                JsonObject requestJson = gson.fromJson(requestBody,JsonObject.class);
                //Prepara risposta, è l'output del programma
                String response = "{\"output\":\"error\"}";
                if(requestJson.has("source")){
                    if(requestJson.get("source").getAsString().equals("file")){
                        if(requestJson.has("value")){
                            String programPath=requestJson.get("value").getAsString();
                            //DA FILE NEL SISTEMA OPERATIVO
                            response = this.launchVmFromFilePath(programPath);
                        }else{
                            //NON C'E' LA PATH DEL FILE
                        }
                    } else if (requestJson.get("source").getAsString().equals("direct")) {
                        //DIRETTAMENTE NELLA RICHIESTA
                    } else {
                        //UNKNOWN SOURCE
                    }
                }else{
                    //SOURCE NOT SPECIFIED
                }

                // Send a simple response
                exchange.sendResponseHeaders(200, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
            }

        }

        private String launchVmFromFilePath(String programPath){
            //String programPath=requestJson.get("value").getAsString();
            //DA FILE NEL SISTEMA OPERATIVO
            // LOAD PROGRAM
            System.out.println("** Loading program: "+programPath);
            List<Integer> program= null;
            try {
                program = ProgramLoader.loadProgram(programPath);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            for(int i=0; i<program.size();i++){
                System.out.println("Program line "+i+": "+program.get(i));
            }

            // START VM
            VshVirtualMachine vm= null;
            String response;
            try { //!WARNING: POTREBBE NON TERMINARE!!!
                vm = new VshVirtualMachine(1024,program);
                System.out.println("\n** Launching Virtual Shock VM");
                System.out.println("---Program-Output---");
                String out=vm.start(false);
                response="{\"output\":\""+out+"\"}";
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            return response;
        }

    }

}
