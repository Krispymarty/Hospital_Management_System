package handlers;

import com.sun.net.httpserver.HttpExchange;
import dao.AppointmentDAO;
import models.Appointment;

import java.io.IOException;
import java.util.List;

public class AppointmentHandler extends BaseHandler {
    private AppointmentDAO dao = new AppointmentDAO();

    @Override
    protected void processRequest(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        String[] parts = path.split("/");

        if (method.equals("GET")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                Appointment a = dao.getAppointmentById(id);
                if (a != null) sendResponse(exchange, 200, gson.toJson(a));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                List<Appointment> list = dao.getAllAppointments();
                sendResponse(exchange, 200, gson.toJson(list));
            }
        } else if (method.equals("POST")) {
            Appointment a = gson.fromJson(readRequestBody(exchange), Appointment.class);
            Appointment added = dao.addAppointment(a);
            sendResponse(exchange, 201, gson.toJson(added));
        } else if (method.equals("PUT")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                Appointment a = gson.fromJson(readRequestBody(exchange), Appointment.class);
                Appointment updated = dao.updateAppointment(id, a);
                if (updated != null) sendResponse(exchange, 200, gson.toJson(updated));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else if (method.equals("DELETE")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                if (dao.deleteAppointment(id)) sendResponse(exchange, 204, "");
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else {
            sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
        }
    }
}
