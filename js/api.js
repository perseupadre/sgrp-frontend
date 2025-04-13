/**
 * Módulo para comunicação com o servidor (API)
 */
const API = {
    // URL base da API - Conexão com servidor Flask
    BASE_URL: 'http://localhost:5000',
    
    /**
     * Função para obter a estrutura do questionário PRD-PRQ
     */
    obterQuestionario: async function() {
        try {
            // Faz uma requisição GET para a rota /obter_questionario
            const response = await fetch(`${this.BASE_URL}/obter_questionario`);
            
            // Se a resposta não for OK (200), lança um erro
            if (!response.ok) {
                throw new Error('Falha ao obter questionário');
            }
            
            // Converte a resposta para JSON e retorna
            return await response.json();
        } catch (error) {
            // Registra e propaga o erro
            console.error('Erro ao obter questionário:', error);
            throw error;
        }
    },
    
    /**
     * Função para enviar uma avaliação completa
     * @param {Object} dados - Os dados da avaliação (empresa, departamento, respostas...)
     */
    cadastrarAvaliacao: async function(dados) {
        try {
            // Faz uma requisição POST para a rota /cadastrar_avaliacao
            const response = await fetch(`${this.BASE_URL}/cadastrar_avaliacao`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            });
            
            if (!response.ok) {
                throw new Error('Falha ao cadastrar avaliação');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao cadastrar avaliação:', error);
            throw error;
        }
    },
    
    /**
     * Função para gerar relatório de riscos
     * @param {string} empresa - Nome da empresa para filtrar (opcional)
     * @param {string} departamento - Nome do departamento para filtrar (opcional)
     */
    gerarRelatorio: async function(empresa = '', departamento = '') {
        try {
            // Constrói a URL com os parâmetros de filtro
            let url = `${this.BASE_URL}/gerar_relatorio`;
            
            // Cria um objeto de parâmetros para a URL
            const params = new URLSearchParams();
            if (empresa) params.append('empresa', empresa);
            if (departamento) params.append('departamento', departamento);
            
            // Se tiver parâmetros, adiciona à URL
            if (params.toString()) {
                url += `?${params.toString()}`;
            }
            
            // Faz a requisição GET para o relatório
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Falha ao gerar relatório');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            throw error;
        }
    }
};
