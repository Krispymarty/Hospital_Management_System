// Reports Page
class Reports {
    constructor() {
        this.charts = [];
    }

    async render(container) {
        const stats = await this.getReportStatistics();

        let html = `
      <!-- SUMMARY CARDS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon text-primary"><i class="fas fa-users"></i></div>
          <div class="stat-label">Total Patients</div>
          <div class="stat-value">${stats.totalPatients}</div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon text-success"><i class="fas fa-calendar-check"></i></div>
          <div class="stat-label">Total Appointments</div>
          <div class="stat-value">${stats.totalAppointments}</div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon text-info"><i class="fas fa-user-md"></i></div>
          <div class="stat-label">Active Doctors</div>
          <div class="stat-value">${stats.totalDoctors}</div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon text-warning"><i class="fas fa-rupee-sign"></i></div>
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">₹${stats.totalRevenue}</div>
        </div>
      </div>

      <!-- CHARTS -->
      <div class="chart-grid">
        <!-- MONTHLY REVENUE CHART -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Monthly Revenue</div>
          </div>
          <div class="chart-container">
            <canvas id="monthlyRevenueChart"></canvas>
            <div id="monthlyRevenueFallback" class="chart-empty hidden">
              <i class="fas fa-chart-bar"></i>
              <span>No data available</span>
            </div>
          </div>
        </div>

        <!-- APPOINTMENTS TREND CHART -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Appointments Trend</div>
          </div>
          <div class="chart-container">
            <canvas id="appointmentsTrendChart"></canvas>
            <div id="appointmentsTrendFallback" class="chart-empty hidden">
              <i class="fas fa-chart-line"></i>
              <span>No data available</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DETAILED REPORTS -->
      <div class="report-grid">
        <!-- DOCTOR PERFORMANCE -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Doctor Performance</div>
          </div>
          <div id="doctorPerformance"></div>
        </div>

        <!-- ROOM STATISTICS -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Room Statistics</div>
          </div>
          <div id="roomStatistics"></div>
        </div>
      </div>

      <!-- PATIENT DEMOGRAPHICS -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Patient Demographics</div>
        </div>
        <div class="demographics-grid">
          <div>
            <h5 class="detail-title">By Gender</h5>
            <div id="genderStats"></div>
          </div>
          <div>
            <h5 class="detail-title">By Age Group</h5>
            <div id="ageGroupStats"></div>
          </div>
        </div>
      </div>
    `;

        container.innerHTML = html;
        await this.renderCharts();
        await this.renderDoctorPerformance();
        await this.renderRoomStatistics();
        await this.renderPatientDemographics();
    }

    async getReportStatistics() {
        return {
            totalPatients: await DataService.getTotalPatients(),
            totalAppointments: (await DataService.getAppointments()).length,
            totalDoctors: (await DataService.getDoctors()).length,
            totalRevenue: await DataService.getTotalRevenue()
        };
    }

    async renderCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts = [];

        // Monthly Revenue Chart
        const revenueCtx = document.getElementById('monthlyRevenueChart')?.getContext('2d');
        if (revenueCtx) {
            const revenueData = await DataService.getMonthlyRevenue();
            const labels = Object.keys(revenueData);
            const data = Object.values(revenueData);
            const hasData = data.some(value => value > 0);
            const canRender = hasData && typeof Chart !== 'undefined';
            this.toggleChartFallback('monthlyRevenueChart', 'monthlyRevenueFallback', canRender);

            if (canRender) {
                this.charts.push(new Chart(revenueCtx, {
                type: 'bar',
                data: {
                    labels: labels.length > 0 ? labels : ['No data'],
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: data.length > 0 ? data : [0],
                        backgroundColor: [
                            'rgba(37, 99, 235, 0.6)',
                            'rgba(16, 185, 129, 0.6)',
                            'rgba(245, 158, 11, 0.6)',
                            'rgba(59, 130, 246, 0.6)',
                            'rgba(6, 182, 212, 0.6)',
                            'rgba(139, 92, 246, 0.6)'
                        ],
                        borderColor: [
                            'rgba(37, 99, 235, 1)',
                            'rgba(16, 185, 129, 1)',
                            'rgba(245, 158, 11, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(6, 182, 212, 1)',
                            'rgba(139, 92, 246, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
                }));
            }
        }

        // Appointments Trend Chart
        const appointmentsCtx = document.getElementById('appointmentsTrendChart')?.getContext('2d');
        if (appointmentsCtx) {
            const appointmentsData = await DataService.getDailyAppointments();
            const labels = Object.keys(appointmentsData);
            const data = Object.values(appointmentsData);
            const hasData = data.some(value => value > 0);
            const canRender = hasData && typeof Chart !== 'undefined';
            this.toggleChartFallback('appointmentsTrendChart', 'appointmentsTrendFallback', canRender);

            if (canRender) {
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
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(16, 185, 129, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
                }));
            }
        }
    }

    toggleChartFallback(canvasId, fallbackId, hasData) {
        document.getElementById(canvasId)?.classList.toggle('hidden', !hasData);
        document.getElementById(fallbackId)?.classList.toggle('hidden', hasData);
    }

    async renderDoctorPerformance() {
        const doctors = await DataService.getDoctors();
        const appointments = await DataService.getAppointments();

        const table = TableComponent.create({
            headers: [
                { label: 'Doctor', key: 'name', render: value => `<strong>${value || ''}</strong>` },
                { label: 'Specialization', key: 'specialization' },
                { label: 'Appointments', key: 'appointments', render: value => `<span class="badge badge-info">${value || 0}</span>` }
            ],
            data: doctors.map(doctor => ({
                ...doctor,
                appointments: appointments.filter(a => a.doctorId === doctor.id).length
            })),
            searchable: false,
            sortable: false,
            card: false
        });
        document.getElementById('doctorPerformance').replaceChildren(table);
    }

    async renderRoomStatistics() {
        const rooms = await DataService.getRooms();
        const roomTypes = {};
        const roomStatus = { available: 0, occupied: 0 };

        rooms.forEach(room => {
            // Count by type
            if (!roomTypes[room.type]) {
                roomTypes[room.type] = { available: 0, occupied: 0 };
            }
            roomTypes[room.type][room.status]++;

            // Count by status
            roomStatus[room.status]++;
        });

        let html = '<div class="grid">';
        html += `
      <div>
        <strong class="detail-title">Overall Status</strong>
        <div class="summary-row">
          <div class="summary-item">
            <div class="summary-value text-success">${roomStatus.available}</div>
            <div class="summary-label">Available</div>
          </div>
          <div class="summary-item">
            <div class="summary-value text-danger">${roomStatus.occupied}</div>
            <div class="summary-label">Occupied</div>
          </div>
        </div>
      </div>
    `;

        html += '<hr class="divider">';
        html += '<strong class="detail-title">By Type</strong>';
        html += '<div class="mt-2">';

        for (const type in roomTypes) {
            const stats = roomTypes[type];
            html += `
        <div class="report-row">
          <div><strong>${type}</strong></div>
          <div>
            <span class="text-success">${stats.available}</span> / 
            <span class="text-danger">${stats.occupied}</span>
          </div>
        </div>
      `;
        }

        html += '</div></div>';
        document.getElementById('roomStatistics').innerHTML = html;
    }

    async renderPatientDemographics() {
        const patients = await DataService.getPatients();

        // Gender statistics
        const genderStats = {};
        patients.forEach(p => {
            genderStats[p.gender] = (genderStats[p.gender] || 0) + 1;
        });

        let genderHtml = '';
        for (const gender in genderStats) {
            const percentage = ((genderStats[gender] / patients.length) * 100).toFixed(1);
            genderHtml += `
        <div class="progress-row">
          <div class="progress-content">
            <div class="progress-label">
              <span>${gender}</span>
              <span class="font-semibold">${genderStats[gender]}</span>
            </div>
            <progress class="report-progress primary" value="${percentage}" max="100"></progress>
          </div>
        </div>
      `;
        }
        document.getElementById('genderStats').innerHTML = genderHtml;

        // Age group statistics
        const ageGroups = {
            '0-18': 0,
            '19-35': 0,
            '36-50': 0,
            '51-65': 0,
            '65+': 0
        };

        patients.forEach(p => {
            if (p.age <= 18) ageGroups['0-18']++;
            else if (p.age <= 35) ageGroups['19-35']++;
            else if (p.age <= 50) ageGroups['36-50']++;
            else if (p.age <= 65) ageGroups['51-65']++;
            else ageGroups['65+']++;
        });

        let ageHtml = '';
        for (const group in ageGroups) {
            const count = ageGroups[group];
            const percentage = patients.length > 0 ? ((count / patients.length) * 100).toFixed(1) : 0;
            ageHtml += `
        <div class="progress-row">
          <div class="progress-content">
            <div class="progress-label">
              <span>${group} years</span>
              <span class="font-semibold">${count}</span>
            </div>
            <progress class="report-progress success" value="${percentage}" max="100"></progress>
          </div>
        </div>
      `;
        }
        document.getElementById('ageGroupStats').innerHTML = ageHtml;
    }
}

window.Reports = Reports;
