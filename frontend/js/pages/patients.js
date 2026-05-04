// Patients Page
class Patients {
  constructor() {
    this.patients = [];
    this.filteredPatients = [];
    this.container = null;
    this.table = null;
    this.searchPatients = TableComponent.debounce(() => {
      this.filterPatients();
      this.updateTable();
    }, 250);
  }

  async render(container) {
    this.container = container;
    this.patients = await DataService.getPatients();
    this.filteredPatients = this.patients;

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Patient Management</div>
            <div class="card-subtitle">Manage patient records</div>
          </div>
          <button class="btn btn-primary btn-sm" id="addPatientBtn">
            <i class="fas fa-plus"></i> Add Patient
          </button>
        </div>

        <div class="search-bar">
          <input type="text" class="search-input" placeholder="Search by name, phone, or email..." id="patientSearch">
          <select id="patientFilter" class="filter-select">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div id="patientsTableMount"></div>
      </div>
    `;

    this.createTable();
    this.setupEventListeners();
  }

  createTable() {
    this.table = TableComponent.create({
      headers: [
        { label: 'Name', key: 'name', render: value => `<strong>${value || ''}</strong>` },
        { label: 'Age', key: 'age' },
        { label: 'Gender', key: 'gender' },
        { label: 'Phone', key: 'phone' },
        { label: 'Doctor', key: 'doctor' },
        { label: 'Status', key: 'status', render: value => `<span class="badge badge-success">${value || ''}</span>` }
      ],
      data: this.filteredPatients,
      actions: [
        { key: 'view', label: 'View', icon: 'eye', type: 'primary' },
        { key: 'edit', label: 'Edit', icon: 'edit', type: 'secondary' },
        { key: 'delete', label: 'Delete', icon: 'trash', type: 'danger' }
      ],
      searchable: false,
      card: false,
      emptyMessage: 'No data available',
      onAction: (action, patient) => this.handleTableAction(action, patient)
    });

    document.getElementById('patientsTableMount')?.replaceChildren(this.table);
  }

  setupEventListeners() {
    this.container.addEventListener('click', (event) => {
      if (event.target.closest('#addPatientBtn')) this.openAddForm();
    });

    this.container.addEventListener('input', (event) => {
      if (event.target.matches('#patientSearch')) this.searchPatients();
    });

    this.container.addEventListener('change', (event) => {
      if (event.target.matches('#patientFilter')) {
        this.filterPatients();
        this.updateTable();
      }
    });
  }

  handleTableAction(action, patient) {
    if (!patient) return;

    switch(action) {
      case 'view':
        this.openDetailView(patient);
        break;
      case 'edit':
        this.openEditForm(patient);
        break;
      case 'delete':
        this.deletePatient(patient.id);
        break;
    }
  }

  filterPatients() {
    const searchTerm = (document.getElementById('patientSearch')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('patientFilter')?.value || '';

    this.filteredPatients = this.patients.filter(patient => {
      const matchesSearch = (patient.name || '').toLowerCase().includes(searchTerm) ||
                           (patient.phone || '').includes(searchTerm) ||
                           (patient.email || '').toLowerCase().includes(searchTerm);
      const matchesStatus = !statusFilter || patient.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  updateTable() {
    this.table?.updateData(this.filteredPatients);
  }

  async refreshData() {
    this.patients = await DataService.getPatients();
    this.filterPatients();
    this.updateTable();
  }

  async openDetailView(patient) {
    const historyHtml = (patient.history || []).map(h => `<li>${h}</li>`).join('');
    const medicinesHtml = (patient.medicines || []).map(m => `<span class="badge badge-info badge-spaced">${m}</span>`).join('');
    const appointmentHistoryHtml = await this.renderAppointmentHistory(patient.id);

    Modal.open({
      title: `Patient Profile - ${patient.name || ''}`,
      size: 'large',
      body: `
        <div class="detail-grid">
          <div>
            <h4 class="detail-title">Personal Information</h4>
            <p><strong>Name:</strong> ${patient.name || ''}</p>
            <p><strong>Age:</strong> ${patient.age || ''} years</p>
            <p><strong>Gender:</strong> ${patient.gender || ''}</p>
            <p><strong>Phone:</strong> ${patient.phone || ''}</p>
            <p><strong>Email:</strong> ${patient.email || ''}</p>
            <p><strong>Address:</strong> ${patient.address || ''}</p>
          </div>
          <div>
            <h4 class="detail-title">Medical Information</h4>
            <p><strong>Doctor:</strong> ${patient.doctor || ''}</p>
            <p><strong>Room:</strong> ${patient.room || ''}</p>
            <h5 class="detail-subtitle">Current Medicines:</h5>
            <div>${medicinesHtml}</div>
          </div>
        </div>
        <div class="detail-section">
          <h4 class="detail-title">Medical History</h4>
          <ul class="detail-list">
            ${historyHtml}
          </ul>
        </div>
        <div class="detail-section">
          <h4 class="detail-title">Appointment History</h4>
          ${appointmentHistoryHtml}
        </div>
      `,
      footer: '<button class="btn btn-secondary" onclick="Modal.close()">Close</button>'
    });
  }

  async renderAppointmentHistory(patientId) {
    const appointments = (await DataService.getAppointments()).filter(appointment => appointment.patientId === patientId);
    if (appointments.length === 0) {
      return '<p class="text-muted">No appointments recorded.</p>';
    }

    return `
      <ul class="detail-list">
        ${appointments.map(appointment => `
          <li>${appointment.date || ''} ${appointment.time || ''} with ${appointment.doctorName || 'Unassigned'} - ${appointment.status || 'Scheduled'}</li>
        `).join('')}
      </ul>
    `;
  }

  async openAddForm() {
    const doctors = await DataService.getDoctors();
    const doctorOptions = doctors.map(d => `<option value="${d.name}">${d.name}</option>`).join('');

    Modal.open({
      title: 'Add New Patient',
      size: 'medium',
      body: `
        <form id="patientForm">
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" required>
            <div class="error-message" id="nameError"></div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="age">Age *</label>
              <input type="number" id="age" min="1" required>
              <div class="error-message" id="ageError"></div>
            </div>
            <div class="form-group">
              <label for="gender">Gender *</label>
              <select id="gender" required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input type="tel" id="phone" required>
            <div class="error-message" id="phoneError"></div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" required>
            <div class="error-message" id="emailError"></div>
          </div>

          <div class="form-group">
            <label for="address">Address *</label>
            <input type="text" id="address" required>
            <div class="error-message" id="addressError"></div>
          </div>

          <div class="form-group">
            <label for="doctor">Assigned Doctor</label>
            <select id="doctor">
              <option value="">Select a doctor</option>
              ${doctorOptions}
            </select>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Add Patient</button>
      `,
      onOpen: () => {
        document.getElementById('submitBtn').addEventListener('click', () => {
          this.savePatient();
        });
      }
    });
  }

  async openEditForm(patient) {
    const doctors = await DataService.getDoctors();
    const doctorOptions = doctors.map(d => `<option value="${d.name}" ${patient.doctor === d.name ? 'selected' : ''}>${d.name}</option>`).join('');

    Modal.open({
      title: 'Edit Patient',
      size: 'medium',
      body: `
        <form id="patientForm">
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" value="${patient.name}" required>
            <div class="error-message" id="nameError"></div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="age">Age *</label>
              <input type="number" id="age" value="${patient.age}" min="1" required>
              <div class="error-message" id="ageError"></div>
            </div>
            <div class="form-group">
              <label for="gender">Gender *</label>
              <select id="gender" required>
                <option value="Male" ${patient.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${patient.gender === 'Female' ? 'selected' : ''}>Female</option>
                <option value="Other" ${patient.gender === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input type="tel" id="phone" value="${patient.phone}" required>
            <div class="error-message" id="phoneError"></div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" value="${patient.email}" required>
            <div class="error-message" id="emailError"></div>
          </div>

          <div class="form-group">
            <label for="address">Address *</label>
            <input type="text" id="address" value="${patient.address}" required>
            <div class="error-message" id="addressError"></div>
          </div>

          <div class="form-group">
            <label for="doctor">Assigned Doctor</label>
            <select id="doctor">
              <option value="">Select a doctor</option>
              ${doctorOptions}
            </select>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Update Patient</button>
      `,
      onOpen: () => {
        document.getElementById('submitBtn').addEventListener('click', () => {
          this.updatePatient(patient.id);
        });
      }
    });
  }

  async savePatient() {
    const formData = {
      name: document.getElementById('name').value.trim(),
      age: parseInt(document.getElementById('age').value),
      gender: document.getElementById('gender').value,
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      doctor: document.getElementById('doctor').value || 'Unassigned',
      room: 'TBD',
      medicines: [],
      history: [],
      status: 'Active'
    };

    const validation = Validator.validate(formData, ValidationRules.patient);
    if (!validation.isValid) {
      Validator.displayErrors(validation.errors);
      return;
    }

    await DataService.addPatient(formData);
    Modal.close();
    Notification.success('Patient added successfully');
    this.refreshData();
  }

  async updatePatient(patientId) {
    const formData = {
      name: document.getElementById('name').value.trim(),
      age: parseInt(document.getElementById('age').value),
      gender: document.getElementById('gender').value,
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      doctor: document.getElementById('doctor').value || 'Unassigned'
    };

    const validation = Validator.validate(formData, ValidationRules.patient);
    if (!validation.isValid) {
      Validator.displayErrors(validation.errors);
      return;
    }

    await DataService.updatePatient(patientId, formData);
    Modal.close();
    Notification.success('Patient updated successfully');
    this.refreshData();
  }

  deletePatient(patientId) {
    Notification.confirm('Delete Patient', 'Are you sure you want to delete this patient?', async () => {
      await DataService.deletePatient(patientId);
      Notification.success('Patient deleted successfully');
      this.refreshData();
    });
  }
}

window.Patients = Patients;
