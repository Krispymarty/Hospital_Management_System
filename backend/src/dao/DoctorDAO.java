package dao;

import models.Doctor;
import util.Database;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DoctorDAO {
    public List<Doctor> getAllDoctors() {
        List<Doctor> list = new ArrayList<>();
        String sql = "SELECT * FROM doctors";
        try (Connection conn = Database.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                list.add(mapResultSetToDoctor(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public Doctor getDoctorById(int id) {
        String sql = "SELECT * FROM doctors WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return mapResultSetToDoctor(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Doctor addDoctor(Doctor d) {
        String sql = "INSERT INTO doctors (name, specialization, availability, phone, qualifications) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, d.getName());
            pstmt.setString(2, d.getSpecialization());
            pstmt.setString(3, d.getAvailability());
            pstmt.setString(4, d.getPhone());
            pstmt.setString(5, d.getQualifications());
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    d.setId(rs.getInt(1));
                    return d;
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Doctor updateDoctor(int id, Doctor d) {
        String sql = "UPDATE doctors SET name=?, specialization=?, availability=?, phone=?, qualifications=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, d.getName());
            pstmt.setString(2, d.getSpecialization());
            pstmt.setString(3, d.getAvailability());
            pstmt.setString(4, d.getPhone());
            pstmt.setString(5, d.getQualifications());
            pstmt.setInt(6, id);
            if (pstmt.executeUpdate() > 0) {
                d.setId(id);
                return d;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public boolean deleteDoctor(int id) {
        String sql = "DELETE FROM doctors WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    private Doctor mapResultSetToDoctor(ResultSet rs) throws SQLException {
        Doctor d = new Doctor();
        d.setId(rs.getInt("id"));
        d.setName(rs.getString("name"));
        d.setSpecialization(rs.getString("specialization"));
        d.setAvailability(rs.getString("availability"));
        d.setPhone(rs.getString("phone"));
        d.setQualifications(rs.getString("qualifications"));
        d.setCreatedAt(rs.getString("created_at"));
        return d;
    }
}
