// scripts/footer-minimal.js

function crearFooterMinimal() {
    const footerHTML = `
        <footer class="footer-minimal">
            <div class="footer-minimal-content">
                <div class="footer-minimal-logo">
                    🏢 Eperez AF
                </div>
                <div class="footer-minimal-links">
                    <a href="/html/dashboard.html">Inicio</a>
                </div>
                <div class="footer-minimal-copyright">
                    &copy; 2024 Eperez AF. Todos los derechos reservados.
                    <span class="system-version">v2.1.0</span>
                </div>
            </div>
        </footer>
    `;
    
    document.body.insertAdjacentHTML('beforeend', footerHTML);
}

document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes("index.html")) {
        crearFooterMinimal();
    }
});