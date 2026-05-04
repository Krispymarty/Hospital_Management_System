// Topbar Component
class TopbarComponent {
    static refs = null;

    static init() {
        if (this.refs) return;
        this.refs = {
            title: document.getElementById('pageTitle'),
            userName: document.getElementById('userName'),
            userRole: document.getElementById('userRole'),
            userAvatar: document.getElementById('userAvatar'),
            darkToggle: document.getElementById('toggleDarkMode')
        };

        this.refs.darkToggle?.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            this.sync({ darkMode: document.body.classList.contains('dark') });
        });
    }

    static updateTitle(title) {
        this.init();
        if (this.refs.title) this.refs.title.textContent = title;
    }

    static updateUser(name, role) {
        this.init();
        if (this.refs.userName) this.refs.userName.textContent = name;
        if (this.refs.userRole) this.refs.userRole.textContent = role;
        if (this.refs.userAvatar) this.refs.userAvatar.textContent = (name || 'U').charAt(0).toUpperCase();
    }

    static sync(state = {}) {
        this.init();
        if (typeof state.title === 'string') this.updateTitle(state.title);
        if (state.user) this.updateUser(state.user.name, state.user.role);
        if (typeof state.darkMode === 'boolean') {
            document.body.classList.toggle('dark', state.darkMode);
            const icon = this.refs.darkToggle?.querySelector('i');
            if (icon) icon.className = `fas fa-${state.darkMode ? 'sun' : 'moon'}`;
        }
    }
}

window.TopbarComponent = TopbarComponent;
