package api;

import com.sun.net.httpserver.Filter;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;

public class CorsFilter extends Filter {

    @Override
    public void doFilter(HttpExchange exchange, Chain chain) throws IOException {
        // Add CORS headers to the response
        Headers headers = exchange.getResponseHeaders();
        headers.set("Access-Control-Allow-Origin", "*"); // You may want to specify the allowed origin(s) instead of "*"
        headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type");

        // Handle pre-flight requests
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        // The final Filter in the chain invokes the applications exchange handler.
        chain.doFilter(exchange);
    }

    @Override
    public String description() {
        return "CORS filter";
    }
}
