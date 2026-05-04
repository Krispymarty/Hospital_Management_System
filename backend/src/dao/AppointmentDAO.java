package dao;

import models.Appointment;
import util.Database;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class AppointmentDAO {
    public List<Appointment> getAllAppointments() {
        List<Appointment> list = new ArrayList<>();
        String sql = "SELECT * FROM appointments";
        try (Connection conn = Database.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(map(rs));
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public Appointment getAppointmentById(int id) {
        String sql = "SELECT * FROM appointments WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Appointment addAppointment(Appointment a) {
        String sql = "INSERT INTO appointments (patient_id, patient_name, doctor_id, doctor_name, date, time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setInt(1, a.getPatientId());
            pstmt.setString(2, a.getPatientName());
            pstmt.setInt(3, a.getDoctorId());
            pstmt.setString(4, a.getDoctorName());
            pstmt.setString(5, a.getDate());
            pstmt.setString(6, a.getTime());
            pstmt.setString(7, a.getStatus());
            pstmt.setString(8, a.getNotes());
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    a.setId(rs.getInt(1));
                    return a;
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Appointment updateAppointment(int id, Appointment a) {
        String sql = "UPDATE appointments SET patient_id=?, patient_name=?, doctor_id=?, doctor_name=?, date=?, time=?, status=?, notes=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, a.getPatientId());
            pstmt.setString(2, a.getPatientName());
            pstmt.setInt(3, a.getDoctorId());
            pstmt.setString(4, a.getDoctorName());
            pstmt.setString(5, a.getDate());
            pstmt.setString(6, a.getTime());
            pstmt.setString(7, a.getStatus());
            pstmt.setString(8, a.getNotes());
            pstmt.setInt(9, id);
            if (pstmt.executeUpdate() > 0) {
                a.setId(id);
                return a;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public boolean deleteAppointment(int id) {
        String sql = "DELETE FROM appointments WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    private Appointment map(ResultSet rs) throws SQLException {
        Appointment a = new Appointment();
        a.setId(rs.getInt("id"));
        a.setPatientId(rs.getInt("patient_id"));
        a.setPatientName(rs.getString("patient_name"));
        a.setDoctorId(rs.getInt("doctor_id"));
        a.setDoctorName(rs.getString("doctor_name"));
        a.setDate(rs.getString("date"));
        a.setTime(rs.getString("time"));
        a.setStatus(rs.getString("status"));
        a.setNotes(rs.getString("notes"));
        a.setCreatedAt(rs.getString("created_at"));
        return a;
    }
}
