 //função de monitoramento
const {exec} = require('child_process');

function monitoramento(){
    setInterval(() => {
        exec("LANG=C top -bn1 | grep '%Cpu(s)'", (err, stdout) => {
            if (err) return console.error('Erro ao coletar a CPU:', err);


            //CPU
            const cpuMatch = stdout.match(/(\d+\.\d+)%?\s*id/);
            const cpuUsage = cpuMatch ? (100 - parseFloat(cpuMatch[1])).toFixed(2) : "N/A";

            //RAM
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

            });
        });
    }, 500);
}
module.exports = monitoramento;