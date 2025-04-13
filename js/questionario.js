/**
 * Módulo para gerenciar o questionário PRD-PRQ
 */
const Questionario = {
    dados: null,
    respostas: {
        empresa: '',
        departamento: '',
        funcao: '',
        respostas_nivel1: [],
        respostas_nivel2: []
    },
    temasSelecioandos: [],
    
    inicializar: async function() {
        try {
            this.dados = (await API.obterQuestionario()).questionario;
            this.configurarFormularios();
            document.querySelector('[data-page="questionario"]').addEventListener('click', this.resetarQuestionario.bind(this));
        } catch (error) {
            mostrarNotificacao('Erro', 'Não foi possível carregar o questionário. Tente novamente mais tarde.');
        }
    },
    
    configurarFormularios: function() {
        // Simplifica os eventos dos formulários com mapeamento de ações
        const forms = {
            'form-identificacao': {
                next: 'step-nivel1',
                action: () => {
                    this.salvarIdentificacao();
                    this.renderizarPrimeiroNivel();
                }
            },
            'form-nivel1': {
                next: 'step-nivel2',
                action: () => {
                    this.salvarPrimeiroNivel();
                    this.renderizarSegundoNivel();
                }
            },
            'form-nivel2': {
                action: () => {
                    this.salvarSegundoNivel();
                    this.enviarQuestionario();
                }
            }
        };
        
        // Configura os eventos para cada formulário
        Object.entries(forms).forEach(([formId, config]) => {
            document.getElementById(formId).addEventListener('submit', e => {
                e.preventDefault();
                config.action();
                if (config.next) this.navegarPara(config.next);
            });
        });
        
        // Configura os botões de voltar
        const voltar = {
            'step-nivel2': 'step-nivel1',
            'step-nivel1': 'step-identificacao'
        };
        
        document.querySelectorAll('.btn-voltar').forEach(btn => {
            btn.addEventListener('click', e => {
                const passoAtual = e.target.closest('.wizard-step').id;
                const anterior = voltar[passoAtual];
                if (anterior) this.navegarPara(anterior);
            });
        });
        
        // Botão para novo questionário
        document.getElementById('btn-novo-questionario').addEventListener('click', () => {
            this.resetarQuestionario();
            return false;
        });
    },
    
    navegarPara: function(passo) {
        document.querySelectorAll('.wizard-step').forEach(step => 
            step.style.display = step.id === passo ? 'block' : 'none'
        );
    },
    
    salvarIdentificacao: function() {
        // Captura os valores de múltiplos campos de forma concisa
        ['empresa', 'departamento', 'funcao'].forEach(campo => 
            this.respostas[campo] = document.getElementById(campo).value
        );
    },
    
    renderizarPrimeiroNivel: function() {
        const container = document.getElementById('temas-container');
        container.innerHTML = '';
        
        if (!this.dados) return;
        
        // Renderiza os macrotemas e temas
        container.innerHTML = this.dados.map(macroTema => `
            <div class="card mb-4">
                <div class="card-header bg-light">
                    <h5 class="mb-0">${macroTema.codigo} - ${macroTema.titulo}</h5>
                </div>
                <div class="card-body">
                    ${macroTema.temas.map(tema => `
                        <div class="form-check mb-3">
                            <input class="form-check-input tema-checkbox" type="checkbox" 
                                id="tema-${tema.id}" data-tema-id="${tema.id}">
                            <label class="form-check-label" for="tema-${tema.id}">
                                ${tema.numero}. ${tema.descricao}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },
    
    salvarPrimeiroNivel: function() {
        this.temasSelecioandos = [];
        this.respostas.respostas_nivel1 = [];
        
        // Processa os checkboxes de forma mais concisa
        document.querySelectorAll('.tema-checkbox').forEach(checkbox => {
            const temaId = parseInt(checkbox.dataset.temaId);
            const selecionado = checkbox.checked;
            
            this.respostas.respostas_nivel1.push({ tema_id: temaId, selecionado });
            if (selecionado) this.temasSelecioandos.push(temaId);
        });
    },
    
    // Método auxiliar para encontrar tema pelo ID
    encontrarTema: function(temaId) {
        for (const macro of this.dados) {
            const tema = macro.temas.find(t => t.id === temaId);
            if (tema) return { tema, macroTema: macro };
        }
        return { tema: null, macroTema: null };
    },
    
    renderizarSegundoNivel: function() {
        const container = document.getElementById('subtemas-container');
        container.innerHTML = '';
        
        // Mensagem quando não há temas selecionados
        if (this.temasSelecioandos.length === 0) {
            container.innerHTML = `
                <div class="alert alert-warning">
                    <h4 class="alert-heading">Nenhum item selecionado</h4>
                    <p>Você não selecionou nenhum tema que cause desconforto ou dor. 
                    Se isso estiver correto, clique em "Finalizar" para enviar sua avaliação.</p>
                </div>
            `;
            return;
        }
        
        // Renderiza os subtemas para cada tema selecionado
        container.innerHTML = this.temasSelecioandos
            .map(temaId => {
                const { tema } = this.encontrarTema(temaId);
                if (!tema || !tema.subtemas.length) return '';
                
                return `
                    <div class="card mb-4 subtema-card" data-tema-id="${tema.id}">
                        <div class="card-header bg-light">
                            <h5 class="mb-0">${tema.numero} – ${tema.descricao}</h5>
                            <p class="text-muted mb-0">Indique quanto desconforto ou dor os seguintes aspectos causam no seu trabalho:</p>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th style="width: 50%">Aspecto</th>
                                            <th class="text-center">Sem impacto</th>
                                            <th class="text-center">Desconforto leve</th>
                                            <th class="text-center">Desconforto moderado</th>
                                            <th class="text-center">Dor leve</th>
                                            <th class="text-center">Dor intensa</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.renderizarOpcoesSubtema(tema.subtemas)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
            })
            .filter(html => html) // Remove strings vazias
            .join('');
    },
    
    // Método auxiliar para renderizar opções de subtema
    renderizarOpcoesSubtema: function(subtemas) {
        return subtemas.map(subtema => {
            // Cria array de níveis para simplificar o template
            const niveis = [0, 1, 2, 3, 4];
            
            return `
                <tr>
                    <td>${subtema.letra}) ${subtema.descricao}</td>
                    ${niveis.map(nivel => `
                        <td class="text-center">
                            <input class="form-check-input" type="radio" 
                                name="subtema-${subtema.id}" 
                                value="${nivel}" 
                                data-subtema-id="${subtema.id}"
                                ${nivel === 0 ? 'required' : ''}>
                        </td>
                    `).join('')}
                </tr>
            `;
        }).join('');
    },
    
    salvarSegundoNivel: function() {
        this.respostas.respostas_nivel2 = [];
        
        // Coleta todas as respostas de subtemas em uma única operação
        document.querySelectorAll('.subtema-card input[type="radio"]:checked').forEach(radio => {
            this.respostas.respostas_nivel2.push({
                subtema_id: parseInt(radio.dataset.subtemaId),
                nivel_desconforto: parseInt(radio.value)
            });
        });
    },
    
    async enviarQuestionario() {
        try {
            await API.cadastrarAvaliacao(this.respostas);
            this.navegarPara('step-confirmacao');
        } catch (error) {
            mostrarNotificacao('Erro', 'Falha ao enviar questionário. Por favor, tente novamente.');
        }
    },
    
    resetarQuestionario: function() {
        // Reinicia os dados
        this.respostas = {
            empresa: '', departamento: '', funcao: '',
            respostas_nivel1: [], respostas_nivel2: []
        };
        this.temasSelecioandos = [];
        
        // Limpa os formulários
        ['form-identificacao', 'form-nivel1', 'form-nivel2'].forEach(formId => 
            document.getElementById(formId).reset()
        );
        
        // Volta ao primeiro passo
        this.navegarPara('step-identificacao');
    }
};