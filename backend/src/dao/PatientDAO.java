package dao;

import models.Patient;
import util.Database;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PatientDAO {
    private Gson gson = new Gson();

    public List<Patient> getAllPatients() {
        List<Patient> patients = new ArrayList<>();
        String sql = "SELECT * FROM patients";
        try (Connection conn = Database.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                patients.add(mapResultSetToPatient(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return patients;
    }

    public Patient getPatientById(int id) {
        String sql = "SELECT * FROM patients WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToPatient(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Patient addPatient(Patient patient) {
        String sql = "INSERT INTO patients (name, age, gender, phone, email, address, doctor, room, medicines, history, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            setPreparedStatement(pstmt, patient);
            pstmt.executeUpdate();
            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    patient.setId(generatedKeys.getInt(1));
                    return patient;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Patient updatePatient(int id, Patient patient) {
        String sql = "UPDATE patients SET name=?, age=?, gender=?, phone=?, email=?, address=?, doctor=?, room=?, medicines=?, history=?, status=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            setPreparedStatement(pstmt, patient);
            pstmt.setInt(12, id);
            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                patient.setId(id);
                return patient;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean deletePatient(int id) {
        String sql = "DELETE FROM patients WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private void setPreparedStatement(PreparedStatement pstmt, Patient patient) throws SQLException {
        pstmt.setString(1, patient.getName());
        pstmt.setInt(2, patient.getAge());
        pstmt.setString(3, patient.getGender());
        pstmt.setString(4, patient.getPhone());
        pstmt.setString(5, patient.getEmail());
        pstmt.setString(6, patient.getAddress());
        pstmt.setString(7, patient.getDoctor());
        pstmt.setString(8, patient.getRoom());
        pstmt.setString(9, patient.getMedicines() != null ? gson.toJson(patient.getMedicines()) : "[]");
        pstmt.setString(10, patient.getHistory() != null ? gson.toJson(patient.getHistory()) : "[]");
        pstmt.setString(11, patient.getStatus());
    }

    private Patient mapResultSetToPatient(ResultSet rs) throws SQLException {
        Patient patient = new Patient();
        patient.setId(rs.getInt("id"));
        patient.setName(rs.getString("name"));
        patient.setAge(rs.getInt("age"));
        patient.setGender(rs.getString("gender"));
        patient.setPhone(rs.getString("phone"));
        patient.setEmail(rs.getString("email"));
        patient.setAddress(rs.getString("address"));
        patient.setDoctor(rs.getString("doctor"));
        patient.setRoom(rs.getString("room"));
        patient.setMedicines(gson.fromJson(rs.getString("medicines"), new TypeToken<List<String>>(){}.getType()));
        patient.setHistory(gson.fromJson(rs.getString("history"), new TypeToken<List<String>>(){}.getType()));
        patient.setStatus(rs.getString("status"));
        patient.setCreatedAt(rs.getString("created_at"));
        return patient;
    }
}
