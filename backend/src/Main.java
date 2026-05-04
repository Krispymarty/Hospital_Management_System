import com.sun.net.httpserver.HttpServer;
import handlers.*;

import java.io.IOException;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) {
        try {
            int port = 8080;
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            server.createContext("/api/patients", new PatientHandler());
            server.createContext("/api/doctors", new DoctorHandler());
            server.createContext("/api/appointments", new AppointmentHandler());
            server.createContext("/api/medicines", new MedicineHandler());
            server.createContext("/api/rooms", new RoomHandler());
            server.createContext("/api/bills", new BillHandler());
            server.createContext("/", new StaticFileHandler("frontend"));

            server.setExecutor(null); // creates a default executor
            server.start();

            System.out.println("Backend Server started on port " + port);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
