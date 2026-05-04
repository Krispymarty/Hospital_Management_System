// Modal Component
class Modal {
    static refs = null;
    static onClose = null;
    static initialized = false;

    static init() {
        if (this.initialized) return;
        this.refs = {
            overlay: document.getElementById('modalOverlay'),
            modal: document.getElementById('modal'),
            title: document.getElementById('modalTitle'),
            body: document.getElementById('modalBody'),
            footer: document.getElementById('modalFooter')
        };

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen()) this.close();
        });

        this.initialized = true;
    }

    static open(options) {
        this.init();
        const {
            title = 'Modal',
            body = '',
            footer = '',
            size = 'medium',
            onOpen = null,
            onClose = null
        } = options;

        if (!this.refs.overlay || !this.refs.modal) return;

        if (this.isOpen()) this.close(false);

        this.refs.title.textContent = title;
        this.refs.body.innerHTML = body;
        this.refs.footer.innerHTML = footer;

        this.refs.modal.classList.remove('modal-small', 'modal-medium', 'modal-large');
        this.refs.modal.classList.add(`modal-${size}`);

        this.refs.overlay.classList.add('active');
        this.onClose = onClose;

        if (onOpen) {
            setTimeout(onOpen, 0);
        }
    }

    static close(runHandler = true) {
        this.init();
        this.refs.overlay?.classList.remove('active');

        if (runHandler && this.onClose) {
            this.onClose();
        }
        this.onClose = null;
    }

    static isOpen() {
        this.init();
        return this.refs.overlay?.classList.contains('active') || false;
    }
}

window.Modal = Modal;
