// Appointments Page
class Appointments {
    constructor() {
        this.appointments = [];
        this.filteredAppointments = [];
        this.currentDate = new Date();
        this.selectedDate = null;
        this.container = null;
        this.searchAppointments = TableComponent.debounce(() => {
            this.filterAppointments();
            this.renderAppointmentsList();
        }, 250);
    }

    async render(container) {
        this.container = container;
        this.appointments = await DataService.getAppointments();
        this.filteredAppointments = this.appointments;

        container.innerHTML = `
      <div class="appointments-layout">
        <!-- CALENDAR -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Calendar</div>
          </div>
          <div id="calendarContainer"></div>
        </div>

        <!-- APPOINTMENTS LIST -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Appointments</div>
              <div class="card-subtitle">Scheduled and pending appointments</div>
            </div>
            <button class="btn btn-primary btn-sm" id="bookAppointmentBtn">
              <i class="fas fa-plus"></i> Book Appointment
            </button>
          </div>

          <div class="search-bar">
            <input type="text" class="search-input" placeholder="Search by patient or doctor..." id="appointmentSearch">
            <select id="appointmentStatusFilter" class="filter-select">
              <option value="">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div id="appointmentsList"></div>
        </div>
      </div>
    `;

        this.renderCalendar();
        this.renderAppointmentsList();
        this.setupEventListeners();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevMonthDays = firstDay.getDay();

        let html = `
      <div class="calendar">
        <div class="calendar-header">
          <div>
            <span class="calendar-title">${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div class="calendar-nav">
            <button id="prevMonth" type="button"><i class="fas fa-chevron-left"></i></button>
            <button id="nextMonth" type="button"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>

        <div class="weekdays">
          <div class="weekday">Sun</div>
          <div class="weekday">Mon</div>
          <div class="weekday">Tue</div>
          <div class="weekday">Wed</div>
          <div class="weekday">Thu</div>
          <div class="weekday">Fri</div>
          <div class="weekday">Sat</div>
        </div>

        <div class="calendar-days">
    `;

        // Previous month days
        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const day = new Date(year, month, -i).getDate();
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const hasAppointments = this.appointments.some(a => a.date === dateStr);
            const isSelected = this.selectedDate ? dateStr === this.selectedDate : this.isToday(date);

            html += `
        <div class="calendar-day ${isSelected ? 'selected' : ''} ${hasAppointments ? 'highlighted' : ''}" data-date="${dateStr}">
          ${day}
        </div>
      `;
        }

        // Next month days
        const remainingDays = 42 - (prevMonthDays + lastDay.getDate());
        for (let day = 1; day <= remainingDays; day++) {
            html += `<div class="calendar-day other-month">${day}</div>`;
        }

        html += `
        </div>
      </div>
    `;

        document.getElementById('calendarContainer').innerHTML = html;

    }

    renderAppointmentsList() {
        if (this.filteredAppointments.length === 0) {
            document.getElementById('appointmentsList').innerHTML = '<p class="empty-list">No appointments found</p>';
            return;
        }

        let html = '<div class="appointment-list">';
        this.filteredAppointments.slice(0, 10).forEach(appointment => {
            const statusColor = {
                'Scheduled': 'info',
                'Completed': 'success',
                'Cancelled': 'danger'
            }[appointment.status] || 'info';

            html += `
        <div class="appointment-item" data-id="${appointment.id}">
          <div class="appointment-item-header">
            <div>
              <strong>${appointment.patientName || ''}</strong><br>
              <small class="text-muted">with ${appointment.doctorName || ''}</small>
            </div>
            <span class="badge badge-${statusColor}">${appointment.status || ''}</span>
          </div>
          <div class="appointment-meta">
            <div><i class="fas fa-calendar"></i> ${appointment.date || ''}</div>
            <div><i class="fas fa-clock"></i> ${appointment.time || ''}</div>
          </div>
          <div class="appointment-actions">
            <button class="btn btn-sm btn-secondary" data-action="edit" data-id="${appointment.id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" data-action="delete" data-id="${appointment.id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
        });
        html += '</div>';

        document.getElementById('appointmentsList').innerHTML = html;
    }

    setupEventListeners() {
        this.container.addEventListener('click', (event) => {
            if (event.target.closest('#bookAppointmentBtn')) {
                this.openBookingForm();
                return;
            }

            if (event.target.closest('#prevMonth')) {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
                return;
            }

            if (event.target.closest('#nextMonth')) {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
                return;
            }

            const calendarDay = event.target.closest('.calendar-day:not(.other-month)');
            if (calendarDay) {
                this.filterAppointmentsByDate(calendarDay.dataset.date);
                return;
            }

            const actionButton = event.target.closest('[data-action]');
            if (actionButton) {
                const action = actionButton.dataset.action;
                const id = parseInt(actionButton.dataset.id);
                const appointment = this.appointments.find(a => a.id === id);

                if (action === 'edit') this.openEditForm(appointment);
                if (action === 'delete') this.deleteAppointment(id);
            }
        });

        this.container.addEventListener('input', (event) => {
            if (event.target.matches('#appointmentSearch')) this.searchAppointments();
        });

        this.container.addEventListener('change', (event) => {
            if (event.target.matches('#appointmentStatusFilter')) {
                this.filterAppointments();
                this.renderAppointmentsList();
            }
        });
    }

    filterAppointmentsByDate(date) {
        this.selectedDate = date;
        this.filteredAppointments = this.appointments.filter(a => a.date === date);
        this.renderCalendar();
        this.renderAppointmentsList();
    }

    filterAppointments() {
        this.selectedDate = null;
        const searchTerm = (document.getElementById('appointmentSearch')?.value || '').toLowerCase();
        const statusFilter = document.getElementById('appointmentStatusFilter')?.value || '';

        this.filteredAppointments = this.appointments.filter(appt => {
            const matchesSearch = (appt.patientName || '').toLowerCase().includes(searchTerm) ||
                (appt.doctorName || '').toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || appt.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }

    async refreshData() {
        this.appointments = await DataService.getAppointments();
        if (this.selectedDate) {
            this.filteredAppointments = this.appointments.filter(a => a.date === this.selectedDate);
        } else {
            this.filterAppointments();
        }
        this.renderCalendar();
        this.renderAppointmentsList();
    }

    async openBookingForm() {
        const patients = await DataService.getPatients();
        const doctors = await DataService.getDoctors();

        const patientOptions = patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        const doctorOptions = doctors.map(d => `<option value="${d.id}">${d.name} (${d.specialization})</option>`).join('');

        Modal.open({
            title: 'Book Appointment',
            size: 'medium',
            body: `
        <form id="appointmentForm">
          <div class="form-group">
            <label for="patientId">Patient *</label>
            <select id="patientId" required>
              <option value="">Select Patient</option>
              ${patientOptions}
            </select>
            <div class="error-message" id="patientIdError"></div>
          </div>

          <div class="form-group">
            <label for="doctorId">Doctor *</label>
            <select id="doctorId" required>
              <option value="">Select Doctor</option>
              ${doctorOptions}
            </select>
            <div class="error-message" id="doctorIdError"></div>
          </div>

          <div class="form-group">
            <label for="date">Date *</label>
            <input type="date" id="date" required>
            <div class="error-message" id="dateError"></div>
          </div>

          <div class="form-group">
            <label for="time">Time Slot *</label>
            <select id="time" required>
              <option value="">Select Time</option>
            </select>
            <div class="error-message" id="timeError"></div>
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea id="notes" placeholder="Additional notes..."></textarea>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Book Appointment</button>
      `,
            onOpen: () => {
                const dateInput = document.getElementById('date');
                const timeSelect = document.getElementById('time');
                const doctorSelect = document.getElementById('doctorId');

                // Set minimum date to today
                const today = new Date().toISOString().split('T')[0];
                dateInput.min = today;
                dateInput.value = today;

                // Update available slots when date or doctor changes
                const updateSlots = async () => {
                    const selectedDate = dateInput.value;
                    const selectedDoctor = parseInt(doctorSelect.value);

                    if (selectedDate && selectedDoctor) {
                        const availableSlots = await DataService.getAvailableSlots(selectedDoctor, selectedDate);
                        timeSelect.innerHTML = '<option value="">Select Time</option>';
                        availableSlots.forEach(slot => {
                            timeSelect.innerHTML += `<option value="${slot}">${slot}</option>`;
                        });
                        timeSelect.classList.toggle('slot-ready', availableSlots.length > 0);
                    }
                };

                dateInput.addEventListener('change', updateSlots);
                doctorSelect.addEventListener('change', updateSlots);

                document.getElementById('submitBtn').addEventListener('click', () => {
                    this.saveAppointment();
                });
            }
        });
    }

    async openEditForm(appointment) {
        const patients = await DataService.getPatients();
        const doctors = await DataService.getDoctors();

        const patientOptions = patients.map(p => `<option value="${p.id}" ${appointment.patientId === p.id ? 'selected' : ''}>${p.name}</option>`).join('');
        const doctorOptions = doctors.map(d => `<option value="${d.id}" ${appointment.doctorId === d.id ? 'selected' : ''}>${d.name} (${d.specialization})</option>`).join('');

        Modal.open({
            title: 'Edit Appointment',
            size: 'medium',
            body: `
        <form id="appointmentForm">
          <div class="form-group">
            <label for="patientId">Patient *</label>
            <select id="patientId" required>
              ${patientOptions}
            </select>
          </div>

          <div class="form-group">
            <label for="doctorId">Doctor *</label>
            <select id="doctorId" required>
              ${doctorOptions}
            </select>
          </div>

          <div class="form-group">
            <label for="date">Date *</label>
            <input type="date" id="date" value="${appointment.date}" required>
          </div>

          <div class="form-group">
            <label for="time">Time Slot *</label>
            <select id="time" required>
              <option value="${appointment.time}" selected>${appointment.time}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="status">Status *</label>
            <select id="status" required>
              <option value="Scheduled" ${appointment.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="Completed" ${appointment.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Cancelled" ${appointment.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea id="notes">${appointment.notes || ''}</textarea>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Update Appointment</button>
      `,
            onOpen: () => {
                document.getElementById('submitBtn').addEventListener('click', () => {
                    this.updateAppointment(appointment.id);
                });
            }
        });
    }

    async saveAppointment() {
        const formData = {
            patientId: parseInt(document.getElementById('patientId').value),
            doctorId: parseInt(document.getElementById('doctorId').value),
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            notes: document.getElementById('notes').value || ''
        };

        // Get names
        const patient = await DataService.getPatientById(formData.patientId);
        const doctor = await DataService.getDoctorById(formData.doctorId);

        if (!patient || !doctor) {
            Notification.error('Invalid patient or doctor selected');
            return;
        }

        const validation = Validator.validate(formData, ValidationRules.appointment);
        if (!validation.isValid) {
            Validator.displayErrors(validation.errors);
            return;
        }

        const appointment = {
            ...formData,
            patientName: patient.name,
            doctorName: doctor.name,
            status: 'Scheduled'
        };

        await DataService.addAppointment(appointment);
        Modal.close();
        Notification.success('Appointment booked successfully');
        this.refreshData();
    }

    async updateAppointment(appointmentId) {
        const formData = {
            patientId: parseInt(document.getElementById('patientId').value),
            doctorId: parseInt(document.getElementById('doctorId').value),
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            status: document.getElementById('status').value,
            notes: document.getElementById('notes').value || ''
        };

        const patient = await DataService.getPatientById(formData.patientId);
        const doctor = await DataService.getDoctorById(formData.doctorId);

        await DataService.updateAppointment(appointmentId, {
            ...formData,
            patientName: patient.name,
            doctorName: doctor.name
        });

        Modal.close();
        Notification.success('Appointment updated successfully');
        this.refreshData();
    }

    deleteAppointment(appointmentId) {
        Notification.confirm('Delete Appointment', 'Are you sure you want to delete this appointment?', async () => {
            await DataService.deleteAppointment(appointmentId);
            Notification.success('Appointment deleted successfully');
            this.refreshData();
        });
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }
}

window.Appointments = Appointments;
