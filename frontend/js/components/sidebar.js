// Sidebar Component
class SidebarComponent {
    static init() {
        // Already initialized in HTML
    }

    static hideAdminPages() {
        if (App.currentUser.role !== 'admin') {
            this.hidePages(['reports']);
        }
    }

    static hideDoctorPages() {
        if (App.currentUser.role === 'doctor') {
            this.hidePages(['doctors', 'pharmacy', 'rooms', 'billing', 'reports']);
        }
    }

    static hideReceptionistPages() {
        if (App.currentUser.role === 'receptionist') {
            this.hidePages(['doctors', 'pharmacy', 'reports']);
        }
    }

    static showAllPages() {
        document.querySelectorAll('#sidebarNav [data-page]').forEach(link => {
            link.parentElement?.classList.remove('hidden');
        });
    }

    static hidePages(pages) {
        pages.forEach(page => this.hidePage(page));
    }

    static hidePage(page) {
        document.querySelector(`[data-page="${page}"]`)?.parentElement?.classList.add('hidden');
    }

    static setupRoleBasedAccess() {
        this.showAllPages();
        this.hideAdminPages();
        this.hideDoctorPages();
        this.hideReceptionistPages();
    }
}

window.SidebarComponent = SidebarComponent;
