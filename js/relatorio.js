/**
 * Módulo para gerenciar os relatórios
 */
const Relatorios = {
    dadosRelatorio: null,
    graficoTopRiscos: null,
    graficoTodosRiscos: null,
    
    // Constantes reutilizáveis
    cores_risco: [
        { limite: 0.5, cor: 'rgba(40, 129, 167, 0.6)' },
        { limite: 1.5, cor: 'rgba(0, 255, 123, 0.6)' },
        { limite: 2.5, cor: 'rgba(255, 193, 7, 0.6)' },
        { limite: 3.5, cor: 'rgba(245, 50, 70, 0.6)' },
        { limite: 4.0, cor: 'rgba(7, 7, 7, 0.8)' }
    ],
    
    niveis_gravidade: [
        { max: 0.5, classe: 'bg-info', texto: 'Ausência de Risco' },
        { max: 1.5, classe: 'bg-success', texto: 'Risco Baixo' },
        { max: 2.5, classe: 'bg-warning', texto: 'Risco Moderado' },
        { max: 3.5, classe: 'bg-danger', texto: 'Risco Alto' },
        { max: 4, classe: 'bg-dark', texto: 'Risco Crítico' }
    ],
    
    macrotemas: {
        "A": "Sobre diferentes cargas de trabalho",
        "B": "Sobre aspectos sociais no trabalho",
        "C": "Sobre suporte organizacional", 
        "D": "Sobre saúde no trabalho",
        "E": "Sobre outros aspectos"
    },
    
    inicializar: function() {
        document.getElementById('btn-gerar-relatorio').addEventListener('click', () => this.gerarRelatorio());
        document.getElementById('btn-exportar-pdf').addEventListener('click', () => this.exportarPDF());
    },
    
    gerarRelatorio: async function() {
        const empresa = document.getElementById('filtro-empresa').value;
        const departamento = document.getElementById('filtro-departamento').value;
        
        try {
            this.dadosRelatorio = await API.gerarRelatorio(empresa, departamento);
            
            if (this.dadosRelatorio.total_avaliacoes === 0) {
                ['relatorio-container', 'legenda-top-riscos'].forEach(id => 
                    document.getElementById(id).style.display = 'none');
                document.getElementById('sem-dados-relatorio').style.display = 'block';
                mostrarNotificacao('Aviso', 'Nenhuma avaliação encontrada com os filtros informados.');
                return;
            }
            
            // Atualiza os dados básicos usando um mapeamento de IDs para campos
            const camposPorId = {
                'total-avaliacoes': 'total_avaliacoes',
                'empresa-relatorio': 'empresa',
                'departamento-relatorio': 'departamento'
            };
            
            Object.entries(camposPorId).forEach(([id, campo]) => {
                document.getElementById(id).textContent = this.dadosRelatorio[campo] || 'N/A';
            });
            
            // Renderiza as visualizações
            this.renderizarGraficoTopRiscos();
            this.renderizarGraficoTodosRiscos();
            this.renderizarDetalhamento();
            
            // Exibe o relatório
            document.getElementById('relatorio-container').style.display = 'block';
            document.getElementById('sem-dados-relatorio').style.display = 'none';
            document.getElementById('legenda-top-riscos').style.display = 'block';
        } catch (error) {
            mostrarNotificacao('Erro', 'Falha ao gerar relatório. Tente novamente mais tarde.');
            console.error(error);
        }
    },
    
    // Função auxiliar para ordenar temas
    ordenarTemas: function(temas) {
        return [...temas].sort((a, b) => 
            a.percentual !== b.percentual ? 
                b.percentual - a.percentual : 
                b.nivel_medio - a.nivel_medio
        );
    },
    
    // Função auxiliar para obter cor/classe baseada no nível
    obterCorPorNivel: function(nivel) {
        const item = this.cores_risco.find(item => nivel < item.limite) 
                  || this.cores_risco[this.cores_risco.length-1];
        return item.cor;
    },
    
    obterClasseGravidade: function(nivel) {
        const item = this.niveis_gravidade.find(item => nivel <= item.max) 
                  || this.niveis_gravidade[this.niveis_gravidade.length-1];
        return item;
    },
    
    // Configuração base para os gráficos
    obterConfigGrafico: function(labels, valores, niveis, cores, opcoes = {}) {
        const configBase = {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: '% de Trabalhadores',
                        data: valores,
                        backgroundColor: cores,
                        borderColor: 'black',
                        borderWidth: 1,
                        yAxisID: 'y',
                        order: 0
                    },
                    {
                        label: 'Nível Médio de Desconforto/Dor',
                        data: niveis,
                        type: 'line',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                        fill: false,
                        yAxisID: 'y1',
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { bottom: 30 } },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: { display: true, text: 'Percentual de Trabalhadores (%)' },
                        position: 'left'
                    },
                    y1: {
                        beginAtZero: true,
                        max: 4,
                        title: { display: true, text: 'Nível Médio de Desconforto/Dor' },
                        position: 'right',
                        grid: { drawOnChartArea: false }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation: 0,
                            minRotation: 0,
                            font: { size: 12 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                            font: { size: 12 },
                            generateLabels: function(chart) {
                                const originalLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                originalLabels.forEach(label => {
                                    if (label.text === '% de Trabalhadores') {
                                        label.fillStyle = 'rgba(240, 240, 240, 0.8)';
                                        label.strokeStyle = 'rgba(75, 75, 75, 1)';
                                        label.lineWidth = 2;
                                    }
                                });
                                return originalLabels;
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                const isPercentual = context.dataset.label === '% de Trabalhadores';
                                return `${context.dataset.label}: ${value.toFixed(isPercentual ? 1 : 2)}${isPercentual ? '%' : ''}`;
                            }
                        },
                        titleFont: { size: 14 },
                        bodyFont: { size: 12 }
                    }
                }
            }
        };
        
        // Mescla as opções customizadas
        if (opcoes) {
            // Função recursiva
            const mesclar = (dest, src) => {
                Object.entries(src).forEach(([key, val]) => {
                    if (val && typeof val === 'object' && !Array.isArray(val)) {
                        if (!dest[key] || typeof dest[key] !== 'object') dest[key] = {};
                        mesclar(dest[key], val);
                    } else {
                        dest[key] = val;
                    }
                });
            };
            mesclar(configBase.options, opcoes);
        }
        
        return configBase;
    },
    
    // Função genérica para renderizar gráficos
    renderizarGrafico: function(tipo, temasSource, opcoesEspecificas) {
        try {
            const canvasId = `grafico-${tipo}-riscos`;
            const canvas = document.getElementById(canvasId);
            if (!canvas) throw new Error(`Canvas ${canvasId} não encontrado`);
            
            const container = canvas.parentElement;
            const graficoRef = tipo === 'top' ? 'graficoTopRiscos' : 'graficoTodosRiscos';
            
            // Dados do gráfico
            const temas = [...temasSource];
            if (tipo === 'top') temas.splice(5); // Limita a 5
            
            const formatLabel = tema => tipo === 'top' ? 
                `${tema.macrotema} - ${tema.tema}. ${tema.descricao}` : 
                `${tema.tema}`;
                
            const labels = temas.map(formatLabel);
            const valores = temas.map(tema => tema.percentual);
            const niveis = temas.map(tema => tema.nivel_medio);
            const cores = niveis.map(nivel => this.obterCorPorNivel(nivel));
            
            // Destrói o gráfico anterior e recria o canvas
            if (this[graficoRef]) this[graficoRef].destroy();
            
            container.removeChild(canvas);
            const newCanvas = document.createElement('canvas');
            newCanvas.id = canvasId;
            newCanvas.style.width = '100%';
            newCanvas.style.height = '600px';
            container.appendChild(newCanvas);
            
            // Cria o novo gráfico
            this[graficoRef] = new Chart(
                newCanvas.getContext('2d'),
                this.obterConfigGrafico(labels, valores, niveis, cores, opcoesEspecificas)
            );
            
        } catch (error) {
            console.error(`Erro ao renderizar gráfico ${tipo} riscos:`, error);
            mostrarNotificacao('Erro', `Falha ao gerar gráfico de ${tipo === 'top' ? 'top' : 'todos os'} riscos.`);
        }
    },
    
    renderizarGraficoTopRiscos: function() {
        const opcoesTop = {
            scales: {
                x: {
                    ticks: {
                        autoSkip: false,
                        callback: function(value, index) {
                            const label = this.getLabelForValue(value);
                            const parts = label.split('.');
                            const num = parts[0] + '.';
                            const text = parts.slice(1).join('.').trim();
                            const words = text.split(' ');
                            const lines = [num];
                            let currentLine = '';
                            
                            words.forEach(word => {
                                if (currentLine.length + word.length + 1 < 30) {
                                    currentLine += (currentLine.length ? ' ' : '') + word;
                                } else {
                                    if (currentLine.length > 0) lines.push(currentLine);
                                    currentLine = word;
                                }
                            });
                            
                            if (currentLine.length > 0) lines.push(currentLine);
                            return lines;
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        }
                    }
                }
            }
        };
        
        this.renderizarGrafico('top', this.ordenarTemas(this.dadosRelatorio.temas), opcoesTop);
    },
    
    renderizarGraficoTodosRiscos: function() {
        const temasOrdenados = this.ordenarTemas(this.dadosRelatorio.temas);
        
        const opcoesTodos = {
            scales: {
                x: {
                    ticks: {
                        autoSkip: true
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            const tema = temasOrdenados[index];
                            return `${tema.tema}. ${tema.descricao}`;
                        },
                        afterLabel: function(context) {
                            if (context.dataset.label === '% de Trabalhadores') {
                                return `Critério de ordenação: Percentual e Nível`;
                            }
                            return null;
                        }
                    }
                }
            }
        };
        
        this.renderizarGrafico('todos', temasOrdenados, opcoesTodos);
    },
    
    renderizarDetalhamento: function() {
        const container = document.getElementById('detalhamento-riscos');
        container.innerHTML = '';
        
        // Ordena os temas da mesma forma que no gráfico
        const temasOrdenados = this.ordenarTemas(this.dadosRelatorio.temas);
        
        const htmlTemas = temasOrdenados.map(tema => {
            const nivelGravidade = this.obterClasseGravidade(tema.nivel_medio);
            const macroTemaCodigo = tema.macrotema;
            const macroTemaTitulo = this.macrotemas[macroTemaCodigo] || "";
            const macroTemaCompleto = `MacroTema ${macroTemaCodigo} - ${macroTemaTitulo}`;
            
            const subtemasHtml = tema.subtemas.map(subtema => 
                `<li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>${subtema.letra}) ${subtema.descricao}</div>
                    <span class="badge ${this.obterClasseGravidade(subtema.nivel_medio).classe} rounded-pill">
                        ${subtema.nivel_medio.toFixed(2)}
                    </span>
                </li>`
            ).join('');
            
            const recomendacoesHtml = tema.recomendacoes.length > 0 
                ? `<ul class="mb-0">
                      ${tema.recomendacoes.map(rec => `<li>${rec}</li>`).join('')}
                   </ul>`
                : '<p class="text-muted">Nenhuma recomendação disponível para este nível de risco.</p>';
            
            return `
                <div class="card mb-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <div class="mb-2 fw-bold text-primary" style="font-size: 0.95rem;">${macroTemaCompleto}</div>
                            <h6 class="mb-0">${tema.tema}. ${tema.descricao}</h6>
                            <span class="badge ${nivelGravidade.classe} me-2">${nivelGravidade.texto}</span>
                            <span class="badge bg-secondary">${tema.percentual}% dos trabalhadores</span>
                        </div>
                        <div>
                            <span class="h6 mb-0">Nível Médio: <span class="fw-bold text-danger">${tema.nivel_medio.toFixed(2)}</span></span>
                        </div>
                    </div>
                    <div class="card-body">
                        <h6>Subtemas mais críticos:</h6>
                        <ul class="list-group mb-4">${subtemasHtml}</ul>
                        
                        <h6>Recomendações para gestores:</h6>
                        ${recomendacoesHtml}
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = htmlTemas;
    },
    
    exportarPDF: function() {
        if (!this.dadosRelatorio) {
            mostrarNotificacao('Erro', 'Gere um relatório primeiro.');
            return;
        }
    
        mostrarNotificacao('Processando', 'Preparando PDF...');
        
        // Força a renderização
        [this.graficoTopRiscos, this.graficoTodosRiscos].forEach(grafico => {
            if (grafico) grafico.render();
        });
        
        setTimeout(() => {
            try {
                // Processa as imagens dos gráficos
                const canvasElements = document.querySelectorAll('canvas');
                const canvasImages = Array.from(canvasElements).map(canvas => {
                    // Cria um canvas temporário com resolução maior
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    // Duplica o tamanho para maior resolução
                    const scale = 2;
                    tempCanvas.width = canvas.width * scale;
                    tempCanvas.height = canvas.height * scale;
                    
                    // Configura o contexto para melhor qualidade
                    tempCtx.imageSmoothingEnabled = true;
                    tempCtx.imageSmoothingQuality = 'high';
                    
                    // Desenha no canvas temporário com escala aumentada
                    tempCtx.scale(scale, scale);
                    tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
                    
                    // Converte para imagem em alta qualidade
                    const image = new Image();
                    image.src = tempCanvas.toDataURL('image/png', 1.0);
                    image.style.maxWidth = '100%';
                    image.style.height = 'auto';
                    image.style.breakInside = 'avoid';
                    
                    return { canvas, image };
                });
                
                // Clona o relatório
                const relatorioContainer = document.getElementById('relatorio-container');
                const cloneRelatorio = relatorioContainer.cloneNode(true);
                
                // Remove o botão exportar
                const btnExportarPDF = cloneRelatorio.querySelector('#btn-exportar-pdf');
                if (btnExportarPDF) btnExportarPDF.remove();
                
                // Substitui o canvas por imagens
                canvasImages.forEach(item => {
                    const clonedCanvas = cloneRelatorio.querySelector(`canvas#${item.canvas.id}`);
                    if (clonedCanvas && clonedCanvas.parentNode) {
                        clonedCanvas.parentNode.replaceChild(item.image.cloneNode(true), clonedCanvas);
                    }
                });
                
                // Aplica os estilos para o PDF
                cloneRelatorio.querySelectorAll('.card').forEach(card => {
                    card.style.breakInside = 'avoid';
                    card.style.marginBottom = '30px';
                });
                
                // Ajusta o layout
                Object.assign(cloneRelatorio.style, {
                    width: '190mm',
                    margin: '0 auto',
                    padding: '10mm',
                    fontSize: '70%'
                });
                
                // Adiciona o cabeçalho
                cloneRelatorio.insertAdjacentHTML('afterbegin', `
                    <div style="text-align:center; margin-bottom:20px; background-color:#f8f9fa; padding:10px; border-radius:5px; break-after:avoid;">
                        <h2 style="color:#0d6efd; font-size:20px; margin:0;">Relatório de Riscos Psicossociais</h2>
                        <p style="font-size:14px; margin:5px 0 0 0;">Empresa: ${this.dadosRelatorio.empresa} | Data: ${new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                `);
                
                // Configurações do PDF
                const options = {
                    margin: [10, 10, 10, 10],
                    filename: `Relatorio_${this.dadosRelatorio.empresa.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
                    image: { type: 'jpeg', quality: 1.0 },
                    html2canvas: { 
                        scale: 3.0, 
                        useCORS: true,
                        allowTaint: true,
                        imageTimeout: 15000,
                        letterRendering: true
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait',
                        compress: true
                    },
                    pagebreak: { 
                        mode: ['avoid-all', 'css'],
                        avoid: '.avoid-break'
                    }
                };
                
                // Geração do PDF
                html2pdf()
                    .from(cloneRelatorio)
                    .set(options)
                    .save()
                    .then(() => mostrarNotificacao('Sucesso', 'Relatório exportado com sucesso!'))
                    .catch(err => {
                        console.error('Erro na exportação do PDF:', err);
                        mostrarNotificacao('Erro', 'Falha ao exportar. Tente novamente.');
                    });
            } catch (error) {
                console.error('Erro na preparação do PDF:', error);
                mostrarNotificacao('Erro', 'Falha ao preparar o PDF. Tente novamente.');
            }
        }, 2000);
    }
};