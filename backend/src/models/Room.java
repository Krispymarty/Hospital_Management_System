package models;

public class Room {
    private int id;
    private String number;
    private String type;
    private String status;
    private int beds;
    private int floor;
    private String createdAt;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getBeds() { return beds; }
    public void setBeds(int beds) { this.beds = beds; }
    public int getFloor() { return floor; }
    public void setFloor(int floor) { this.floor = floor; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
