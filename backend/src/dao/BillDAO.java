package dao;

import models.Bill;
import util.Database;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BillDAO {
    public List<Bill> getAllBills() {
        List<Bill> list = new ArrayList<>();
        String sql = "SELECT * FROM bills";
        try (Connection conn = Database.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(map(rs));
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public Bill getBillById(String id) {
        String sql = "SELECT * FROM bills WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Bill addBill(Bill b) {
        String sql = "INSERT INTO bills (id, patient_id, patient_name, doctor_fee, room_charges, medicines, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, b.getId());
            pstmt.setInt(2, b.getPatientId());
            pstmt.setString(3, b.getPatientName());
            pstmt.setDouble(4, b.getDoctorFee());
            pstmt.setDouble(5, b.getRoomCharges());
            pstmt.setDouble(6, b.getMedicines());
            pstmt.setDouble(7, b.getTotal());
            pstmt.setString(8, b.getStatus());
            pstmt.executeUpdate();
            return b;
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Bill updateBill(String id, Bill b) {
        String sql = "UPDATE bills SET patient_id=?, patient_name=?, doctor_fee=?, room_charges=?, medicines=?, total=?, status=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, b.getPatientId());
            pstmt.setString(2, b.getPatientName());
            pstmt.setDouble(3, b.getDoctorFee());
            pstmt.setDouble(4, b.getRoomCharges());
            pstmt.setDouble(5, b.getMedicines());
            pstmt.setDouble(6, b.getTotal());
            pstmt.setString(7, b.getStatus());
            pstmt.setString(8, id);
            if (pstmt.executeUpdate() > 0) {
                b.setId(id);
                return b;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public boolean deleteBill(String id) {
        String sql = "DELETE FROM bills WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    private Bill map(ResultSet rs) throws SQLException {
        Bill b = new Bill();
        b.setId(rs.getString("id"));
        b.setPatientId(rs.getInt("patient_id"));
        b.setPatientName(rs.getString("patient_name"));
        b.setDoctorFee(rs.getDouble("doctor_fee"));
        b.setRoomCharges(rs.getDouble("room_charges"));
        b.setMedicines(rs.getDouble("medicines"));
        b.setTotal(rs.getDouble("total"));
        b.setStatus(rs.getString("status"));
        b.setCreatedAt(rs.getString("created_at"));
        return b;
    }
}
