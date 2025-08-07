# Navegador Gon Web Browser (Projeto Final de Sistemas Operacionais)

Projeto final da disciplina **Sistemas Operacionais (DCC403)** da **Universidade Federal de Roraima (UFRR)**.  
O objetivo é **construir um navegador web minimalista** que aplique conceitos fundamentais de sistemas operacionais, tais como:
- Gerenciamento de processos e threads
- Controle de memória e uso de CPU
- Comunicação entre processos
- Interação com o sistema de arquivos
- Rede e segurança (sandboxing)

---
<img width="3920" height="2160" alt="Image" src="https://github.com/user-attachments/assets/b8ebe8a2-f9dd-47f6-b33f-bba11dbe4036" />

## Descrição do Projeto

Este projeto visa criar um **navegador leve e funcional**, utilizando bibliotecas já consolidadas para renderização e interface gráfica.  
O foco está na **integração entre os módulos** e na compreensão de como o **sistema operacional** participa em cada parte do funcionamento do navegador.

**Principais características planejadas:**
- Interface gráfica baseada no **Electron**
- Módulo em **C** para coleta de informações do sistema (CPU, memória) e simulação de funcionalidades relacionadas ao SO
- Armazenamento de histórico e favoritos utilizando **SQLite**
- Estrutura multiprocessada: cada aba será executada de forma isolada
- Implementação de recursos básicos: barra de endereços, botões de navegação (voltar/avançar), histórico e favoritos
- Planejamento de segurança: isolamento de abas e restrições de acesso ao sistema de arquivos

---

## Tecnologias Utilizadas

- **Electron (Node.js + Chromium)**
- **C**
- **SQLite**
- **JavaScript, HTML e CSS**
- **N-API (Node.js Addons)**
- **Linux (ambiente principal de desenvolvimento e testes)**

---

## Autores

| Nome                  | GitHub                                           | LinkedIn                                                     |
|----------------------|-------------------------------------------------|-------------------------------------------------------------|
| *[Lucas Gabriel R.C.]*         | [lucasrocha777](https://github.com/lucasrocha777) | [Lucas Rocha](https://www.linkedin.com/in/lucas-rochadev)   |
| *[Yan Teixeira]*      | [Yan-Teixeira](https://github.com/Yan-Teixeira)   | [Yan Teixeira](https://www.linkedin.com/in/yan-teixeira-32ab82257) |

---

## Informações Acadêmicas

- **Disciplina:** Sistemas Operacionais – DCC403  
- **Instituição:** Universidade Federal de Roraima – UFRR  
- **Professor:** *[Hebert Oliveira Rocha]*  
- **Ano/Semestre:** 2025.1  

> **Nota:** Não incluímos matrículas aqui por segurança. Caso seja necessário, elas podem ser adicionadas apenas no relatório final ou enviadas de forma privada ao professor.

---

## Como Executar (em desenvolvimento)

```bash
# Clonar o repositório
git clone https://github.com/<seu-repositorio>.git
cd <seu-repositorio>

# Instalar dependências do Electron
npm install

# Compilar módulo em C (exemplo)
gcc backend/monitor.c -o backend/monitor.o

# Executar
npm start
```
# Testes Planejados
- Testes de abertura de múltiplas abas e monitoramento do consumo de memória

- Testes de histórico e favoritos

- Medição do uso de CPU e RAM por aba

- Testes de isolamento e permissões de acesso ao sistema de arquivos

# Licença
- Projeto acadêmico – uso livre apenas para fins educacionais.
