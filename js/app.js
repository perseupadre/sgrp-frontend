/**
 * Aplicação principal para gestão de riscos psicossociais
 * 
 * Configura o comportamento da SPA (Single Page Application) e inicializa os módulos
 * Este arquivo é responsável por gerenciar a navegação entre as páginas da aplicação e exibir notificações
 * 
 * Nota: Este arquivo contém a lógica principal da aplicação
 * e deve ser carregado após os módulos Questionario.js e Relatorios.js
 * para garantir que eles estejam disponíveis para uso.
 *
 */
document.addEventListener('DOMContentLoaded', function() {
    // Navegação SPA
    const navLinks = document.querySelectorAll('[data-page]');
    const pages = document.querySelectorAll('.page');
    
    // Modal de notificação (Bootstrap)
    const modal = new bootstrap.Modal(document.getElementById('notification-modal'));
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    // Função global para notificações
    window.mostrarNotificacao = function(titulo, mensagem) {
        modalTitle.textContent = titulo;
        modalMessage.textContent = mensagem;
        modal.show();
    };
    
    // Inicialização dos módulos
    Questionario.inicializar();
    Relatorios.inicializar();
    
    // Navegação entre páginas
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Atualiza as páginas visíveis
            pages.forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(targetPage).classList.add('active');
            
            // Se for a página de questionário, volta para o primeiro passo
            if (targetPage === 'questionario') {
                // O método resetarQuestionario será chamado pelo próprio evento do link
            }
        });
    });
});
