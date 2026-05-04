package handlers;

import com.sun.net.httpserver.HttpExchange;
import dao.MedicineDAO;
import models.Medicine;

import java.io.IOException;
import java.util.List;

public class MedicineHandler extends BaseHandler {
    private MedicineDAO dao = new MedicineDAO();

    @Override
    protected void processRequest(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        String[] parts = path.split("/");

        if (method.equals("GET")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                Medicine m = dao.getMedicineById(id);
                if (m != null) sendResponse(exchange, 200, gson.toJson(m));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                List<Medicine> list = dao.getAllMedicines();
                sendResponse(exchange, 200, gson.toJson(list));
            }
        } else if (method.equals("POST")) {
            Medicine m = gson.fromJson(readRequestBody(exchange), Medicine.class);
            Medicine added = dao.addMedicine(m);
            sendResponse(exchange, 201, gson.toJson(added));
        } else if (method.equals("PUT")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                Medicine m = gson.fromJson(readRequestBody(exchange), Medicine.class);
                Medicine updated = dao.updateMedicine(id, m);
                if (updated != null) sendResponse(exchange, 200, gson.toJson(updated));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else if (method.equals("DELETE")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                if (dao.deleteMedicine(id)) sendResponse(exchange, 204, "");
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else {
            sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
        }
    }
}
