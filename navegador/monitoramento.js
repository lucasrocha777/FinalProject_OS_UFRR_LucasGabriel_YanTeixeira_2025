const { exec } = require('child_process'); // Importa a função `exec` para executar comandos de shell
const fs = require('fs'); // Importa o módulo `fs` (File System) para interagir com o sistema de arquivos
const path = require('path'); // Importa o módulo `path` para lidar com caminhos de arquivos
const logFilePath = path.join(__dirname, 'Monitoramento.csv'); // Define o caminho para o arquivo de log CSV

// Se o arquivo de log não existir, ele é criado com um cabeçalho
if (!fs.existsSync(logFilePath)) {
    // Escreve o cabeçalho no arquivo, usando ';' como separador de colunas
    fs.writeFileSync(logFilePath, 'Data;Hora;CPU;RAM\n', 'utf8');
}

// A função `monitoramento` exporta a lógica principal de monitoramento
function monitoramento(app, win, dialog) {
    let alertando = false; // Flag para evitar que múltiplos alertas sejam exibidos ao mesmo tempo

    // Configura um loop para ser executado a cada 1500 milissegundos (1.5 segundos)
    setInterval(() => {
        // Executa o comando `top` para obter informações sobre a CPU
        // `LANG=C` garante a saída em inglês para facilitar o parsing
        // `-bn1` executa o `top` em modo de lote e exibe uma única iteração
        // `grep '%Cpu(s)'` filtra a saída para a linha que contém o uso de CPU
        exec("LANG=C top -bn1 | grep '%Cpu(s)'", (err, stdout) => {
            if (err) {
                console.error('Erro ao coletar a CPU:', err);
                return;
            }

            // Usa uma expressão regular para extrair a porcentagem de CPU inativa (id)
            const cpuMatch = stdout.match(/(\d+\.\d+)%?\s*id/);
            // Calcula o uso real da CPU subtraindo a porcentagem inativa de 100
            const cpuRaw = cpuMatch ? (100 - parseFloat(cpuMatch[1])) : NaN;

            // Executa o comando `free -m` para obter informações de memória em megabytes
            exec("free -m", (err, memOut) => {
                if (err) {
                    console.error('Erro ao coletar a memória:', err);
                    return;
                }

                try {
                    // Processa a saída do comando `free -m`
                    const lines = memOut.split('\n');
                    const memLine = lines.find(line => line.toLowerCase().includes('mem')); // Encontra a linha que começa com 'Mem'
                    if (!memLine) throw new Error('Linha de memória não encontrada');

                    const memValues = memLine.trim().split(/\s+/); // Divide a linha em um array de valores
                    const total = parseInt(memValues[1], 10); // Pega o valor total de memória
                    const used = parseInt(memValues[2], 10); // Pega o valor de memória usada
                    const memRaw = (used / total) * 100; // Calcula a porcentagem de uso de memória

                    // Formata os valores brutos para exibição e log
                    const cpuFormatted = Number.isFinite(cpuRaw) ? cpuRaw.toFixed(2) : 'N/A';
                    const memFormatted = Number.isFinite(memRaw) ? memRaw.toFixed(2) : 'N/A';

                    // Atualiza uma única linha no console para mostrar o status em tempo real
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    process.stdout.write(`\r[Monitoramento] CPU: ${cpuFormatted}% | RAM: ${memFormatted}% `);

                    // Cria uma linha de log formatada para o arquivo CSV
                    const now = new Date();
                    const date = now.toLocaleDateString('sv-SE'); // Formato de data ISO 8601 (YYYY-MM-DD)
                    const time = now.toLocaleTimeString('pt-BR'); // Formato de hora (HH:MM:SS)
                    const line = `${date};${time};${cpuFormatted};${memFormatted}\n`;
                    fs.appendFileSync(logFilePath, line, 'utf8'); // Adiciona a linha ao arquivo CSV

                    // Log adicional em um arquivo .log
                    const iso = now.toISOString(); // Formato ISO para timestamp
                    fs.appendFileSync('Monitoramento.log', `[${iso}] CPU: ${cpuFormatted}% | RAM: ${memFormatted}%\n`);

                    // Se uma janela (`win`) existir, envia os dados para a interface
                    if (win && win.webContents) {
                        win.webContents.send('monitoramento-dados', {
                            cpu: cpuRaw,
                            mem: memRaw,
                            cpuFormatted,
                            memFormatted,
                            timestamp: iso
                        });
                    }

                    // Lógica para disparar um alerta se o uso de recursos for muito alto
                    if (!alertando && (cpuRaw > 90 || memRaw > 80)) {
                        alertando = true; // Ativa a flag para evitar múltiplos alertas
                        if (win && win.webContents) win.webContents.send('congelar'); // Envia um comando para "congelar" a interface

                        const response = dialog.showMessageBoxSync(win, {
                            type: 'warning',
                            buttons: ['Fechar Navegador', 'Cancelar'],
                            defaultId: 0,
                            cancelId: 1,
                            title: 'Alerta de Recursos',
                            message: 'Uso de recursos elevado',
                            detail: `Uso de CPU: ${cpuFormatted}% | RAM: ${memFormatted}%`
                        });

                        // Se o usuário escolher "Fechar Navegador", encerra a aplicação
                        if (response === 0) {
                            app.quit();
                        } else {
                            alertando = false; // Se o usuário cancelar, permite novos alertas
                        }
                    }

                } catch (parseErr) {
                    console.error('Erro ao analisar saída de memória:', parseErr);
                }
            });
        });
    }, 1500); // Fim do `setInterval`
}

module.exports = monitoramento; // Exporta a função para ser usada em `main.js`
