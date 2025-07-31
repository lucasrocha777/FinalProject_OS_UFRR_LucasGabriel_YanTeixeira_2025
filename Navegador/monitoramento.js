const { exec } = require('child_process');
const fs = require('fs');

function monitoramento(app, win, dialog) {
    let alertando = false;

    setInterval(() => {
        exec("LANG=C top -bn1 | grep '%Cpu(s)'", (err, stdout) => {
            if (err) return console.error('Erro ao coletar a CPU:', err);

            const cpuMatch = stdout.match(/(\d+\.\d+)%?\s*id/);
            const cpuUsage = cpuMatch ? (100 - parseFloat(cpuMatch[1])).toFixed(2) : "N/A";

            exec("free -m", (err, memOut) => {
                if (err) return;

                const lines = memOut.split('\n');
                const memLine = lines.find(line => line.toLowerCase().includes('mem'));
                const memValues = memLine.trim().split(/\s+/);
                const total = parseInt(memValues[1]);
                const used = parseInt(memValues[2]);
                const memUsage = ((used / total) * 100).toFixed(2);

                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);
                process.stdout.write(`\r[Monitoramento] CPU: ${cpuUsage}% | RAM: ${memUsage}% `);

                const now = new Date().toISOString();
                fs.appendFileSync('Monitoramento.log', `[${now}] CPU: ${cpuUsage}% | RAM: ${memUsage}%\n`);

                if (!alertando && (cpuUsage > 90 || memUsage > 80)) {
                    alertando = true;
                    win.webContents.send('congelar'); // opcional, se quiser travar renderizador

                    const response = dialog.showMessageBoxSync(win, {
                        type: 'warning',
                        buttons: ['Fechar Navegador', 'Cancelar'],
                        defaultId: 0,
                        cancelId: 1,
                        title: 'Alerta de Recursos',
                        message: 'O navegador não está respondendo',
                        detail: `Uso de CPU: ${cpuUsage}% | RAM: ${memUsage}%`
                    });

                    if (response === 0) {
                        app.quit();
                    } else {
                        alertando = false; // permite novo alerta se continuar alto
                    }
                }
            });
        });
    }, 1500); // 
}

module.exports = monitoramento;
