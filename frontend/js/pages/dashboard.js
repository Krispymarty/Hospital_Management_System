// Dashboard Page
class Dashboard {
    constructor() {
        this.charts = [];
    }

    async render(container) {
        container.innerHTML = this.renderLoadingState();
        setTimeout(async () => {
            try {
                await this.renderDashboard(container);
            } catch (error) {
                console.error('Dashboard render failed:', error);
                container.innerHTML = this.renderFallbackState();
            }
        }, 0);
    }

    async renderDashboard(container) {
        const stats = await this.getStatistics();
        const totalPatients = (stats && stats.totalPatients) || 0;
        const todayAppointments = (stats && stats.todayAppointments) || 0;
        const availableRooms = (stats && stats.availableRooms) || 0;
        const totalRevenue = (stats && stats.totalRevenue) || 0;
        const hasData = totalPatients || todayAppointments || availableRooms || totalRevenue;

        let html = `
      ${!hasData ? this.renderEmptyState('No data available') : ''}

      <!-- STATISTICS CARDS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon text-primary"><i class="fas fa-users"></i></div>
          <div class="stat-label">Total Patients</div>
          <div class="stat-value">${totalPatients}</div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon text-success"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-label">Appointments Today</div>
          <div class="stat-value">${todayAppointments}</div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon text-warning"><i class="fas fa-door-open"></i></div>
          <div class="stat-label">Available Rooms</div>
          <div class="stat-value">${availableRooms}</div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon text-info"><i class="fas fa-rupee-sign"></i></div>
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">₹${totalRevenue}</div>
        </div>
      </div>

      <!-- ALERTS SECTION -->
      ${await this.getLowStockAlert()}

      <!-- CHARTS ROW -->
      <div class="chart-grid">
        <!-- REVENUE CHART -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Revenue Trends</div>
              <div class="card-subtitle">Monthly revenue</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="revenueChart"></canvas>
            <div id="revenueChartFallback" class="chart-empty hidden">
              <i class="fas fa-chart-bar"></i>
              <span>No data available</span>
            </div>
          </div>
        </div>

        <!-- APPOINTMENTS CHART -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Daily Appointments</div>
              <div class="card-subtitle">Appointments per day</div>
            </div>
          </div>
          <div class="chart-container">
            <canvas id="appointmentsChart"></canvas>
            <div id="appointmentsChartFallback" class="chart-empty hidden">
              <i class="fas fa-chart-line"></i>
              <span>No data available</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RECENT APPOINTMENTS -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Today's Appointments</div>
            <div class="card-subtitle">Scheduled appointments for today</div>
          </div>
          <a href="#" class="btn btn-sm btn-primary" id="viewAllAppointments"><i class="fas fa-list"></i> View All</a>
        </div>
        <div id="appointmentsContainer"></div>
      </div>

      <!-- ROOM STATUS -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Room Status</div>
            <div class="card-subtitle">Current room availability</div>
          </div>
        </div>
        <div id="roomsContainer" class="room-grid"></div>
      </div>
    `;

        container.innerHTML = html;
        this.initializeCharts();
        this.loadAppointments(container);
        this.loadRooms(container);

        // Event listeners
        document.getElementById('viewAllAppointments')?.addEventListener('click', (e) => {
            e.preventDefault();
            Router.navigate('appointments');
        });
    }

    renderLoadingState() {
        return `
      <div class="dashboard-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading...</span>
      </div>
    `;
    }

    renderEmptyState(message) {
        return `
      <div class="empty-state">
        <i class="fas fa-circle-info"></i>
        <p>${message}</p>
      </div>
    `;
    }

    renderFallbackState() {
        return `
      <div class="card">
        ${this.renderEmptyState('Unable to load dashboard data')}
      </div>
    `;
    }

    async getStatistics() {
        const patientsResult = (await DataService.getPatients());
        const appointmentsResult = (await DataService.getAppointments());
        const patients = Array.isArray(patientsResult) ? patientsResult : [];
        const appointments = Array.isArray(appointmentsResult) ? appointmentsResult : [];

        return {
            totalPatients: Number((await DataService.getTotalPatients()) ?? patients.length) || 0,
            todayAppointments: Number((await DataService.getTodayAppointments())?.length ?? appointments.length) || 0,
            availableRooms: Number((await DataService.getAvailableRoomsCount()) ?? 0) || 0,
            totalRevenue: Number((await DataService.getTotalRevenue()) ?? 0) || 0
        };
    }

    async getLowStockAlert() {
        const lowStockResult = (await DataService.getLowStockMedicines());
        const lowStockMedicines = Array.isArray(lowStockResult) ? lowStockResult : [];
        if (lowStockMedicines.length > 0) {
            const medicinesList = lowStockMedicines.map(m => m.name).join(', ');
            return `
        <div class="alert alert-warning mb-4">
          <i class="fas fa-exclamation-triangle alert-icon"></i>
          <div><strong>Low Stock Alert:</strong> ${medicinesList} are running low on stock.</div>
        </div>
      `;
        }
        return '';
    }

    async loadAppointments(container) {
        const todayAppointmentsResult = (await DataService.getTodayAppointments());
        const appointments = (Array.isArray(todayAppointmentsResult) ? todayAppointmentsResult : []).slice(0, 5);
        let html = '';

        if (appointments.length === 0) {
            html = '<p class="empty-list">No appointments scheduled for today.</p>';
        } else {
            const table = TableComponent.create({
                headers: [
                    { label: 'Patient', key: 'patientName' },
                    { label: 'Doctor', key: 'doctorName' },
                    { label: 'Time', key: 'time' },
                    { label: 'Status', key: 'status', render: value => `<span class="badge badge-${value === 'Completed' ? 'success' : 'info'}">${value || ''}</span>` }
                ],
                data: appointments,
                searchable: false,
                sortable: false,
                card: false
            });
            document.getElementById('appointmentsContainer').replaceChildren(table);
            return;
        }

        document.getElementById('appointmentsContainer').innerHTML = html;
    }

    async loadRooms(container) {
        const roomsResult = (await DataService.getRooms());
        const rooms = Array.isArray(roomsResult) ? roomsResult : [];
        let html = '';

        if (rooms.length === 0) {
            document.getElementById('roomsContainer').innerHTML = this.renderEmptyState('No data available');
            return;
        }

        rooms.forEach(room => {
            const statusClass = room.status === 'available' ? 'available' : 'occupied';
            const statusIcon = room.status === 'available' ? 'check-circle' : 'times-circle';
            const statusText = room.status === 'available' ? 'Available' : 'Occupied';

            html += `
        <div class="room-card ${statusClass}">
          <div class="room-number">Room ${room.number}</div>
          <div class="room-type">${room.type}</div>
          <div class="room-status ${statusClass}">
            <i class="fas fa-${statusIcon}"></i> ${statusText}
          </div>
        </div>
      `;
        });

        document.getElementById('roomsContainer').innerHTML = html;
    }

    async initializeCharts() {
        this.charts.forEach(chart => {
            if (chart && typeof chart.destroy === 'function') chart.destroy();
        });
        this.charts = [];

        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
        if (revenueCtx) {
            const revenueData = (await DataService.getMonthlyRevenue()) || {};
            const labels = Object.keys(revenueData).slice(-6);
            const data = Object.values(revenueData).slice(-6);
            const hasData = data.some(value => value > 0);
            const canRender = hasData && typeof Chart !== 'undefined';
            this.toggleChartFallback('revenueChart', 'revenueChartFallback', canRender);
            if (canRender) {
                try {
                this.charts.push(new Chart(revenueCtx, {
                type: 'bar',
                data: {
                    labels: labels.length > 0 ? labels : ['No data'],
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: data.length > 0 ? data : [0],
                        backgroundColor: 'rgba(37, 99, 235, 0.6)',
                        borderColor: 'rgba(37, 99, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
                }));
                } catch (error) {
                    console.error('Revenue chart failed:', error);
                    this.toggleChartFallback('revenueChart', 'revenueChartFallback', false);
                }
            }
        }

        // Appointments Chart
        const appointmentsCtx = document.getElementById('appointmentsChart')?.getContext('2d');
        if (appointmentsCtx) {
            const appointmentsData = (await DataService.getDailyAppointments()) || {};
            const labels = Object.keys(appointmentsData).slice(-7);
            const data = Object.values(appointmentsData).slice(-7);
            const hasData = data.some(value => value > 0);
            const canRender = hasData && typeof Chart !== 'undefined';
            this.toggleChartFallback('appointmentsChart', 'appointmentsChartFallback', canRender);
            if (canRender) {
                try {
                this.charts.push(new Chart(appointmentsCtx, {
                type: 'line',
                data: {
                    labels: labels.length > 0 ? labels : ['No data'],
                    datasets: [{
                        label: 'Appointments',
                        data: data.length > 0 ? data : [0],
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
                }));
                } catch (error) {
                    console.error('Appointments chart failed:', error);
                    this.toggleChartFallback('appointmentsChart', 'appointmentsChartFallback', false);
                }
            }
        }
    }

    toggleChartFallback(canvasId, fallbackId, hasData) {
        document.getElementById(canvasId)?.classList.toggle('hidden', !hasData);
        document.getElementById(fallbackId)?.classList.toggle('hidden', hasData);
    }
}

window.Dashboard = Dashboard;
