import pandas as pd
import os
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st

# Lista de arquivos
file_names = [
    "1aba_semPesquisa.csv",
    "2_abas_abertas_duas_pesquisas.csv",
    "2_abas_uma_pesquisa.csv",
    "3abas_abertas_ao_mesmo_tempo.csv",
    "aberto_sem_nada.csv"
]

# Lê e processa os dados
@st.cache_data
def load_data():
    dfs = []
    for file in file_names:
        df = pd.read_csv(file, sep=';', encoding='utf-8')
        df['timestamp'] = pd.to_datetime(df['Data'] + ' ' + df['Hora'])
        df['teste'] = os.path.splitext(file)[0]
        df.rename(columns={'CPU': 'cpu_percent', 'RAM': 'ram_percent'}, inplace=True)
        dfs.append(df[['timestamp', 'cpu_percent', 'ram_percent', 'teste']])
    return pd.concat(dfs, ignore_index=True)

df_all = load_data()

#inicio do Streamlit Dashboard
#configurao da pagina
st.set_page_config(page_icon="GONxGON.png", page_title="Gon Freecss Web Browser", layout="wide")
st.title("Dashboard Gon by: Lucas Gabriel e Yan Teixeira")

st.sidebar.image("GONxGON.png")
st.sidebar.header("Configurações")
opcao = st.sidebar.radio("Escolha uma opção:", ["Apresentação", "Testes"])

if opcao == "Apresentação":
    st.subheader("Tecnologias utilizadas:")
    st.markdown("Nosso navegador Web foi construído utilizando:")
    st.markdown("**Electron (versão 8.0.0)** - Framework que combina o motor de renderização do Chromium com Node.js, permitindo o desenvolvimento de aplicações desktop utilizando tecnologias web.")
    st.markdown("**Node.js** - Ambiente de execução JavaScript no lado do servidor, utilizado para comunicação com APIs e interação com recursos do sistema operacional.")
    st.markdown("**JavaScript, HTML e CSS** - Linguagens utilizadas para a lógica de funcionamento, estrutura e estilização da interface do navegador.")
    st.markdown("**Linux** - Sistema operacional utilizado para desenvolvimento e testes, com apoio do terminal para execução, monitoramento e depuração do projeto.")
    st.subheader("Desenvolvimento:")
    st.markdown("O desenvolvimento do navegador foi realizado de forma modular, permitindo que cada funcionalidade fosse implementada e testada separadamente. A integração final resultou em um sistema funcional, leve e seguro, seguindo as especificações propostas.")
    st.subheader("Implementação dos recursos de navegação:")
    st.markdown("**Barra de endereços:** foi inspirada no design do Google Chrome e Firefox, sendo posicionada tanto na parte superior (top-bar) quanto no centro da tela inicial (home-screen). A navegação é controlada pela function go(), que captura o texto digitado na barra e o envia para o processo principal por meio da electronAPI. Essa API, definida no preload.js, utiliza o ipcRenderer para comunicar com o main.js, que carrega a URL correspondente na aba ativa.")
    st.image("function_go.png")
    st.markdown("O arquivo preload.js expõe essa função de forma segura:")
    st.image("exposeInMainWorld.png")
    st.markdown("**Botões de navegação:** os três botões foram adicionados no index.html para controlar a navegação da aba atual: voltar, avançar e recarregar. Cada botão dispara um evento para o processo principal via API do preload.")
    st.image("botoes.png")
    st.markdown("No arquivo preload.js  esses comandos estão estruturados dessa forma:")
    st.image("botoes_preload.png")
    st.markdown("Cada uma dessas funções envia uma mensagem para o processo principal (main.js) usando o ipcRenderer.send(), que é o mecanismo de comunicação entre processos do Electron: ")
    st.markdown("\n**● back:** solicita que o navegador volte à página anterior na aba ativa. ")
    st.markdown("\n**● forward:** solicita que avance para a próxima página, se houver. ")
    st.markdown("\n**● reload:** solicita o recarregamento da página atual.") 
    st.markdown("No arquivo main.js, foram implementados os listeners de eventos IPC para controlar as ações de navegação no navegador, como voltar, avançar e recarregar a página atual. Esses eventos são disparados pela interface gráfica (via preload.js) e tratados no processo principal utilizando o módulo ipcMain do Electron.")
    st.image("ipcmain.png")
    st.markdown("**● ipcMain.on(‘back’):** Esta função verifica se a aba atual possui histórico anterior com navigationHistory.goBack(). Se houver, executa o método .goBack() do webContents, retornando à página anterior.")
    st.markdown("**● ipcMain.on('forward'):** Semelhante à função de voltar, verifica se há uma próxima página no histórico e, se disponível, utiliza .goForward() para navegar adiante.")
    st.markdown("**● ipcMain.on('reload')** Recarrega o conteúdo da aba ativa utilizando .reload(), sem alterar o histórico de navegação.")
    st.markdown("Com a estrutura do projeto devidamente definida, procede-se à organização do arquivo index, de modo a replicar com fidelidade a interface e o comportamento de um navegador convencional.")
    st.image("barrapesquisa.png")
    st.markdown("**Sistema de histórico:** é gerenciado no main.js e exibido no arquivo historico.html. Cada página visitada é registrada com título, URL e data/hora, e pode ser visualizada em uma lista interativa, graças a async function loadHisory() que permite a visualização do histórico do navegador")
    st.image("historico.png")
    st.markdown("E possui a função de limpeza de histórico:")
    st.image("clear_historico.png")
    st.markdown("Essa função: 1. Envia uma solicitação ao processo principal via electronAPI.clearHistory(); 2. O main.js então limpa o array de histórico: 3. Por fim, a interface é recarregada para mostrar que não há mais itens salvos.")
    st.markdown("**Suporte a múltiplas abas:** O navegador foi projetado com suporte a múltiplas abas, permitindo que o usuário abra, feche e alterne entre diversas páginas ao mesmo tempo, de forma similar aos navegadores modernos como Chrome e Firefox. Cada aba funciona de forma independente e é representada por um objeto do tipo BrowserView (com seu próprio webContents), isolando o conteúdo carregado. O sistema de abas foi implementado por meio da colaboração entre os arquivos main.js, preload.js e index.html, utilizando o sistema de IPC (Inter-Process Communication) do Electron para troca de mensagens entre o processo principal e o processo de interface. Cada elemento do array tabs contém um objeto com:")
    st.markdown("● view: instância de BrowserView que representa a aba visualmente.")
    st.markdown("● url: URL atual da aba.")
    st.markdown("**Criar Nova Aba**")
    st.markdown("Ao clicar no botão + da interface, o navegador envia um evento new-tab por IPC.")
    st.markdown("index.html")
    st.image("topbar_novaaba.png")
    
    st.markdown("main.js")
    st.image("abas_ipcmain.png")
    st.markdown("new-tab → Cria uma nova aba utilizando BrowserView, carrega a URL inicial e adiciona à lista de abas.")
    st.markdown("switch-tab → Alterna a aba ativa exibida na janela principal.")
    st.markdown("close-tab → Fecha uma aba específica e reorganiza as abas restantes.")
    st.subheader("Multiprocessamento e Isolamento por abas:")
    st.markdown("O navegador foi projetado com suporte ao modelo multiprocessado, no qual cada aba é implementada como uma instância independente de BrowserWindow. Isso garante que cada aba opere em seu próprio processo de renderização, aumentando a segurança, estabilidade e desempenho da aplicação. A arquitetura adotada permite que o conteúdo de cada aba funcione de forma isolada, sem interferir nas demais. A criação dessas abas é feita no processo principal, com configurações de segurança como contextIsolation:true e nodeIntegration: false, prevenindo que páginas da web acessem diretamente APIs do Node.js ou módulos do sistema. Quando o usuário clica no botão de nova aba, é enviado um comando via IPC que aciona a criação da aba no processo principal. Esse processo já foi detalhado anteriormente, na seção referente ao suporte a múltiplas abas.")
    st.markdown("**Troca de Abas e Função switchTab()**")
    st.markdown("A alternância entre abas ocorre por meio da função switchTab(), responsável por ocultar todas as abas abertas e exibir apenas a aba atualmente ativa. Essa função percorre o array de abas abertas e usa os métodos .hide() e .show() para controlar a visibilidade das janelas.")
    st.image("function_switchtab.png")
    st.subheader("Monitoramento e Controle de CPU/RAM")
    st.markdown("Com o objetivo de aplicar conceitos de gerenciamento de recursos em sistemas operacionais, o navegador desenvolvido implementa um sistema de monitoramento contínuo do consumo de CPU e memória RAM. Esse controle foi realizado por meio do arquivo monitoramento.js, que executa funções específicas para acompanhar o uso de recursos e aplicar restrições em tempo real. Monitoramento de Recursos No arquivo monitoramento.js, foi criada uma rotina periódica utilizando setInterval, que realiza a leitura do uso de CPU e memória do sistema a cada determinado intervalo de tempo. As informações são capturadas usando a biblioteca os, nativa do Node.js. As porcentagens de consumo são exibidas diretamente no terminal do Linux, facilitando o diagnóstico e testes durante a execução do navegador.")
    st.image("linux_monitor.png")
    st.markdown("Explicação da Função de Monitoramento")
    st.markdown("A função principal do arquivo é monitoramento(app, win, dialog). Abaixo estão seus principais componentes:")
    st.markdown("● 1. Coleta de uso de CPU: Utiliza o comando top do terminal para capturar a porcentagem da CPU em uso, através de exec(). O valor é processado com expressões regulares para extrair a parte relevante da saída do terminal.")
    st.markdown("● 2. Coleta de uso de Memória RAM: Executa o comando free -m e calcula a porcentagem de memória utilizada com base nos valores de total e usado, extraídos da linha contendo a palavra 'mem'.")
    st.image("cpuraw.png")
    st.markdown("Executa o comando top no terminal e extrai o valor de CPU ociosa (id). Subtrai de 100 para obter a porcentagem de CPU em uso real.")
    st.image("calculo_memoria.png")
    st.markdown("● 3. Exibição no terminal: O consumo de CPU e RAM é exibido no terminal em tempo real com process.stdout.write(...), substituindo a linha anterior para manter a tela limpa.")
    st.image("print_terminal.png")
    st.markdown("**Controle de Limites e Ações Preventivas**")
    st.markdown("Além do monitoramento passivo, foi implementado um mecanismo de controle de limites: quando o consumo de CPU ou RAM ultrapassa um valor definido (ex: 80%), o sistema executa uma ação de segurança. Essa ação consiste em enviar uma mensagem ao processo principal ou à interface, fazendo com que o navegador exiba uma tela de alerta com a opção de fechar ou continuar com o navegador. Isso simula um sistema de proteção contra sobrecarga, comum em navegadores modernos")
    st.markdown("**Exibição do Alerta no Navegador**")
    st.markdown("A comunicação entre o monitoramento.js e o navegador foi feita por meio de IPC (ou chamada direta dependendo da arquitetura). Quando o limite é ultrapassado, é disparado um evento que resulta na exibição de uma janela modal com aviso de alto consumo, permitindo ao usuário decidir se deseja continuar ou encerrar o navegador. Esse alerta é importante tanto para a usabilidade quanto para a estabilidade do sistema, evitando que o navegador consuma recursos excessivos sem controle.")
    st.image("alerta.png")
    st.markdown("● Se o uso de CPU passar de 90% ou RAM de 80%, exibe alerta modal no navegador")
    st.markdown("● O usuário pode fechar o navegador ou ignorar o alerta.")
    st.markdown("● Isso garante que o sistema continue estável, mesmo sob uso excessivo de recursos.")
    pass

elif opcao == "Testes":
    st.subheader("Gráficos de Desempenho")
    
    # Seção de métricas resumidas
    st.subheader("Métricas Resumidas")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Máximo de CPU", f"{df_all['cpu_percent'].max():.1f}%")
    with col2:
        st.metric("Média de CPU", f"{df_all['cpu_percent'].mean():.1f}%")
    with col3:
        st.metric("Máximo de RAM", f"{df_all['ram_percent'].max():.1f}%")
    
    # Selectbox para escolher o tipo de visualização
    vis_type = st.selectbox("Tipo de Visualização:", 
                          ["Linha Temporal", "Comparação Direta", "Relação CPU-RAM"])
    
    if vis_type == "Linha Temporal":
        resource = st.radio("Recurso:", ["CPU", "RAM", "Ambos"])
        
        if resource == "CPU":
            fig = px.line(df_all, x="timestamp", y="cpu_percent", color="teste", 
                         title="Uso de CPU ao longo do tempo")
        elif resource == "RAM":
            fig = px.line(df_all, x="timestamp", y="ram_percent", color="teste", 
                         title="Uso de RAM ao longo do tempo")
        else:
            fig = make_subplots(specs=[[{"secondary_y": True}]])
            for teste in df_all['teste'].unique():
                df_temp = df_all[df_all['teste'] == teste]
                fig.add_trace(
                    go.Scatter(x=df_temp['timestamp'], y=df_temp['cpu_percent'], name=f"{teste} - CPU"),
                    secondary_y=False,
                )
                fig.add_trace(
                    go.Scatter(x=df_temp['timestamp'], y=df_temp['ram_percent'], name=f"{teste} - RAM"),
                    secondary_y=True,
                )
            fig.update_layout(title="Uso de CPU e RAM ao longo do tempo")
            fig.update_yaxes(title_text="CPU (%)", secondary_y=False)
            fig.update_yaxes(title_text="RAM (%)", secondary_y=True)
            
        st.plotly_chart(fig, use_container_width=True)
        
    elif vis_type == "Comparação Direta":
        fig = px.box(df_all, 
                    x="teste", 
                    y=["cpu_percent", "ram_percent"],
                    title="Distribuição de Uso de Recursos por Teste",
                    labels={"value": "Percentual de Uso", "variable": "Recurso"})
        st.plotly_chart(fig, use_container_width=True)
        
    else:  # Relação CPU-RAM
        fig_scatter = px.scatter(df_all, 
                       x="cpu_percent", 
                       y="ram_percent",
                       color="teste",
                       title="Relação entre Uso de CPU e RAM",
                       labels={"cpu_percent": "Uso de CPU (%)", "ram_percent": "Uso de RAM (%)"})
    
    # Análise por teste específico
    st.subheader("Análise Detalhada por Teste")
    selected_test = st.selectbox("Selecione um teste para análise detalhada:", df_all['teste'].unique())
    
    df_test = df_all[df_all['teste'] == selected_test]
    
    col1, col2 = st.columns(2)
    with col1:
        st.metric(f"Máximo CPU ({selected_test})", f"{df_test['cpu_percent'].max():.1f}%")
    with col2:
        st.metric(f"Máximo RAM ({selected_test})", f"{df_test['ram_percent'].max():.1f}%")
    
    fig_test = px.line(df_test, x="timestamp", y=["cpu_percent", "ram_percent"],
                      title=f"Uso de Recursos - {selected_test}")
    st.plotly_chart(fig_test, use_container_width=True)