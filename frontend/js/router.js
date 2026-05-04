// Router - Handle page navigation
class Router {
    static pages = {
        'dashboard': Dashboard,
        'patients': Patients,
        'doctors': Doctors,
        'appointments': Appointments,
        'pharmacy': Pharmacy,
        'rooms': Rooms,
        'billing': Billing,
        'reports': Reports
    };

    static async navigate(page) {
        // Check permission
        if (!App.canAccessPage(page)) {
            Notification.error('You do not have permission to access this page');
            return;
        }

        // Update active navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'patients': 'Patient Management',
            'doctors': 'Doctor Management',
            'appointments': 'Appointments',
            'pharmacy': 'Pharmacy',
            'rooms': 'Room Booking',
            'billing': 'Billing',
            'reports': 'Reports'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

        // Load page
        const PageClass = this.pages[page];
        if (PageClass) {
            const content = document.getElementById('content');
            content.innerHTML = '';
            await new PageClass().render(content);
            App.currentPage = page;
        }
    }

    static back() {
        window.history.back();
    }
}

// Make Router available globally
window.Router = Router;
