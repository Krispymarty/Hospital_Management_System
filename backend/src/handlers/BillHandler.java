package handlers;

import com.sun.net.httpserver.HttpExchange;
import dao.BillDAO;
import models.Bill;

import java.io.IOException;
import java.util.List;

public class BillHandler extends BaseHandler {
    private BillDAO dao = new BillDAO();

    @Override
    protected void processRequest(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        String[] parts = path.split("/");

        if (method.equals("GET")) {
            if (parts.length > 3) {
                String id = parts[3];
                Bill b = dao.getBillById(id);
                if (b != null) sendResponse(exchange, 200, gson.toJson(b));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                List<Bill> list = dao.getAllBills();
                sendResponse(exchange, 200, gson.toJson(list));
            }
        } else if (method.equals("POST")) {
            Bill b = gson.fromJson(readRequestBody(exchange), Bill.class);
            Bill added = dao.addBill(b);
            sendResponse(exchange, 201, gson.toJson(added));
        } else if (method.equals("PUT")) {
            if (parts.length > 3) {
                String id = parts[3];
                Bill b = gson.fromJson(readRequestBody(exchange), Bill.class);
                Bill updated = dao.updateBill(id, b);
                if (updated != null) sendResponse(exchange, 200, gson.toJson(updated));
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else if (method.equals("DELETE")) {
            if (parts.length > 3) {
                String id = parts[3];
                if (dao.deleteBill(id)) sendResponse(exchange, 204, "");
                else sendResponse(exchange, 404, "{\"error\": \"Not found\"}");
            } else {
                sendResponse(exchange, 400, "{\"error\": \"Missing ID\"}");
            }
        } else {
            sendResponse(exchange, 405, "{\"error\": \"Method not allowed\"}");
        }
    }
}
