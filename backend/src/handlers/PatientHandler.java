package handlers;

import com.sun.net.httpserver.HttpExchange;
import dao.PatientDAO;
import models.Patient;

import java.io.IOException;
import java.util.List;

public class PatientHandler extends BaseHandler {
    private PatientDAO patientDAO = new PatientDAO();

    @Override
    protected void processRequest(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        String[] parts = path.split("/");
        
        // /api/patients
        // /api/patients/1

        if (method.equals("GET")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                Patient patient = patientDAO.getPatientById(id);
                if (patient != null) {
                    sendResponse(exchange, 200, gson.toJson(patient));
                } else {
                    sendResponse(exchange, 404, "{\"error\": \"Patient not found\"}");
                }
            } else {
                List<Patient> patients = patientDAO.getAllPatients();
                sendResponse(exchange, 200, gson.toJson(patients));
            }
        } else if (method.equals("POST")) {
            String body = readRequestBody(exchange);
            Patient newPatient = gson.fromJson(body, Patient.class);
            Patient addedPatient = patientDAO.addPatient(newPatient);
            sendResponse(exchange, 201, gson.toJson(addedPatient));
        } else if (method.equals("PUT")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                String body = readRequestBody(exchange);
                Patient updatedPatient = gson.fromJson(body, Patient.class);
                Patient result = patientDAO.updatePatient(id, updatedPatient);
                if (result != null) {
                    sendResponse(exchange, 200, gson.toJson(result));
                } else {
                    sendResponse(exchange, 404, "{\"error\": \"Patient not found\"}");
                }
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else if (method.equals("DELETE")) {
            if (parts.length > 3) {
                int id = Integer.parseInt(parts[3]);
                boolean deleted = patientDAO.deletePatient(id);
                if (deleted) {
                    sendResponse(exchange, 204, "");
                } else {
                    sendResponse(exchange, 404, "{\"error\": \"Patient not found\"}");
                }
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else {
            sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
        }
    }
}
