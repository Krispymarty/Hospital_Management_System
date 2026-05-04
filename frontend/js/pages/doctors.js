// Doctors Page
class Doctors {
    constructor() {
        this.doctors = [];
        this.filteredDoctors = [];
        this.container = null;
        this.table = null;
        this.searchDoctors = TableComponent.debounce(() => {
            this.filterDoctors();
            this.updateTable();
        }, 250);
    }

    async render(container) {
        this.container = container;
        this.doctors = await DataService.getDoctors();
        this.filteredDoctors = this.doctors;

        container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Doctor Management</div>
            <div class="card-subtitle">Manage doctor records and specializations</div>
          </div>
          <button class="btn btn-primary btn-sm" id="addDoctorBtn">
            <i class="fas fa-plus"></i> Add Doctor
          </button>
        </div>

        <div class="search-bar">
          <input type="text" class="search-input" placeholder="Search by name or specialization..." id="doctorSearch">
          <select id="specializationFilter" class="filter-select">
            <option value="">All Specializations</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Neurology">Neurology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Oncology">Oncology</option>
            <option value="Radiology">Radiology</option>
            <option value="Urology">Urology</option>
            <option value="ENT">ENT (Ear, Nose, Throat)</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Gynecology">Gynecology</option>
          </select>
        </div>

        <div id="doctorsTableMount"></div>
      </div>
    `;

        this.createTable();
        this.setupEventListeners();
    }

    createTable() {
        this.table = TableComponent.create({
            headers: [
                { label: 'Name', key: 'name', render: value => `<strong>${value || ''}</strong>` },
                { label: 'Specialization', key: 'specialization', render: value => `<span class="badge badge-info">${value || ''}</span>` },
                { label: 'Phone', key: 'phone' },
                { label: 'Availability', key: 'availability' },
                { label: 'Qualifications', key: 'qualifications' }
            ],
            data: this.filteredDoctors,
            actions: [
                { key: 'view', label: 'View', icon: 'eye', type: 'primary' },
                { key: 'edit', label: 'Edit', icon: 'edit', type: 'secondary' },
                { key: 'delete', label: 'Delete', icon: 'trash', type: 'danger' }
            ],
            searchable: false,
            card: false,
            emptyMessage: 'No data available',
            onAction: (action, doctor) => this.handleTableAction(action, doctor)
        });

        document.getElementById('doctorsTableMount')?.replaceChildren(this.table);
    }

    setupEventListeners() {
        this.container.addEventListener('click', (event) => {
            if (event.target.closest('#addDoctorBtn')) this.openAddForm();
        });

        this.container.addEventListener('input', (event) => {
            if (event.target.matches('#doctorSearch')) this.searchDoctors();
        });

        this.container.addEventListener('change', (event) => {
            if (event.target.matches('#specializationFilter')) {
                this.filterDoctors();
                this.updateTable();
            }
        });
    }

    handleTableAction(action, doctor) {
        if (!doctor) return;

        switch (action) {
            case 'view':
                this.openDetailView(doctor);
                break;
            case 'edit':
                this.openEditForm(doctor);
                break;
            case 'delete':
                this.deleteDoctor(doctor.id);
                break;
        }
    }

    filterDoctors() {
        const searchTerm = (document.getElementById('doctorSearch')?.value || '').toLowerCase();
        const specializationFilter = document.getElementById('specializationFilter')?.value || '';

        this.filteredDoctors = this.doctors.filter(doctor => {
            const matchesSearch = (doctor.name || '').toLowerCase().includes(searchTerm) ||
                (doctor.specialization || '').toLowerCase().includes(searchTerm);
            const matchesSpecialization = !specializationFilter || doctor.specialization === specializationFilter;
            return matchesSearch && matchesSpecialization;
        });
    }

    updateTable() {
        this.table?.updateData(this.filteredDoctors);
    }

    async refreshData() {
        this.doctors = await DataService.getDoctors();
        this.filterDoctors();
        this.updateTable();
    }

    async openDetailView(doctor) {
        Modal.open({
            title: `Doctor Profile - ${doctor.name || ''}`,
            size: 'medium',
            body: `
        <div class="grid">
          <div>
            <h5 class="section-kicker">Personal Information</h5>
            <p><strong>Name:</strong> ${doctor.name || ''}</p>
            <p><strong>Phone:</strong> ${doctor.phone || ''}</p>
          </div>
          <div>
            <h5 class="section-kicker">Professional Details</h5>
            <p><strong>Specialization:</strong> <span class="badge badge-info">${doctor.specialization || ''}</span></p>
            <p><strong>Qualifications:</strong> ${doctor.qualifications || ''}</p>
            <p><strong>Availability:</strong> ${doctor.availability || ''}</p>
          </div>
        </div>
      `,
            footer: '<button class="btn btn-secondary" onclick="Modal.close()">Close</button>'
        });
    }

    async openAddForm() {
        Modal.open({
            title: 'Add New Doctor',
            size: 'medium',
            body: `
        <form id="doctorForm">
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" placeholder="Dr. John Smith" required>
            <div class="error-message" id="nameError"></div>
          </div>

          <div class="form-group">
            <label for="specialization">Specialization *</label>
            <select id="specialization" required>
              <option value="">Select Specialization</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Neurology">Neurology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Oncology">Oncology</option>
              <option value="Radiology">Radiology</option>
              <option value="Urology">Urology</option>
              <option value="ENT">ENT (Ear, Nose, Throat)</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Gynecology">Gynecology</option>
              <option value="General">General Practitioner</option>
            </select>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input type="tel" id="phone" placeholder="555-0100" required>
            <div class="error-message" id="phoneError"></div>
          </div>

          <div class="form-group">
            <label for="availability">Availability *</label>
            <input type="text" id="availability" placeholder="Mon-Fri, 9AM-5PM" required>
          </div>

          <div class="form-group">
            <label for="qualifications">Qualifications *</label>
            <textarea id="qualifications" placeholder="MD, Board Certified..." required></textarea>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Add Doctor</button>
      `,
            onOpen: () => {
                document.getElementById('submitBtn').addEventListener('click', () => {
                    this.saveDoctor();
                });
            }
        });
    }

    async openEditForm(doctor) {
        Modal.open({
            title: 'Edit Doctor',
            size: 'medium',
            body: `
        <form id="doctorForm">
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" value="${doctor.name}" required>
            <div class="error-message" id="nameError"></div>
          </div>

          <div class="form-group">
            <label for="specialization">Specialization *</label>
            <select id="specialization" required>
              <option value="Cardiology" ${doctor.specialization === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
              <option value="Orthopedics" ${doctor.specialization === 'Orthopedics' ? 'selected' : ''}>Orthopedics</option>
              <option value="Pediatrics" ${doctor.specialization === 'Pediatrics' ? 'selected' : ''}>Pediatrics</option>
              <option value="Neurology" ${doctor.specialization === 'Neurology' ? 'selected' : ''}>Neurology</option>
              <option value="Dermatology" ${doctor.specialization === 'Dermatology' ? 'selected' : ''}>Dermatology</option>
              <option value="Oncology" ${doctor.specialization === 'Oncology' ? 'selected' : ''}>Oncology</option>
              <option value="Radiology" ${doctor.specialization === 'Radiology' ? 'selected' : ''}>Radiology</option>
              <option value="Urology" ${doctor.specialization === 'Urology' ? 'selected' : ''}>Urology</option>
              <option value="ENT" ${doctor.specialization === 'ENT' ? 'selected' : ''}>ENT (Ear, Nose, Throat)</option>
              <option value="Psychiatry" ${doctor.specialization === 'Psychiatry' ? 'selected' : ''}>Psychiatry</option>
              <option value="Gynecology" ${doctor.specialization === 'Gynecology' ? 'selected' : ''}>Gynecology</option>
              <option value="General" ${doctor.specialization === 'General' ? 'selected' : ''}>General Practitioner</option>
            </select>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input type="tel" id="phone" value="${doctor.phone}" required>
            <div class="error-message" id="phoneError"></div>
          </div>

          <div class="form-group">
            <label for="availability">Availability *</label>
            <input type="text" id="availability" value="${doctor.availability}" required>
          </div>

          <div class="form-group">
            <label for="qualifications">Qualifications *</label>
            <textarea id="qualifications" required>${doctor.qualifications}</textarea>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Update Doctor</button>
      `,
            onOpen: () => {
                document.getElementById('submitBtn').addEventListener('click', () => {
                    this.updateDoctor(doctor.id);
                });
            }
        });
    }

    async saveDoctor() {
        const formData = {
            name: document.getElementById('name').value.trim(),
            specialization: document.getElementById('specialization').value,
            phone: document.getElementById('phone').value.trim(),
            availability: document.getElementById('availability').value.trim(),
            qualifications: document.getElementById('qualifications').value.trim()
        };

        const validation = Validator.validate(formData, ValidationRules.doctor);
        if (!validation.isValid) {
            Validator.displayErrors(validation.errors);
            return;
        }

        await DataService.addDoctor(formData);
        Modal.close();
        Notification.success('Doctor added successfully');
        this.refreshData();
    }

    async updateDoctor(doctorId) {
        const formData = {
            name: document.getElementById('name').value.trim(),
            specialization: document.getElementById('specialization').value,
            phone: document.getElementById('phone').value.trim(),
            availability: document.getElementById('availability').value.trim(),
            qualifications: document.getElementById('qualifications').value.trim()
        };

        const validation = Validator.validate(formData, ValidationRules.doctor);
        if (!validation.isValid) {
            Validator.displayErrors(validation.errors);
            return;
        }

        await DataService.updateDoctor(doctorId, formData);
        Modal.close();
        Notification.success('Doctor updated successfully');
        this.refreshData();
    }

    deleteDoctor(doctorId) {
        Notification.confirm('Delete Doctor', 'Are you sure you want to delete this doctor?', async () => {
            await DataService.deleteDoctor(doctorId);
            Notification.success('Doctor deleted successfully');
            this.refreshData();
        });
    }
}

window.Doctors = Doctors;
