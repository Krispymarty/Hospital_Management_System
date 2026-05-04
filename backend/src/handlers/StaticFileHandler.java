package handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;

public class StaticFileHandler implements HttpHandler {
    private final String baseDir;

    public StaticFileHandler(String baseDir) {
        this.baseDir = baseDir;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        if (path.equals("/")) {
            path = "/index.html";
        }

        // Sanitize path to prevent traversal
        path = path.replace("..", "");
        
        File file = new File(baseDir, path).getCanonicalFile();
        File base = new File(baseDir).getCanonicalFile();
        
        if (!file.getPath().startsWith(base.getPath()) || !file.exists() || file.isDirectory()) {
            String response = "404 (Not Found)\n";
            exchange.sendResponseHeaders(404, response.length());
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
            return;
        }

        String mimeType = "text/plain";
        if (path.endsWith(".html")) mimeType = "text/html";
        else if (path.endsWith(".css")) mimeType = "text/css";
        else if (path.endsWith(".js")) mimeType = "application/javascript";
        else if (path.endsWith(".png")) mimeType = "image/png";
        else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) mimeType = "image/jpeg";

        exchange.getResponseHeaders().set("Content-Type", mimeType);
        exchange.sendResponseHeaders(200, file.length());

        OutputStream os = exchange.getResponseBody();
        FileInputStream fs = new FileInputStream(file);
        final byte[] buffer = new byte[0x10000];
        int count;
        while ((count = fs.read(buffer)) >= 0) {
            os.write(buffer, 0, count);
        }
        fs.close();
        os.close();
    }
}
