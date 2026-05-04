package dao;

import models.Room;
import util.Database;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomDAO {
    public List<Room> getAllRooms() {
        List<Room> list = new ArrayList<>();
        String sql = "SELECT * FROM rooms";
        try (Connection conn = Database.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(map(rs));
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public Room getRoomById(int id) {
        String sql = "SELECT * FROM rooms WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Room addRoom(Room r) {
        String sql = "INSERT INTO rooms (number, type, status, beds, floor) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, r.getNumber());
            pstmt.setString(2, r.getType());
            pstmt.setString(3, r.getStatus());
            pstmt.setInt(4, r.getBeds());
            pstmt.setInt(5, r.getFloor());
            pstmt.executeUpdate();
            try (ResultSet rs = pstmt.getGeneratedKeys()) {
                if (rs.next()) {
                    r.setId(rs.getInt(1));
                    return r;
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public Room updateRoom(int id, Room r) {
        String sql = "UPDATE rooms SET number=?, type=?, status=?, beds=?, floor=? WHERE id=?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, r.getNumber());
            pstmt.setString(2, r.getType());
            pstmt.setString(3, r.getStatus());
            pstmt.setInt(4, r.getBeds());
            pstmt.setInt(5, r.getFloor());
            pstmt.setInt(6, id);
            if (pstmt.executeUpdate() > 0) {
                r.setId(id);
                return r;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public boolean deleteRoom(int id) {
        String sql = "DELETE FROM rooms WHERE id = ?";
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    private Room map(ResultSet rs) throws SQLException {
        Room r = new Room();
        r.setId(rs.getInt("id"));
        r.setNumber(rs.getString("number"));
        r.setType(rs.getString("type"));
        r.setStatus(rs.getString("status"));
        r.setBeds(rs.getInt("beds"));
        r.setFloor(rs.getInt("floor"));
        r.setCreatedAt(rs.getString("created_at"));
        return r;
    }
}
