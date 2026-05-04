package dao;

import models.Medicine;
import util.Database;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MedicineDAO {
    public List<Medicine> getAllMedicines() {
        List<Medicine> list = new ArrayList<>();
        String sql = "SELECT * FROM medicines";
        try (Connection conn = Database.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(map(rs));
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public Medicine getMedicineById(int id) {
        String sql = "SELECT * FROM medicines WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Medicine addMedicine(Medicine m) {
        String sql = "INSERT INTO medicines (name, price, stock, reorder_level, category) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, m.getName());
            pstmt.setDouble(2, m.getPrice());
            pstmt.setInt(3, m.getStock());
            pstmt.setInt(4, m.getReorderLevel());
            pstmt.setString(5, m.getCategory());
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    m.setId(rs.getInt(1));
                    return m;
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Medicine updateMedicine(int id, Medicine m) {
        String sql = "UPDATE medicines SET name=?, price=?, stock=?, reorder_level=?, category=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, m.getName());
            pstmt.setDouble(2, m.getPrice());
            pstmt.setInt(3, m.getStock());
            pstmt.setInt(4, m.getReorderLevel());
            pstmt.setString(5, m.getCategory());
            pstmt.setInt(6, id);
            if (pstmt.executeUpdate() > 0) {
                m.setId(id);
                return m;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public boolean deleteMedicine(int id) {
        String sql = "DELETE FROM medicines WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    private Medicine map(ResultSet rs) throws SQLException {
        Medicine m = new Medicine();
        m.setId(rs.getInt("id"));
        m.setName(rs.getString("name"));
        m.setPrice(rs.getDouble("price"));
        m.setStock(rs.getInt("stock"));
        m.setReorderLevel(rs.getInt("reorder_level"));
        m.setCategory(rs.getString("category"));
        m.setCreatedAt(rs.getString("created_at"));
        return m;
    }
}
