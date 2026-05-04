// Billing Page
class Billing {
    constructor() {
        this.bills = [];
        this.filteredBills = [];
        this.container = null;
        this.table = null;
        this.searchBills = TableComponent.debounce(() => {
            this.filterBills();
            this.updateTable();
        }, 250);
    }

    async render(container) {
        this.container = container;
        this.bills = await DataService.getBills();
        this.filteredBills = this.bills;
        const totalRevenue = this.bills.reduce((sum, bill) => sum + (bill.total || 0), 0);

        container.innerHTML = `
      <!-- STATISTICS -->
      <div class="stats-grid">
        <div class="stat-card info">
          <div class="stat-icon text-info"><i class="fas fa-receipt"></i></div>
          <div class="stat-label">Total Bills</div>
          <div class="stat-value">${this.bills.length}</div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon text-success"><i class="fas fa-rupee-sign"></i></div>
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">₹${totalRevenue.toFixed(2)}</div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon text-warning"><i class="fas fa-file-invoice"></i></div>
          <div class="stat-label">Paid Bills</div>
          <div class="stat-value">${this.bills.filter(b => b.status === 'Paid').length}</div>
        </div>
      </div>

      <!-- GENERATE BILL -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Generate New Bill</div>
          <button class="btn btn-primary btn-sm" id="generateBillBtn">
            <i class="fas fa-plus"></i> New Bill
          </button>
        </div>
      </div>

      <!-- BILLS LIST -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Bills History</div>
        </div>

        <div class="search-bar">
          <input type="text" class="search-input" placeholder="Search by bill ID, patient, or status..." id="billSearch">
          <select id="billStatusFilter" class="filter-select">
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div id="billsTableMount"></div>
      </div>
    `;

        this.createTable();
        this.setupEventListeners();
    }

    createTable() {
        this.table = TableComponent.create({
            headers: [
                { label: 'Bill ID', key: 'id', render: value => `<strong>${value || ''}</strong>` },
                { label: 'Patient Name', key: 'patientName' },
                { label: 'Doctor Fee', key: 'doctorFee', render: value => `₹${Number(value || 0).toFixed(2)}` },
                { label: 'Room Charges', key: 'roomCharges', render: value => `₹${Number(value || 0).toFixed(2)}` },
                { label: 'Medicines', key: 'medicines', render: value => `₹${Number(value || 0).toFixed(2)}` },
                { label: 'Total', key: 'total', render: value => `<strong>₹${Number(value || 0).toFixed(2)}</strong>` },
                { label: 'Status', key: 'status', render: value => `<span class="badge badge-${value === 'Paid' ? 'success' : 'warning'}">${value || ''}</span>` }
            ],
            data: this.filteredBills,
            actions: [
                { key: 'view', label: 'View', icon: 'eye', type: 'primary' },
                { key: 'print', label: 'Print', icon: 'print', type: 'info' },
                { key: 'download', label: 'Download PDF', icon: 'download', type: 'success' },
                { key: 'delete', label: 'Delete', icon: 'trash', type: 'danger' }
            ],
            searchable: false,
            card: false,
            emptyMessage: 'No data available',
            onAction: (action, bill) => this.handleTableAction(action, bill)
        });

        document.getElementById('billsTableMount')?.replaceChildren(this.table);
    }

    setupEventListeners() {
        this.container.addEventListener('click', (event) => {
            if (event.target.closest('#generateBillBtn')) this.openGenerateBillForm();
        });

        this.container.addEventListener('input', (event) => {
            if (event.target.matches('#billSearch')) this.searchBills();
        });

        this.container.addEventListener('change', (event) => {
            if (event.target.matches('#billStatusFilter')) {
                this.filterBills();
                this.updateTable();
            }
        });
    }

    handleTableAction(action, bill) {
        if (!bill) return;

        switch (action) {
            case 'view':
                this.viewBill(bill);
                break;
            case 'print':
                this.printBill(bill);
                break;
            case 'download':
                this.downloadPDF(bill);
                break;
            case 'delete':
                this.deleteBill(bill.id);
                break;
        }
    }

    filterBills() {
        const searchTerm = (document.getElementById('billSearch')?.value || '').toLowerCase();
        const statusFilter = document.getElementById('billStatusFilter')?.value || '';

        this.filteredBills = this.bills.filter(bill => {
            const matchesSearch = (bill.id || '').toLowerCase().includes(searchTerm) ||
                (bill.patientName || '').toLowerCase().includes(searchTerm) ||
                (bill.status || '').toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || bill.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }

    updateTable() {
        this.table?.updateData(this.filteredBills);
    }

    async refreshData() {
        this.bills = await DataService.getBills();
        this.filterBills();
        this.updateTable();
    }

    async openGenerateBillForm() {
        const patients = await DataService.getPatients();
        const medicines = await DataService.getMedicines();
        const patientOptions = patients.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        const medicineOptions = medicines.map(m => `<option value="${m.id}">${m.name} - ₹${Number(m.price || 0).toFixed(2)}</option>`).join('');

        Modal.open({
            title: 'Generate New Bill',
            size: 'medium',
            body: `
        <form id="billForm">
          <div class="form-group">
            <label for="patientId">Select Patient *</label>
            <select id="patientId" required>
              <option value="">-- Choose Patient --</option>
              ${patientOptions}
            </select>
          </div>

          <div class="form-group">
            <label for="doctorFee">Doctor Fee (₹) *</label>
            <input type="number" id="doctorFee" step="0.01" min="0" placeholder="0.00" required>
          </div>

          <div class="form-group">
            <label for="roomCharges">Room Charges (₹) *</label>
            <input type="number" id="roomCharges" step="0.01" min="0" placeholder="0.00" required>
            <div class="form-help" id="roomChargeHelp"></div>
          </div>

          <div class="form-group">
            <label for="medicineIds">Medicines</label>
            <select id="medicineIds" multiple class="multi-select">
              ${medicineOptions}
            </select>
            <div class="form-help">Hold Ctrl or Cmd to select multiple medicines.</div>
          </div>

          <div class="form-group">
            <label for="medicines">Medicines Cost (₹) *</label>
            <input type="number" id="medicines" step="0.01" min="0" placeholder="0.00" required>
            <div class="form-help" id="medicineChargeHelp"></div>
          </div>

          <div class="form-group">
            <label for="status">Payment Status *</label>
            <select id="status" required>
              <option value="Pending">Pending</option>
              <option value="Paid" selected>Paid</option>
            </select>
          </div>

          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea id="notes" placeholder="Additional notes..."></textarea>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Generate Bill</button>
      `,
            onOpen: () => {
                const patientSelect = document.getElementById('patientId');
                const medicineSelect = document.getElementById('medicineIds');
                const updateCharges = () => this.updateBillCharges();

                patientSelect?.addEventListener('change', updateCharges);
                medicineSelect?.addEventListener('change', updateCharges);

                document.getElementById('submitBtn').addEventListener('click', () => {
                    this.saveBill();
                });
            }
        });
    }

    async saveBill() {
        const patientId = parseInt(document.getElementById('patientId').value);
        const doctorFee = parseFloat(document.getElementById('doctorFee').value);
        const roomCharges = parseFloat(document.getElementById('roomCharges').value);
        const medicines = parseFloat(document.getElementById('medicines').value);
        const status = document.getElementById('status').value;

        if (!patientId || isNaN(doctorFee) || isNaN(roomCharges) || isNaN(medicines)) {
            Notification.error('Please fill all required fields');
            return;
        }

        const patient = await DataService.getPatientById(patientId);
        const total = doctorFee + roomCharges + medicines;
        const selectedMedicines = await this.getSelectedMedicines();
        const selectedMedicineNames = selectedMedicines.map(m => m.name);

        const bill = {
            patientId: patientId,
            patientName: patient.name,
            doctorFee: doctorFee,
            roomCharges: roomCharges,
            medicines: medicines,
            medicineNames: selectedMedicineNames,
            total: total,
            status: status
        };

        await DataService.addBill(bill);
        Modal.close();
        Notification.success('Bill generated successfully');
        this.refreshData();
    }

    async updateBillCharges() {
        const patientId = parseInt(document.getElementById('patientId')?.value);
        const patient = await DataService.getPatientById(patientId);
        const roomCharges = await this.getRoomChargeForPatient(patient);
        const medicineCharges = await this.getSelectedMedicineTotal() + await this.getPatientMedicineTotal(patient);

        const roomInput = document.getElementById('roomCharges');
        const medicineInput = document.getElementById('medicines');
        const roomHelp = document.getElementById('roomChargeHelp');
        const medicineHelp = document.getElementById('medicineChargeHelp');

        if (roomInput) roomInput.value = roomCharges.toFixed(2);
        if (medicineInput) medicineInput.value = medicineCharges.toFixed(2);
        if (roomHelp) roomHelp.textContent = patient?.room ? `Based on assigned room ${patient.room}` : '';
        if (medicineHelp) medicineHelp.textContent = medicineCharges > 0 ? 'Includes patient medicines and selected pharmacy items.' : '';
    }

    async getRoomChargeForPatient(patient) {
        if (!patient?.room) return 0;
        const rooms = await DataService.getRooms();
        const room = rooms.find(item => String(item.number) === String(patient.room));
        if (!room) return 0;
        return this.getRoomRate(room) * (Number(room.beds) || 1);
    }

    getRoomRate(room) {
        const rates = {
            General: 300,
            Private: 500,
            ICU: 1000,
            NICU: 1200
        };
        return rates[room.type] || 300;
    }

    async getSelectedMedicines() {
        const ids = Array.from(document.getElementById('medicineIds')?.selectedOptions || [])
            .map(option => parseInt(option.value));
        const medicines = await DataService.getMedicines();
        return medicines.filter(medicine => ids.includes(medicine.id));
    }

    async getSelectedMedicineTotal() {
        const selectedMedicines = await this.getSelectedMedicines();
        return selectedMedicines.reduce((sum, medicine) => sum + (Number(medicine.price) || 0), 0);
    }

    async getPatientMedicineTotal(patient) {
        if (!patient || !Array.isArray(patient.medicines)) return 0;
        const medicines = await DataService.getMedicines();
        return patient.medicines.reduce((sum, name) => {
            const medicine = medicines.find(item => item.name === name);
            return sum + (Number(medicine?.price) || 0);
        }, 0);
    }

    getInvoiceHtml(bill, printable = false) {
        const date = new Date(bill.createdAt).toLocaleDateString();
        const title = printable ? 'Hospital Invoice' : 'Invoice';

        return `
        <div class="bill-container ${printable ? '' : 'bill-container-flat'}">
          <div class="bill-header">
            <h1>${title}</h1>
            <p>${bill.id}</p>
          </div>

          <div class="bill-info">
            <div>
              <strong>Hospital Name</strong><br>
              MediCare Hospital<br>
              123 Medical Street<br>
              City, State 12345
            </div>
            <div class="text-right">
              <strong>Bill Date</strong><br>
              ${date}<br>
              <strong>Patient</strong><br>
              ${bill.patientName}
            </div>
          </div>

          <div class="bill-items">
            <div class="bill-item">
              <span>Doctor Fee</span>
              <span>₹${bill.doctorFee.toFixed(2)}</span>
            </div>
            <div class="bill-item">
              <span>Room Charges</span>
              <span>₹${bill.roomCharges.toFixed(2)}</span>
            </div>
            <div class="bill-item">
              <span>Medicines${Array.isArray(bill.medicineNames) && bill.medicineNames.length ? ` (${bill.medicineNames.join(', ')})` : ''}</span>
              <span>₹${bill.medicines.toFixed(2)}</span>
            </div>
            <div class="bill-item total">
              <span>Total Amount</span>
              <span>₹${bill.total.toFixed(2)}</span>
            </div>
          </div>

          <div class="bill-footer">
            <p class="bill-status">Payment Status: <strong>${bill.status}</strong></p>
            <p class="bill-thanks">Thank you for your visit!</p>
          </div>
        </div>
      `;
    }

    viewBill(bill) {
        Modal.open({
            title: 'Bill Details',
            size: 'large',
            body: this.getInvoiceHtml(bill),
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Close</button>
        <button class="btn btn-primary" id="printBtn" onclick="window.print()"><i class="fas fa-print"></i> Print</button>
        <button class="btn btn-success" id="downloadPdfBtn"><i class="fas fa-download"></i> Download PDF</button>
      `
            ,
            onOpen: () => {
                document.getElementById('downloadPdfBtn')?.addEventListener('click', () => this.downloadPDF(bill));
            }
        });
    }

    downloadPDF(bill) {
        this.printBill(bill);
    }

    printBill(bill) {
        const printWindow = window.open('', '', 'height=600,width=800');
        const invoiceHtml = this.getInvoiceHtml(bill, true);

        printWindow.document.write(`
      <html>
        <head>
          <title>Bill ${bill.id}</title>
          <link rel="stylesheet" href="css/styles.css">
        </head>
        <body>
          ${invoiceHtml}
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.print();
    }

    deleteBill(billId) {
        Notification.confirm('Delete Bill', 'Are you sure you want to delete this bill? This action cannot be undone.', async () => {
            await DataService.deleteBill(billId);
            Notification.success('Bill deleted successfully');
            this.refreshData();
        });
    }
}

window.Billing = Billing;
