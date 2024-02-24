package api;

import api.services.VmRunService;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import java.net.InetSocketAddress;

import com.google.gson.Gson;
import com.google.gson.JsonObject;



public class VmWebsocketServer extends WebSocketServer{

    private VmRunService vmRunService= null;

    public VmWebsocketServer(int port) {
        super(new InetSocketAddress(port));
    }

    @Override
    public void onOpen(WebSocket webSocket, ClientHandshake clientHandshake) {
        System.out.println("WebSocket connection opened: " + webSocket.getRemoteSocketAddress());
        vmRunService = new VmRunService(webSocket);
    }

    @Override
    public void onClose(WebSocket webSocket, int i, String s, boolean b) {
        System.out.println("WebSocket connection closed: " + webSocket.getRemoteSocketAddress());
        vmRunService = null;
    }

    @Override
    public void onMessage(WebSocket webSocket, String s) {
        System.out.println("** New message received: "+s);
        Gson gson= new Gson();
        JsonObject requestJson;
        try{
            requestJson = gson.fromJson(s,JsonObject.class);
        }catch(Exception e){
            e.printStackTrace();
            return;
        }
        if(!requestJson.has("cmd")) return;
        String cmd= requestJson.get("cmd").getAsString();

        //Parse request
        switch (cmd){
            case "load":
                String source= requestJson.get("program").getAsJsonObject().get("source").getAsString();
                String value= requestJson.get("program").getAsJsonObject().get("value").getAsString();
                vmRunService.load(source,value);
                break;
            case "start":
                vmRunService.start();
                break;
            case "stop":
                vmRunService.stop();
                break;
            case "pause":
                vmRunService.pause();
                break;
        }
    }

    public void sendUpdate(WebSocket conn, String update) {
        conn.send(update);
    }


    @Override
    public void onError(WebSocket webSocket, Exception e) {
        e.printStackTrace();
    }

    @Override
    public void onStart() {

    }
}
