/**
 * Script principal da aplicação - controla navegação e inicialização dos módulos
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - Inicializando aplicação');
    
    // Inicializar handlers de navegação
    inicializarNavegacao();
    
    // Mostrar a página inicial por padrão
    navegarPara('inicio');
    
    // Inicializar módulos específicos
    if (typeof Questionario !== 'undefined') {
        console.log('Inicializando módulo Questionário');
        if (Questionario.inicializar) {
            Questionario.inicializar();
        }
    }
    
    if (typeof Relatorio !== 'undefined') {
        console.log('Inicializando módulo Relatório');
        if (Relatorio.inicializar) {
            Relatorio.inicializar();
        }
    }
});

/**
 * Configura os links de navegação do menu
 */
function inicializarNavegacao() {
    console.log('Inicializando navegação');
    
    // Captura cliques no menu de navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const pagina = this.getAttribute('data-pagina');
            console.log('Clique em link de navegação:', pagina);
            
            if (pagina) {
                navegarPara(pagina);
            }
        });
    });
    
    // Botão iniciar questionário na página inicial
    const btnIniciar = document.getElementById('btn-iniciar-questionario');
    if (btnIniciar) {
        btnIniciar.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Clique em botão iniciar questionário');
            navegarPara('questionario');
        });
    }
}

/**
 * Navega entre as páginas da aplicação
 * @param {string} pagina - ID da página a ser exibida
 */
function navegarPara(pagina) {
    console.log('Navegando para:', pagina);
    
    // Ocultar todas as páginas
    document.querySelectorAll('.pagina').forEach(element => {
        element.style.display = 'none';
    });
    
    // Remover classe ativa de todos os links do menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostrar a página selecionada
    const paginaElement = document.getElementById('pagina-' + pagina);
    if (paginaElement) {
        paginaElement.style.display = 'block';
        
        // Ações específicas por página
        if (pagina === 'questionario' && typeof Questionario !== 'undefined') {
            if (Questionario.carregarEstrutura) {
                Questionario.carregarEstrutura();
            }
        } else if (pagina === 'relatorios' && typeof Relatorio !== 'undefined') {
            if (Relatorio.inicializar) {
                Relatorio.inicializar();
            }
        }
    } else {
        console.error('Página não encontrada:', 'pagina-' + pagina);
    }
    
    // Marcar o link correspondente como ativo
    const linkAtivo = document.querySelector(`.nav-link[data-pagina="${pagina}"]`);
    if (linkAtivo) {
        linkAtivo.classList.add('active');
    }
}
