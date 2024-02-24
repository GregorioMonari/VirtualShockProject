package api;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import api.VmWebsocketServer;

import Vm.ProgramLoader;
import Vm.VshVirtualMachine;

public class VmApi {
    private final int port;
    private final String basePath;

    private HttpServer server;
    private List<HttpContext> contexts=new ArrayList<>();

    private int wsPort;
    private VmWebsocketServer wsServer;

    // CONSTRUCTOR
    public VmApi(int port,int wsPort, String basePath){
        this.port=port;
        this.basePath=basePath;
        this.wsPort=wsPort;
    }

    // Starts the API
    public void start() throws IOException{
        // Create an HTTP server that listens on port 8080
        server = HttpServer.create(new InetSocketAddress(this.port), 0); //default: 8084
        // Link endpoints paths with handlers
        initContexts();
        // Start the server
        server.start();
        System.out.println("Server started on port "+this.port);

        //Start ws server
        wsServer = new VmWebsocketServer(this.wsPort);
        wsServer.start();
        System.out.println("WebSocket server started on port " + this.wsPort);
    }


    private void initContexts(){
        // Create a context for the endpoints
        contexts.add(server.createContext(this.basePath+"/ping", new PingHandler()));
        contexts.add(server.createContext(this.basePath+"/execute", new ExecuteProgramHandler()));
        // Add cors to all context
        for(HttpContext context: contexts){
            context.getFilters().add(new CorsFilter()); // Add CORS filter
        }
    }


    // Custom handler for the "/api/hello" endpoint
    static class PingHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            System.out.println("Received ping request");
            // Send a simple response
            String response = "{\"status\":\"OK\",\"message\":\"Hello from VSH Api!\"}";
            exchange.sendResponseHeaders(200, response.length());

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        }
    }

    // Custom handler for the "/api/execute" endpoint
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
                            response = this.launchVm(program);
                        }else{
                            //NON C'E' LA PATH DEL FILE
                        }
                    } else if (requestJson.get("source").getAsString().equals("direct")) {
                        //DIRETTAMENTE NELLA RICHIESTA
                        String stringProgram=requestJson.get("value").getAsString();
                        //Direttamente da URL
                        System.out.println("** Loading program directly from request...");
                        List<Integer> program= null;
                        try {
                            program = ProgramLoader.loadProgramFromString(stringProgram);
                        } catch (Exception e) {
                            throw new RuntimeException(e);
                        }
                        for(int i=0; i<program.size();i++){
                            System.out.println("Program line "+i+": "+program.get(i));
                        }
                        response = this.launchVm(program);
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

        private String launchVm(List<Integer> program){
            // START VM
            VshVirtualMachine vm= null;
            String response;
            try { //!WARNING: POTREBBE NON TERMINARE!!!
                vm = new VshVirtualMachine(1024,program);
                System.out.println("\n** Launching Virtual Shock VM");
                System.out.println("---Program-Output---");
                String out=vm.start(false);
                //response="{\"output\":\""+out+"\"}";
                String parsedOut=out.replace("\n","\\n"); //"porcodio\nmadonnina";
                response="{\"output\":\""+parsedOut+"\"}";
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
            return response;
        }

    }

    public void stop(){
        this.server.stop(120);
    }

}
