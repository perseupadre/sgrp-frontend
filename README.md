# API de Riscos Psicossociais (Front-end)

## Descrição

Interface web para o Sistema de Avaliação de Riscos Psicossociais, desenvolvida como uma SPA (Single Page Application) utilizando HTML, CSS e JavaScript puro. Este frontend permite que usuários preencham o questionário de riscos psicossociais, visualizem relatórios detalhados e acessem recomendações personalizadas com base nos resultados.

A aplicação se comunica com a API de back-end para obter a estrutura do questionário, enviar respostas e receber relatórios estatísticos

## Principais Funcionalidades

- Preenchimento do questionário em dois níveis (seleção de temas e avaliação de desconforto)
- Visualização de relatórios com gráficos interativos
- Detalhamento dos riscos identificados por tema e subtema
- Exibição de recomendações específicas baseadas no nível de risco
- Exportação de relatórios para PD

## Requisitos

- Navegador web atualizado (Chrome, Firefox, Edge, Safari...)
- Servidor back-end em execuçã

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/perseupadre/rp-frontend.git
cd rp-frontend
```

## Execução

O frontend pode ser executado de várias maneiras:

### 1. Abrir diretamente no navegador

Simplesmente abra o arquivo `index.html` em seu navegador:

##### No Windows (usando o navegador padrão)

`start index.html`

##### No macOS

`open index.html`

##### No macOS

`xdg-open index.html`

Para qualquer opção, o banco de dados será inicializado automaticamente na primeira execução.

### 2. Usar um servidor local (opcional)

Para evitar possíveis problemas de CORS, você pode servir os arquivos usando um servidor HTTP simples:

#### Usando Python:

##### Python 3.x

`python -m http.server 8080`

##### Python 2.x

`python -m SimpleHTTPServer 8080`

#### Usando Node.js(se instalado):

##### Instale o http-server globalmente (uma única vez)

`npm install -g http-server`

##### Execute o servidor

`http-server -p 8080`

Depois, acesse [http://localhost:8080] no seu navegador.

## Estrutura do Projeto

* `index.html` - Página principal da aplicação
* `css/` - Arquivos de estilização

  * `style.css` - Estilos principais
* `js/` - Arquivos JavaScript

  * `api.js` - Funções para comunicação com o back-end
  * `app.js` - Lógica principal da aplicação
  * `charts.js` - Configuração e renderização de gráficos
  * `principal.js` - Inicialização e coordenação da aplicação
  * `questionario.js` - Gerenciamento do questionário
  * `relatorio.js` - Geração e exibição de relatórios

## Como Usar

1. **Página Inicial** : Selecione a empresa e departamento para iniciar a avaliação
2. **Questionário Nível 1** : Selecione os temas relevantes para seu ambiente de trabalho
3. **Questionário Nível 2** : Para cada tema selecionado, avalie o nível de desconforto dos subtemas
4. **Relatório** : Visualize os resultados com gráficos, estatísticas e recomendações
5. **Exportação** : Exporte o relatório em formato PDF se necessário

## Tecnologias Utilizadas

* HTML5 - Estrutura da página
* CSS3 - Estilização
* JavaScript (vanilla) - Funcionalidades dinâmicas
* Fetch API - Comunicação com o back-end
* Chart.js - Geração de gráficos
* html2pdf - Exportação para PDF
