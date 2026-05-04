// Pharmacy Page
class Pharmacy {
    constructor() {
        this.medicines = [];
        this.filteredMedicines = [];
        this.container = null;
        this.table = null;
        this.searchMedicines = TableComponent.debounce(() => {
            this.filterMedicines();
            this.updateTable();
        }, 250);
    }

    async render(container) {
        this.container = container;
        this.medicines = await DataService.getMedicines();
        this.filteredMedicines = this.medicines;

        const lowStockCount = this.medicines.filter(m => m.stock < m.reorderLevel).length;
        const lowStockMedicines = this.medicines.filter(m => m.stock < m.reorderLevel);

        container.innerHTML = `
      ${lowStockCount > 0 ? `
        <div class="alert alert-danger mb-4">
          <i class="fas fa-exclamation-circle alert-icon"></i>
          <div><strong>Warning:</strong> ${lowStockCount} medicine(s) have low stock and need reordering.</div>
        </div>
      ` : ''}

      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Pharmacy Management</div>
            <div class="card-subtitle">Manage medicines and inventory</div>
          </div>
          <button class="btn btn-primary btn-sm" id="addMedicineBtn">
            <i class="fas fa-plus"></i> Add Medicine
          </button>
        </div>

        <div class="search-bar">
          <input type="text" class="search-input" placeholder="Search by name or category..." id="medicineSearch">
          <select id="stockFilter" class="filter-select">
            <option value="">All Stock Levels</option>
            <option value="low">Low Stock</option>
            <option value="medium">Medium Stock</option>
            <option value="high">High Stock</option>
          </select>
        </div>

        <div id="medicinesTableMount"></div>
      </div>
    `;

        this.createTable();
        this.setupEventListeners();
        this.notifyLowStock(lowStockMedicines);
    }

    createTable() {
        this.table = TableComponent.create({
            headers: [
                { label: 'Medicine Name', key: 'name', render: value => `<strong>${value || ''}</strong>` },
                { label: 'Category', key: 'category' },
                { label: 'Price', key: 'price', render: value => `₹${Number(value || 0).toFixed(2)}` },
                { label: 'Stock', key: 'stock', render: (value, medicine) => this.renderStock(value, medicine) },
                { label: 'Reorder Level', key: 'reorderLevel' },
                { label: 'Status', key: 'status', render: (value, medicine) => this.renderStockStatus(medicine) }
            ],
            data: this.filteredMedicines,
            actions: [
                { key: 'edit', label: 'Edit', icon: 'edit', type: 'secondary' },
                { key: 'delete', label: 'Delete', icon: 'trash', type: 'danger' }
            ],
            rowClass: medicine => this.getStockRowClass(medicine),
            searchable: false,
            card: false,
            emptyMessage: 'No data available',
            onAction: (action, medicine) => this.handleTableAction(action, medicine)
        });

        document.getElementById('medicinesTableMount')?.replaceChildren(this.table);
    }

    renderStock(value, medicine) {
        const stockPercentage = Math.min(((medicine.stock || 0) / (medicine.reorderLevel || 1)) * 100, 100);
        const levelClass = stockPercentage < 50 ? 'danger' : stockPercentage < 100 ? 'warning' : 'success';
        return `
          <div class="stock-cell">
            <span>${value || 0}</span>
            <progress class="stock-progress ${levelClass}" value="${stockPercentage}" max="100"></progress>
          </div>
        `;
    }

    renderStockStatus(medicine) {
        if ((medicine.stock || 0) < (medicine.reorderLevel || 0)) {
            return '<span class="badge badge-danger">Low Stock</span>';
        }
        if ((medicine.stock || 0) < (medicine.reorderLevel || 0) * 2) {
            return '<span class="badge badge-warning">Medium Stock</span>';
        }
        return '<span class="badge badge-success">In Stock</span>';
    }

    getStockRowClass(medicine) {
        if ((medicine.stock || 0) < (medicine.reorderLevel || 0)) return 'stock-low-row';
        if ((medicine.stock || 0) < (medicine.reorderLevel || 0) * 2) return 'stock-medium-row';
        return '';
    }

    setupEventListeners() {
        this.container.addEventListener('click', (event) => {
            if (event.target.closest('#addMedicineBtn')) this.openAddForm();
        });

        this.container.addEventListener('input', (event) => {
            if (event.target.matches('#medicineSearch')) this.searchMedicines();
        });

        this.container.addEventListener('change', (event) => {
            if (event.target.matches('#stockFilter')) {
                this.filterMedicines();
                this.updateTable();
            }
        });
    }

    handleTableAction(action, medicine) {
        if (!medicine) return;

        switch (action) {
            case 'edit':
                this.openEditForm(medicine);
                break;
            case 'delete':
                this.deleteMedicine(medicine.id);
                break;
        }
    }

    filterMedicines() {
        const searchTerm = (document.getElementById('medicineSearch')?.value || '').toLowerCase();
        const stockFilter = document.getElementById('stockFilter')?.value || '';

        this.filteredMedicines = this.medicines.filter(medicine => {
            const matchesSearch = (medicine.name || '').toLowerCase().includes(searchTerm) ||
                (medicine.category || '').toLowerCase().includes(searchTerm);

            let matchesStockFilter = true;
            if (stockFilter === 'low') {
                matchesStockFilter = medicine.stock < medicine.reorderLevel;
            } else if (stockFilter === 'medium') {
                matchesStockFilter = medicine.stock >= medicine.reorderLevel && medicine.stock < medicine.reorderLevel * 2;
            } else if (stockFilter === 'high') {
                matchesStockFilter = medicine.stock >= medicine.reorderLevel * 2;
            }

            return matchesSearch && matchesStockFilter;
        });
    }

    updateTable() {
        this.table?.updateData(this.filteredMedicines);
    }

    async refreshData() {
        this.medicines = await DataService.getMedicines();
        this.filterMedicines();
        this.updateTable();
    }

    notifyLowStock(medicines = this.medicines.filter(m => m.stock < m.reorderLevel)) {
        if (medicines.length === 0) return;
        setTimeout(() => {
            Notification.warning(`${medicines.length} medicine(s) are low on stock`);
        }, 0);
    }

    async openAddForm() {
        Modal.open({
            title: 'Add New Medicine',
            size: 'medium',
            body: `
        <form id="medicineForm">
          <div class="form-group">
            <label for="name">Medicine Name *</label>
            <input type="text" id="name" placeholder="e.g., Aspirin" required>
            <div class="error-message" id="nameError"></div>
          </div>

          <div class="form-group">
            <label for="category">Category *</label>
            <select id="category" required>
              <option value="">Select Category</option>
              <option value="Analgesic">Analgesic</option>
              <option value="Antibiotic">Antibiotic</option>
              <option value="Antihypertensive">Antihypertensive</option>
              <option value="Antidiabetic">Antidiabetic</option>
              <option value="Antipyretic">Antipyretic</option>
              <option value="Antiviral">Antiviral</option>
              <option value="Cardiac">Cardiac</option>
              <option value="Dermatological">Dermatological</option>
              <option value="Ophthalmic">Ophthalmic</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Pediatric">Pediatric</option>
              <option value="Supplement">Supplement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Price (₹) *</label>
              <input type="number" id="price" step="0.01" min="0" placeholder="0.00" required>
              <div class="error-message" id="priceError"></div>
            </div>
            <div class="form-group">
              <label for="stock">Current Stock *</label>
              <input type="number" id="stock" min="0" placeholder="0" required>
              <div class="error-message" id="stockError"></div>
            </div>
          </div>

          <div class="form-group">
            <label for="reorderLevel">Reorder Level *</label>
            <input type="number" id="reorderLevel" min="1" placeholder="50" required>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Add Medicine</button>
      `,
            onOpen: () => {
                document.getElementById('submitBtn').addEventListener('click', () => {
                    this.saveMedicine();
                });
            }
        });
    }

    async openEditForm(medicine) {
        Modal.open({
            title: 'Edit Medicine',
            size: 'medium',
            body: `
        <form id="medicineForm">
          <div class="form-group">
            <label for="name">Medicine Name *</label>
            <input type="text" id="name" value="${medicine.name}" required>
            <div class="error-message" id="nameError"></div>
          </div>

          <div class="form-group">
            <label for="category">Category *</label>
            <select id="category" required>
              <option value="Analgesic" ${medicine.category === 'Analgesic' ? 'selected' : ''}>Analgesic</option>
              <option value="Antibiotic" ${medicine.category === 'Antibiotic' ? 'selected' : ''}>Antibiotic</option>
              <option value="Antihypertensive" ${medicine.category === 'Antihypertensive' ? 'selected' : ''}>Antihypertensive</option>
              <option value="Antidiabetic" ${medicine.category === 'Antidiabetic' ? 'selected' : ''}>Antidiabetic</option>
              <option value="Antipyretic" ${medicine.category === 'Antipyretic' ? 'selected' : ''}>Antipyretic</option>
              <option value="Antiviral" ${medicine.category === 'Antiviral' ? 'selected' : ''}>Antiviral</option>
              <option value="Cardiac" ${medicine.category === 'Cardiac' ? 'selected' : ''}>Cardiac</option>
              <option value="Dermatological" ${medicine.category === 'Dermatological' ? 'selected' : ''}>Dermatological</option>
              <option value="Ophthalmic" ${medicine.category === 'Ophthalmic' ? 'selected' : ''}>Ophthalmic</option>
              <option value="Respiratory" ${medicine.category === 'Respiratory' ? 'selected' : ''}>Respiratory</option>
              <option value="Pediatric" ${medicine.category === 'Pediatric' ? 'selected' : ''}>Pediatric</option>
              <option value="Supplement" ${medicine.category === 'Supplement' ? 'selected' : ''}>Supplement</option>
              <option value="Other" ${medicine.category === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Price (₹) *</label>
              <input type="number" id="price" step="0.01" min="0" value="${medicine.price}" required>
              <div class="error-message" id="priceError"></div>
            </div>
            <div class="form-group">
              <label for="stock">Current Stock *</label>
              <input type="number" id="stock" min="0" value="${medicine.stock}" required>
              <div class="error-message" id="stockError"></div>
            </div>
          </div>

          <div class="form-group">
            <label for="reorderLevel">Reorder Level *</label>
            <input type="number" id="reorderLevel" min="1" value="${medicine.reorderLevel}" required>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Update Medicine</button>
      `,
            onOpen: () => {
                document.getElementById('submitBtn').addEventListener('click', () => {
                    this.updateMedicine(medicine.id);
                });
            }
        });
    }

    async saveMedicine() {
        const formData = {
            name: document.getElementById('name').value.trim(),
            category: document.getElementById('category').value,
            price: parseFloat(document.getElementById('price').value),
            stock: parseInt(document.getElementById('stock').value),
            reorderLevel: parseInt(document.getElementById('reorderLevel').value)
        };

        const validation = Validator.validate(formData, ValidationRules.medicine);
        if (!validation.isValid) {
            Validator.displayErrors(validation.errors);
            return;
        }

        await DataService.addMedicine(formData);
        Modal.close();
        Notification.success('Medicine added successfully');
        this.refreshData();
        this.notifyLowStock();
    }

    async updateMedicine(medicineId) {
        const formData = {
            name: document.getElementById('name').value.trim(),
            category: document.getElementById('category').value,
            price: parseFloat(document.getElementById('price').value),
            stock: parseInt(document.getElementById('stock').value),
            reorderLevel: parseInt(document.getElementById('reorderLevel').value)
        };

        const validation = Validator.validate(formData, ValidationRules.medicine);
        if (!validation.isValid) {
            Validator.displayErrors(validation.errors);
            return;
        }

        await DataService.updateMedicine(medicineId, formData);
        Modal.close();
        Notification.success('Medicine updated successfully');
        this.refreshData();
        this.notifyLowStock();
    }

    deleteMedicine(medicineId) {
        Notification.confirm('Delete Medicine', 'Are you sure you want to delete this medicine?', async () => {
            await DataService.deleteMedicine(medicineId);
            Notification.success('Medicine deleted successfully');
            this.refreshData();
        });
    }
}

window.Pharmacy = Pharmacy;
