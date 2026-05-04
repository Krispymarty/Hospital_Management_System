// Hospital Management System - Main App
class HospitalApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        window.App = this;
        this.init();
    }

    init() {
        if (!this.checkAuthentication()) return;
        TopbarComponent.init();
        this.setupEventListeners();
        this.loadUserInfo();
        Router.navigate('dashboard');
        SidebarComponent.setupRoleBasedAccess();
    }

    checkAuthentication() {
        const user = sessionStorage.getItem('user');
        if (!user) {
            window.location.href = 'login.html';
            return false;
        }
        this.currentUser = JSON.parse(user);
        return true;
    }

    setupEventListeners() {
        // Sidebar navigation
        document.getElementById('sidebarNav')?.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link');
            if (!link) return;

            e.preventDefault();

            if (link.id === 'logoutBtn') {
                this.logout();
                return;
            }

            const page = link.dataset.page;
            if (page) {
                if (page === 'dashboard' || this.canAccessPage(page)) {
                    Router.navigate(page);
                    // Close sidebar on mobile
                    if (window.innerWidth <= 768) {
                        document.querySelector('.sidebar').classList.remove('active');
                    }
                }
            }
        });

        // Mobile sidebar toggle
        const toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }

        // Modal close
        document.getElementById('modalClose').addEventListener('click', () => {
            Modal.close();
        });

        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) {
                Modal.close();
            }
        });
    }

    loadUserInfo() {
        const user = this.currentUser;
        const displayName = user.username.charAt(0).toUpperCase() + user.username.slice(1);
        TopbarComponent.sync({
            user: {
                name: displayName,
                role: this.getRoleLabel(user.role)
            },
            darkMode: document.body.classList.contains('dark')
        });
    }

    getRoleLabel(role) {
        const labels = {
            'admin': 'Administrator',
            'doctor': 'Doctor',
            'receptionist': 'Receptionist'
        };
        return labels[role] || 'User';
    }

    canAccessPage(page) {
        const permissions = {
            'dashboard': ['admin', 'doctor', 'receptionist'],
            'patients': ['admin', 'receptionist', 'doctor'],
            'doctors': ['admin'],
            'appointments': ['admin', 'receptionist', 'doctor'],
            'pharmacy': ['admin'],
            'rooms': ['admin', 'receptionist'],
            'billing': ['admin', 'receptionist'],
            'reports': ['admin']
        };

        const allowedRoles = permissions[page] || [];
        return allowedRoles.includes(this.currentUser.role);
    }

    logout() {
        Notification.confirm('Logout', 'Are you sure you want to logout?', () => {
            sessionStorage.removeItem('user');
            window.location.href = 'login.html';
        });
    }

    static getInstance() {
        if (!window.appInstance) {
            window.appInstance = new HospitalApp();
        }
        return window.appInstance;
    }
}

// Notification System
class Notification {
    static show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notificationContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
      <i class="fas fa-${this.getIcon(type)} alert-icon"></i>
      <div>${message}</div>
      <button class="notification-close" type="button">
        &times;
      </button>
    `;

        container.appendChild(alert);

        alert.querySelector('button').addEventListener('click', () => {
            alert.remove();
        });

        if (duration) {
            setTimeout(() => {
                alert.remove();
            }, duration);
        }

        return alert;
    }

    static success(message) {
        return this.show(message, 'success');
    }

    static error(message) {
        return this.show(message, 'danger');
    }

    static warning(message) {
        return this.show(message, 'warning');
    }

    static info(message) {
        return this.show(message, 'info');
    }

    static confirm(title, message, onConfirm, onCancel = null) {
        Modal.open({
            title: title,
            body: `<p>${message}</p>`,
            footer: `
        <button class="btn btn-secondary" id="cancelBtn">Cancel</button>
        <button class="btn btn-danger" id="confirmBtn">Confirm</button>
      `,
            onOpen: () => {
                document.getElementById('confirmBtn').addEventListener('click', () => {
                    Modal.close();
                    if (onConfirm) onConfirm();
                });
                document.getElementById('cancelBtn').addEventListener('click', () => {
                    Modal.close();
                    if (onCancel) onCancel();
                });
            }
        });
    }

    static getIcon(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'bell';
    }
}

// Global utilities
window.Notification = Notification;

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('content')) {
            window.App = HospitalApp.getInstance();
        }
    });
} else {
    if (document.getElementById('content')) {
        window.App = HospitalApp.getInstance();
    }
}
