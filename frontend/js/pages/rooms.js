// Rooms Page
class Rooms {
    constructor() {
        this.rooms = [];
        this.container = null;
        this.table = null;
    }

    async render(container) {
        this.container = container;
        this.rooms = await DataService.getRooms();

        container.innerHTML = `
      <!-- STATISTICS -->
      <div class="stats-grid" id="roomStats"></div>

      <!-- ROOM LAYOUT -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Room Layout</div>
            <div class="card-subtitle">Visual representation of room status</div>
          </div>
          <button class="btn btn-primary btn-sm" id="addRoomBtn">
            <i class="fas fa-plus"></i> Add Room
          </button>
        </div>

        <div class="room-legend">
          <div class="room-legend-row">
            <div class="room-legend-item">
              <div class="room-legend-swatch available"></div>
              <span>Available</span>
            </div>
            <div class="room-legend-item">
              <div class="room-legend-swatch occupied"></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>

        <div id="roomsByFloor"></div>
      </div>

      <!-- ROOM LIST TABLE -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Room Details</div>
        </div>

        <div id="roomsTableMount"></div>
      </div>
    `;

        this.renderStats();
        this.renderRoomsByFloor();
        this.createTable();
        this.setupEventListeners();
    }

    renderStats() {
        const availableCount = this.rooms.filter(r => r.status === 'available').length;
        const occupiedCount = this.rooms.filter(r => r.status === 'occupied').length;

        document.getElementById('roomStats').innerHTML = `
        <div class="stat-card success">
          <div class="stat-icon text-success"><i class="fas fa-door-open"></i></div>
          <div class="stat-label">Available Rooms</div>
          <div class="stat-value">${availableCount}</div>
        </div>
        <div class="stat-card danger">
          <div class="stat-icon text-danger"><i class="fas fa-door-closed"></i></div>
          <div class="stat-label">Occupied Rooms</div>
          <div class="stat-value">${occupiedCount}</div>
        </div>
        <div class="stat-card info">
          <div class="stat-icon text-info"><i class="fas fa-hospital"></i></div>
          <div class="stat-label">Total Rooms</div>
          <div class="stat-value">${this.rooms.length}</div>
        </div>
      `;
    }

    renderRoomsByFloor() {
        // Group rooms by floor
        const floors = {};
        this.rooms.forEach(room => {
            if (!floors[room.floor]) {
                floors[room.floor] = [];
            }
            floors[room.floor].push(room);
        });

        let html = '';
        Object.keys(floors).sort().forEach(floor => {
            html += `
        <div class="floor-section">
          <h4 class="floor-title">
            <i class="fas fa-layer-group"></i> Floor ${floor}
          </h4>
          <div class="room-grid">
            ${floors[floor].map(room => this.renderRoomCard(room)).join('')}
          </div>
        </div>
      `;
        });

        document.getElementById('roomsByFloor').innerHTML = html;
    }

    renderRoomCard(room) {
        const statusClass = room.status === 'available' ? 'available' : 'occupied';
        const statusIcon = room.status === 'available' ? 'check-circle' : 'times-circle';
        const statusText = room.status === 'available' ? 'Available' : 'Occupied';

        return `
      <div class="room-card ${statusClass}" data-id="${room.id}">
        <div class="room-number">Room ${room.number}</div>
        <div class="room-type">${room.type}</div>
        <div class="room-beds">${room.beds} bed(s)</div>
        <div class="room-status ${statusClass}">
          <i class="fas fa-${statusIcon}"></i> ${statusText}
        </div>
        <div class="room-card-actions">
          <button class="btn btn-sm btn-secondary room-action-btn" data-action="edit" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger room-action-btn" data-action="delete" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    }

    createTable() {
        this.table = TableComponent.create({
            headers: [
                { label: 'Room Number', key: 'number', render: value => `<strong>Room ${value || ''}</strong>` },
                { label: 'Type', key: 'type' },
                { label: 'Status', key: 'status', render: value => `<span class="badge badge-${value === 'available' ? 'success' : 'danger'}">${value === 'available' ? 'Available' : 'Occupied'}</span>` },
                { label: 'Beds', key: 'beds' },
                { label: 'Floor', key: 'floor', render: value => `Floor ${value || ''}` }
            ],
            data: this.rooms,
            actions: [
                { key: 'toggle', label: 'Toggle Status', icon: 'exchange-alt', type: 'warning' },
                { key: 'edit', label: 'Edit', icon: 'edit', type: 'secondary' },
                { key: 'delete', label: 'Delete', icon: 'trash', type: 'danger' }
            ],
            searchable: false,
            card: false,
            emptyMessage: 'No data available',
            onAction: (action, room) => this.handleRoomAction(action, room)
        });

        document.getElementById('roomsTableMount')?.replaceChildren(this.table);
    }

    setupEventListeners() {
        this.container.addEventListener('click', (event) => {
            if (event.target.closest('#addRoomBtn')) {
                this.openAddForm();
                return;
            }

            const cardButton = event.target.closest('.room-card button[data-action]');
            if (cardButton) {
                const roomId = parseInt(cardButton.closest('.room-card').dataset.id);
                const room = this.rooms.find(r => r.id === roomId);
                this.handleRoomAction(cardButton.dataset.action, room);
            }
        });
    }

    handleRoomAction(action, room) {
        if (!room) return;
        if (action === 'toggle') this.toggleRoomStatus(room);
        if (action === 'edit') this.openEditForm(room);
        if (action === 'delete') this.deleteRoom(room.id);
    }

    async refreshData() {
        this.rooms = await DataService.getRooms();
        this.renderStats();
        this.renderRoomsByFloor();
        this.table?.updateData(this.rooms);
    }

    async openAddForm() {
        Modal.open({
            title: 'Add New Room',
            size: 'medium',
            body: `
        <form id="roomForm">
          <div class="form-group">
            <label for="roomNumber">Room Number *</label>
            <input type="text" id="roomNumber" placeholder="e.g., 101" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="type">Room Type *</label>
              <select id="type" required>
                <option value="">Select Type</option>
                <option value="General">General</option>
                <option value="Private">Private</option>
                <option value="ICU">ICU</option>
                <option value="NICU">NICU</option>
              </select>
            </div>
            <div class="form-group">
              <label for="beds">Number of Beds *</label>
              <input type="number" id="beds" min="1" max="4" placeholder="1" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="floor">Floor *</label>
              <input type="number" id="floor" min="1" placeholder="1" required>
            </div>
            <div class="form-group">
              <label for="status">Status *</label>
              <select id="status" required>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Add Room</button>
      `,
            onOpen: () => {
                document.getElementById('submitBtn').addEventListener('click', () => {
                    this.saveRoom();
                });
            }
        });
    }

    async openEditForm(room) {
        Modal.open({
            title: 'Edit Room',
            size: 'medium',
            body: `
        <form id="roomForm">
          <div class="form-group">
            <label for="roomNumber">Room Number *</label>
            <input type="text" id="roomNumber" value="${room.number}" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="type">Room Type *</label>
              <select id="type" required>
                <option value="General" ${room.type === 'General' ? 'selected' : ''}>General</option>
                <option value="Private" ${room.type === 'Private' ? 'selected' : ''}>Private</option>
                <option value="ICU" ${room.type === 'ICU' ? 'selected' : ''}>ICU</option>
                <option value="NICU" ${room.type === 'NICU' ? 'selected' : ''}>NICU</option>
              </select>
            </div>
            <div class="form-group">
              <label for="beds">Number of Beds *</label>
              <input type="number" id="beds" min="1" max="4" value="${room.beds}" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="floor">Floor *</label>
              <input type="number" id="floor" min="1" value="${room.floor}" required>
            </div>
            <div class="form-group">
              <label for="status">Status *</label>
              <select id="status" required>
                <option value="available" ${room.status === 'available' ? 'selected' : ''}>Available</option>
                <option value="occupied" ${room.status === 'occupied' ? 'selected' : ''}>Occupied</option>
              </select>
            </div>
          </div>
        </form>
      `,
            footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-primary" id="submitBtn"><i class="fas fa-save"></i> Update Room</button>
      `,
            onOpen: () => {
                document.getElementById('submitBtn').addEventListener('click', () => {
                    this.updateRoom(room.id);
                });
            }
        });
    }

    async saveRoom() {
        const room = {
            number: document.getElementById('roomNumber').value.trim(),
            type: document.getElementById('type').value,
            beds: parseInt(document.getElementById('beds').value),
            floor: parseInt(document.getElementById('floor').value),
            status: document.getElementById('status').value
        };

        if (!room.number || !room.type || !room.beds || !room.floor) {
            Notification.error('Please fill all required fields');
            return;
        }

        await DataService.addRoom(room);
        Modal.close();
        Notification.success('Room added successfully');
        if (room.status === 'occupied') {
            Notification.info(`Room ${room.number} assigned`);
        }
        this.refreshData();
    }

    async updateRoom(roomId) {
        const room = {
            number: document.getElementById('roomNumber').value.trim(),
            type: document.getElementById('type').value,
            beds: parseInt(document.getElementById('beds').value),
            floor: parseInt(document.getElementById('floor').value),
            status: document.getElementById('status').value
        };

        if (!room.number || !room.type || !room.beds || !room.floor) {
            Notification.error('Please fill all required fields');
            return;
        }

        await DataService.updateRoom(roomId, room);
        Modal.close();
        Notification.success('Room updated successfully');
        if (room.status === 'occupied') {
            Notification.info(`Room ${room.number} assigned`);
        }
        this.refreshData();
    }

    toggleRoomStatus(room) {
        const newStatus = room.status === 'available' ? 'occupied' : 'available';
        const action = newStatus === 'available' ? 'vacate' : 'occupy';

        Notification.confirm(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Room`, `Are you sure you want to mark this room as ${newStatus}?`, async () => {
                await DataService.updateRoom(room.id, { status: newStatus });
                Notification.success(`Room status updated to ${newStatus}`);
                if (newStatus === 'occupied') {
                    Notification.info(`Room ${room.number} assigned`);
                }
                this.refreshData();
            }
        );
    }

    deleteRoom(roomId) {
        Notification.confirm('Delete Room', 'Are you sure you want to delete this room?', async () => {
            await DataService.deleteRoom(roomId);
            Notification.success('Room deleted successfully');
            this.refreshData();
        });
    }
}

window.Rooms = Rooms;
