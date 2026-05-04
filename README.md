# Hospital Management System

A comprehensive web-based Hospital Management System with a Java backend and a modern JavaScript frontend.

## Prerequisites

Before running the application, ensure you have the following installed on your system:

1.  **Java Development Kit (JDK) 11 or higher**
2.  **MySQL Server**
3.  **Modern Web Browser** (Chrome, Firefox, Edge, etc.)

## Database Setup

1.  Open your MySQL terminal or a tool like MySQL Workbench.
2.  Execute the SQL commands found in `backend/schema.sql` to create the database and tables.
    ```bash
    mysql -u root -p < backend/schema.sql
    ```
3.  **Database Credentials**:
    *   Open `backend/src/util/Database.java`.
    *   Update the `USER` and `PASSWORD` constants to match your MySQL configuration.
    ```java
    private static final String USER = "root";
    private static final String PASSWORD = "your_password";
    ```

## How to Run

### Windows (Easy Way)
Simply double-click the `run.bat` file in the project root. This will automatically compile the Java code and start the server.

### Manual Steps (Any OS)
1.  **Open a terminal** in the project root.
2.  **Compile the backend**:
    ```bash
    javac -cp "backend/lib/*" -d backend/bin backend/src/Main.java backend/src/dao/*.java backend/src/handlers/*.java backend/src/models/*.java backend/src/util/*.java
    ```
3.  **Run the backend**:
    ```bash
    java -cp "backend/bin;backend/lib/*" Main
    ```
4.  **Access the Application**:
    Once the server starts (it will say `Backend Server started on port 8080`), open your browser and go to:
    ```
    http://localhost:8080
    ```

## Project Structure

## Project Directory Tree
```text
Hospital_Management_System-main/
├── backend/
│   ├── bin/                 # Compiled .class files (Auto-generated)
│   ├── lib/                 # JAR Dependencies (Gson, MySQL Connector)
│   ├── src/
│   │   ├── dao/             # Data Access Objects (SQL Logic)
│   │   ├── handlers/        # API Request Handlers (Controller logic)
│   │   ├── models/          # POJOs (Data Structures)
│   │   ├── util/            # Database connection utilities
│   │   └── Main.java        # Entry point & Server config
│   └── schema.sql           # Database schema
├── frontend/
│   ├── css/                 # Global styles (styles.css)
│   ├── js/
│   │   ├── components/      # Reusable UI elements (Sidebar, Tables, Modals)
│   │   ├── pages/           # Specific view logic (Dashboard, Patients, etc.)
│   │   ├── services/        # API communication (dataService.js)
│   │   ├── utils/           # Helper functions (Validators)
│   │   ├── app.js           # App initialization
│   │   └── router.js        # SPA Navigation logic
│   ├── index.html           # Main UI container
│   └── login.html           # Auth page
├── README.md                # This documentation
└── run.bat                  # One-click Windows launcher
```

---

## Detailed Technical Reference

### 1. Backend Core (`backend/src/`)

#### Root Package
- **`Main.java`**: The engine of the backend.
  - **Server Creation**: Uses `HttpServer.create()` to bind to port 8080.
  - **Context Mapping**: Every URL starting with `/api/` is mapped to a specific Handler class.
  - **Single Entry**: Even the frontend root `/` is handled here via the `StaticFileHandler`.

#### Data Models (`src/models/`)
- **`Patient.java`**, **`Doctor.java`**, etc.: These are simple containers for data. They use standard Java conventions (private fields + getters/setters) to ensure data integrity. They perfectly match the column names in `schema.sql`.

#### Data Access Layer (`src/dao/`)
*Uses the "DAO Pattern" to decouple business logic from database code.*
- **`PatientDAO.java`**: Contains methods like `getAllPatients()`, `addPatient(Patient p)`, and `deletePatient(int id)`.
- **`JDBC Implementation`**: Every method opens a `Connection` via `Database.getConnection()`, prepares a `PreparedStatement` (to prevent SQL injection), executes it, and closes the connection.

#### API Handlers (`src/handlers/`)
- **`BaseHandler.java`**: The most important utility class in the backend.
  - **CORS Handling**: Automatically adds headers like `Access-Control-Allow-Origin: *` to prevent browser blocks.
  - **JSON Processing**: Uses `new Gson().toJson(data)` to convert Java objects into strings the browser can understand.
  - **Method Routing**: Inspects `exchange.getRequestMethod()` to decide whether to call `handleGet()`, `handlePost()`, etc.
- **`Entity Handlers`** (e.g., `PatientHandler.java`): Inherit from `BaseHandler`. They extract IDs from the URL (e.g., `/api/patients/1`) and call the corresponding DAO.

#### Utilities (`src/util/`)
- **`Database.java`**: Uses `Class.forName("com.mysql.cj.jdbc.Driver")` to load the driver once and provides a standardized way to get a `Connection` object.

---

### 2. Frontend Section (`frontend/`)

- **`js/router.js`**: Implements a Single Page Application (SPA). Instead of loading new HTML files, it uses the browser's `hashchange` event to clear the `#main-content` div and re-render only the necessary component.
- **`js/components/table.js`**: A generic table builder that takes JSON data and headers, then generates a sortable, searchable HTML table dynamically.
- **`js/services/dataService.js`**: Uses the modern `async/await` syntax with `fetch()`. It acts as the "Single Source of Truth" for all data interaction.

---

### 3. Data Flow Deep Dive
1. **Frontend**: `patients.js` calls `DataService.addPatient(patientData)`.
2. **Network**: A `POST` request is sent to `8080/api/patients`.
3. **Backend (Main)**: `Main.java` routes the request to `PatientHandler`.
4. **Backend (Handler)**: `PatientHandler` reads the JSON body and uses `Gson` to turn it into a `Patient` object.
5. **Backend (DAO)**: `PatientDAO` receives the `Patient` object and executes:
   `INSERT INTO patients (name, age, ...) VALUES (?, ?, ...)`
6. **Confirmation**: The `Handler` sends back a JSON response: `{ "success": true }`.
7. **UI**: The `DataService` returns the result to `patients.js`, which then triggers `this.render()` to refresh the view.

---
## Exhaustive Backend Documentation

### 1. Root Package
- **`Main.java`**: The main orchestration class. It uses the `com.sun.net.httpserver` package to build a lightweight web server. It defines the mapping between URL endpoints (like `/api/patients`) and their corresponding Handler classes. It also serves as the entry point for the entire application.

---

### 2. Data Models (`src/models/`)
*These classes define the structure of the data objects used throughout the application.*

- **`Patient.java`**: Represents a hospital patient. Contains fields for `id`, `name`, `age`, `gender`, `phone`, `email`, `address`, `doctor`, `room`, `medicines` (JSON string), `history` (JSON string), and `status`.
- **`Doctor.java`**: Represents a medical professional. Stores `id`, `name`, `specialization`, `availability`, `phone`, and `qualifications`.
- **`Appointment.java`**: Manages the link between patients and doctors. Includes `id`, `patientId`, `patientName`, `doctorId`, `doctorName`, `date`, `time`, `status`, and `notes`.
- **`Medicine.java`**: Represents a pharmaceutical item. Tracks `id`, `name`, `price`, `stock`, `reorderLevel`, and `category`.
- **`Room.java`**: Represents hospital accommodation. Includes `id`, `number`, `type`, `status` (Available/Occupied), `beds`, and `floor`.
- **`Bill.java`**: Represents a financial statement for a patient. Tracks `id` (String UUID), `patientId`, `patientName`, `doctorFee`, `roomCharges`, `medicineCharges`, `total`, and `status`.

---

### 3. Data Access Objects (`src/dao/`)
*These classes contain the raw JDBC logic to communicate with the MySQL database.*

- **`PatientDAO.java`**: Handles CRUD for patients.
  - `getAllPatients()`: Retrieves all records from the `patients` table.
  - `addPatient(Patient)`: Inserts a new patient record.
  - `updatePatient(Patient)`: Updates existing patient details.
  - `deletePatient(int)`: Removes a patient record by ID.
- **`DoctorDAO.java`**: Manages doctor records in the `doctors` table.
- **`AppointmentDAO.java`**: Manages scheduling logic in the `appointments` table.
- **`MedicineDAO.java`**: Handles inventory updates and stock retrieval for the `medicines` table.
- **`RoomDAO.java`**: Manages room allocation and status updates in the `rooms` table.
- **`BillDAO.java`**: Handles the creation and retrieval of billing records in the `bills` table.

---

### 4. API Request Handlers (`src/handlers/`)
*These classes process incoming HTTP requests and return JSON responses.*

- **`BaseHandler.java`**: The abstract base class for all handlers.
  - **CORS Support**: Adds headers to allow the frontend to communicate with the backend.
  - **Response Helpers**: Contains `sendResponse()` and `sendError()` methods to standardize JSON output.
  - **Request Parsing**: Includes logic to read the JSON body from a `POST` or `PUT` request.
- **`StaticFileHandler.java`**: A specialized handler that reads files from the `frontend/` directory and serves them to the browser. It handles MIME types for HTML, CSS, and JS.
- **Entity-Specific Handlers**: (e.g., `PatientHandler.java`, `DoctorHandler.java`)
  - **`handleGet()`**: Routes to the appropriate DAO to fetch data.
  - **`handlePost()`**: Parses incoming JSON, creates a Model object, and saves it via the DAO.
  - **`handlePut()`**: Handles updates for existing records.
  - **`handleDelete()`**: Handles record removal based on ID passed in the URL query.

---

### 5. Utility Package (`src/util/`)
- **`Database.java`**: The central configuration for database connectivity. It uses the `DriverManager` to establish a connection to `jdbc:mysql://localhost:3306/hospital_db`. It is designed as a singleton-style utility to provide connections to all DAOs.

---

## 🛠 API Endpoints Reference

| Entity | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Patients** | `GET` | `/api/patients` | Fetch all patient records |
| **Patients** | `POST` | `/api/patients` | Create a new patient entry |
| **Doctors** | `GET` | `/api/doctors` | Retrieve list of all doctors |
| **Appointments** | `POST` | `/api/appointments` | Book a new medical appointment |
| **Pharmacy** | `GET` | `/api/medicines` | Retrieve current medicine inventory |
| **Rooms** | `GET` | `/api/rooms` | Check room availability status |
| **Billing** | `GET` | `/api/bills` | Access all generated patient bills |

---

## 🔬 Core Implementation Logic

### 1. The "BaseHandler" Pattern
Every API handler extends the `BaseHandler` class. This is a crucial design choice that handles:
- **CORS Headers**: Every response includes `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`, and `Access-Control-Allow-Headers: Content-Type`.
- **Pre-flight Requests**: Handles the `OPTIONS` method used by modern browsers to verify server capabilities.
- **Request Body Reading**: Uses a `BufferedReader` with `InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8)` to reliably read JSON data from the frontend.

### 2. The "DAO-Model" Pattern
- **Decoupling**: The Handlers never write SQL. They only call methods on a DAO object.
- **JDBC Lifecycle**: 
  1. `DriverManager.getConnection()` is called.
  2. `conn.prepareStatement(SQL)` creates a secure, pre-compiled statement.
  3. `pstmt.setObject(index, value)` maps Java variables to SQL placeholders (`?`).
  4. `ResultSet rs = pstmt.executeQuery()` iterates through rows to create `Model` objects.
  5. The `finally` block or "Try-with-resources" ensures the database connection is always closed.

### 3. Frontend Single-Page Logic
- **Hash-based Routing**: In `router.js`, the app listens for `window.addEventListener('hashchange', ...)`.
- **View Lifecycle**: Each page (e.g., `patients.js`) has a `render(container)` method. The router clears the previous content and calls this method for the current route.

---

## 📊 Data Schemas (JSON Examples)

When the Frontend and Backend communicate, they use the following JSON structures:

#### Patient Object
```json
{
  "id": 1,
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "phone": "9876543210",
  "email": "john@example.com",
  "address": "123 Main St",
  "doctor": "Dr. Smith",
  "status": "Inpatient"
}
```

#### Appointment Object
```json
{
  "id": 101,
  "patientId": 1,
  "patientName": "John Doe",
  "doctorId": 5,
  "doctorName": "Dr. Smith",
  "date": "2023-10-25",
  "time": "10:30 AM",
  "status": "Scheduled"
}
```

#### Billing Object
```json
{
  "id": "BILL-123456",
  "patientId": 1,
  "patientName": "John Doe",
  "doctorFee": 500.00,
  "roomCharges": 2000.00,
  "medicineCharges": 350.00,
  "total": 2850.00,
  "status": "Paid"
}
```

---

## 📦 Detailed Library Roles
- **`gson-2.10.1.jar`**:
  - **Serialization**: Converts Java objects (e.g., `new Patient()`) into a JSON string.
  - **Deserialization**: Converts a JSON string from the browser back into a Java object.
- **`mysql-connector-j-8.0.33.jar`**:
  - Acts as the bridge between Java's JDBC API and the MySQL server's native protocol.

---

## 🏗 Setup & Deployment Details

- **Compilation**: The `run.bat` uses the `-cp` (classpath) flag to tell the Java compiler where the external JARs are.
- **Output**: The compiled `.class` files are placed in `backend/bin/` to keep the source directory clean.
- **Root Context**: The backend serves the frontend from the `/` path, meaning `index.html` is accessible directly at `http://localhost:8080/`.


## Troubleshooting
- **Port 8080 already in use**: Change the port number in `backend/src/Main.java` and recompile.
- **MySQL Connection Error**: Ensure MySQL is running and the credentials in `Database.java` are correct.
- **Class Not Found**: Ensure you are including the `lib/*` folder in your classpath (`-cp`) when compiling and running.
