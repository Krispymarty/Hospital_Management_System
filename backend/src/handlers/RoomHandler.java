package handlers;

import com.sun.net.httpserver.HttpExchange;
import dao.RoomDAO;
import models.Room;

import java.io.IOException;
import java.util.List;

public class RoomHandler extends BaseHandler {
    private RoomDAO dao = new RoomDAO();

    @Override
    protected void processRequest(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        String[] parts = path.split("/");

        if (method.equals("GET")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                Room r = dao.getRoomById(id);
                if (r != null) sendResponse(exchange, 200, gson.toJson(r));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                List<Room> list = dao.getAllRooms();
                sendResponse(exchange, 200, gson.toJson(list));
            }
        } else if (method.equals("POST")) {
            Room r = gson.fromJson(readRequestBody(exchange), Room.class);
            Room added = dao.addRoom(r);
            sendResponse(exchange, 201, gson.toJson(added));
        } else if (method.equals("PUT")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                Room r = gson.fromJson(readRequestBody(exchange), Room.class);
                Room updated = dao.updateRoom(id, r);
                if (updated != null) sendResponse(exchange, 200, gson.toJson(updated));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else if (method.equals("DELETE")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                if (dao.deleteRoom(id)) sendResponse(exchange, 204, "");
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else {
            sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
        }
    }
}
