// Data Service - Fetch from Java Backend
class DataServiceClass {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api';
    }

    async request(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            if (!response.ok) throw new Error('Network response was not ok');
            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            console.error(`Error during ${method} ${endpoint}:`, error);
            return null;
        }
    }

    // PATIENTS
    async getPatients() { return await this.request('/patients') || []; }
    async getPatientById(id) { return await this.request(`/patients/${id}`); }
    async addPatient(patient) { return await this.request('/patients', 'POST', patient); }
    async updatePatient(id, updates) { return await this.request(`/patients/${id}`, 'PUT', updates); }
    async deletePatient(id) { 
        await this.request(`/patients/${id}`, 'DELETE');
        return true; 
    }

    // DOCTORS
    async getDoctors() { return await this.request('/doctors') || []; }
    async getDoctorById(id) { return await this.request(`/doctors/${id}`); }
    async addDoctor(doctor) { return await this.request('/doctors', 'POST', doctor); }
    async updateDoctor(id, updates) { return await this.request(`/doctors/${id}`, 'PUT', updates); }
    async deleteDoctor(id) { 
        await this.request(`/doctors/${id}`, 'DELETE');
        return true; 
    }

    // APPOINTMENTS
    async getAppointments() { return await this.request('/appointments') || []; }
    async getAppointmentById(id) { return await this.request(`/appointments/${id}`); }
    async addAppointment(appointment) { return await this.request('/appointments', 'POST', appointment); }
    async updateAppointment(id, updates) { return await this.request(`/appointments/${id}`, 'PUT', updates); }
    async deleteAppointment(id) { 
        await this.request(`/appointments/${id}`, 'DELETE');
        return true; 
    }
    async getAvailableSlots(doctorId, date) {
        const allSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
        const appointments = await this.getAppointments();
        const booked = appointments.filter(a => a.doctorId === doctorId && a.date === date).map(a => a.time);
        return allSlots.filter(s => !booked.includes(s));
    }

    // MEDICINES
    async getMedicines() { return await this.request('/medicines') || []; }
    async getMedicineById(id) { return await this.request(`/medicines/${id}`); }
    async addMedicine(medicine) { return await this.request('/medicines', 'POST', medicine); }
    async updateMedicine(id, updates) { return await this.request(`/medicines/${id}`, 'PUT', updates); }
    async deleteMedicine(id) { 
        await this.request(`/medicines/${id}`, 'DELETE');
        return true; 
    }
    async getLowStockMedicines() {
        const medicines = await this.getMedicines();
        return medicines.filter(m => m.stock < m.reorderLevel);
    }

    // ROOMS
    async getRooms() { return await this.request('/rooms') || []; }
    async getRoomById(id) { return await this.request(`/rooms/${id}`); }
    async addRoom(room) { return await this.request('/rooms', 'POST', room); }
    async updateRoom(id, updates) { return await this.request(`/rooms/${id}`, 'PUT', updates); }
    async deleteRoom(id) { 
        await this.request(`/rooms/${id}`, 'DELETE');
        return true; 
    }
    async getAvailableRooms() {
        const rooms = await this.getRooms();
        return rooms.filter(r => r.status === 'available');
    }

    // BILLS
    async getBills() { return await this.request('/bills') || []; }
    async getBillById(id) { return await this.request(`/bills/${id}`); }
    async addBill(bill) { 
        bill.id = 'BILL-' + Date.now();
        return await this.request('/bills', 'POST', bill); 
    }
    async updateBill(id, updates) { return await this.request(`/bills/${id}`, 'PUT', updates); }
    async deleteBill(id) { 
        await this.request(`/bills/${id}`, 'DELETE');
        return true; 
    }

    // STATISTICS
    async getTodayAppointments() {
        const today = new Date().toISOString().split('T')[0];
        const appts = await this.getAppointments();
        return appts.filter(a => a.date === today);
    }
    async getTotalPatients() { return (await this.getPatients()).length; }
    async getAvailableRoomsCount() { return (await this.getAvailableRooms()).length; }
    async getTotalRevenue() {
        const bills = await this.getBills();
        return bills.reduce((sum, b) => sum + (b.total || 0), 0);
    }
    async getMonthlyRevenue() {
        const data = {};
        const bills = await this.getBills();
        bills.forEach(b => {
            const m = new Date(b.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short' });
            data[m] = (data[m] || 0) + (b.total || 0);
        });
        return data;
    }
    async getDailyAppointments() {
        const data = {};
        const appts = await this.getAppointments();
        appts.forEach(a => {
            const d = new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            data[d] = (data[d] || 0) + 1;
        });
        return data;
    }
}

const dataService = new DataServiceClass();
window.DataService = dataService;
