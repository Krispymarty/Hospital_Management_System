package handlers;

import com.sun.net.httpserver.HttpExchange;
import dao.DoctorDAO;
import models.Doctor;

import java.io.IOException;
import java.util.List;

public class DoctorHandler extends BaseHandler {
    private DoctorDAO dao = new DoctorDAO();

    @Override
    protected void processRequest(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        String[] parts = path.split("/");

        if (method.equals("GET")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                Doctor doc = dao.getDoctorById(id);
                if (doc != null) sendResponse(exchange, 200, gson.toJson(doc));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                List<Doctor> list = dao.getAllDoctors();
                sendResponse(exchange, 200, gson.toJson(list));
            }
        } else if (method.equals("POST")) {
            Doctor d = gson.fromJson(readRequestBody(exchange), Doctor.class);
            Doctor added = dao.addDoctor(d);
            sendResponse(exchange, 201, gson.toJson(added));
        } else if (method.equals("PUT")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                Doctor d = gson.fromJson(readRequestBody(exchange), Doctor.class);
                Doctor updated = dao.updateDoctor(id, d);
                if (updated != null) sendResponse(exchange, 200, gson.toJson(updated));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else if (method.equals("DELETE")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                if (dao.deleteDoctor(id)) sendResponse(exchange, 204, "");
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else {
            sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
        }
    }
}
