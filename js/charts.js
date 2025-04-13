/**
 * Módulo para visualização de dados em gráficos
 * Biblioteca Chart.js
 */

// Variável que irá armazenar a referência ao gráfico de riscos
let graficoRiscos = null;

/**
 * Cria ou atualiza o gráfico de riscos com novos dados
 * @param {Array} dados Dados a serem exibidos no gráfico
 */
function atualizarGraficoRiscos(dados) {
    // Obtém o elemento canvas onde o gráfico será renderizado
    const ctx = document.getElementById('grafico-riscos').getContext('2d');
    
    // Se já existe um gráfico, destrói para criar um novo
    if (graficoRiscos) {
        graficoRiscos.destroy();
    }
    
    // Prepara os dados para o gráfico
    const labels = dados.map(item => item.tipo);
    const valores = dados.map(item => item.media_risco);
    
    // Define cores dinâmicas com base no nível de risco
    const backgroundColors = valores.map(nivel => {
        if (nivel < 0.5) return 'rgba(40, 129, 167, 0.7)';    // Ausência de Risco
        if (nivel < 1.5) return 'rgba(0, 255, 123, 0.7)';     // Risco Baixo
        if (nivel < 2.5) return 'rgba(255, 193, 7, 0.7)';     // Risco Moderado
        if (nivel < 3.5) return 'rgba(245, 50, 70, 0.7)';     // Risco Alto
        return 'rgba(7, 7, 7, 0.7)';                         // Risco Crítico
    });
   
    // Cria o gráfico de barras
    graficoRiscos = new Chart(ctx, {
        type: 'bar',  
        data: {
            labels: labels,  
            datasets: [{
                label: 'Média de Risco',  
                data: valores, 
                backgroundColor: backgroundColors,  
                borderColor: backgroundColors.map(cor => cor.replace('0.7', '1')),  
                borderWidth: 1  
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1, // Proporção do gráfico (largura/altura)
                      
            hover: {
                mode: 'index',
                intersect: false,
                animationDuration: 400 // Ativa animações ao passar o mouse (400ms)
            },

            animation: {
                duration: 500,  // Duração da animação de entrada do gráfico
            },
          
            scales: {
                y: {
                    beginAtZero: true,  
                    max: 5,  
                    title: {
                        display: true,
                        text: 'Nível de Risco (1-5)' 
                    }
                }
            },
            plugins: {
                legend: {
                    display: true  // Mostrar a legenda
                },
                tooltip: {
                    enabled: true, // Garantir que o tooltip esteja ativado
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        label: function(context) {
                            const nivel = context.raw;
                            let classificacao = "";
                            
                            if (nivel < 0.5) classificacao = "Ausência de Risco";
                            else if (nivel < 1.5) classificacao = "Risco Baixo";
                            else if (nivel < 2.5) classificacao = "Risco Moderado";
                            else if (nivel < 3.5) classificacao = "Risco Alto";
                            else classificacao = "Risco Crítico";
                            
                            return [
                                `Nível médio: ${nivel.toFixed(2)}`,
                                `Classificação: ${classificacao}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// Executar correções de estilos quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', aplicarEstilosGrafico);