# ⚡ Meu Sistema Operacional Pessoal

Projeto desenvolvido para a disciplina **Produtividade e Gestão do Tempo**.

O sistema foi criado com o objetivo de centralizar tarefas, compromissos e prioridades em um único ambiente, utilizando **automação e Inteligência Artificial** como apoio à organização pessoal e à gestão do tempo.

---

## 👩‍💻 Identificação

**Aluna:** Eugenia Kazue Takara Stefens  
**RA:** 237219  
**Curso:** Graduação Tecnológica em Inteligência Artificial e Automação Digital  
**Disciplina:** Produtividade e Gestão do Tempo

---

## 🎯 Objetivo do projeto

O **Meu Sistema Operacional Pessoal** foi desenvolvido para facilitar a organização de uma rotina que envolve diferentes áreas, como:

- 💼 Trabalho
- 🎓 Faculdade
- 🏠 Pessoal
- 👨‍👩‍👧 Família

A proposta é reduzir o tempo gasto organizando tarefas manualmente e facilitar a identificação do que precisa ser feito primeiro.

Para isso, o sistema reúne **dashboard, calendário, Matriz de Eisenhower, automação e Inteligência Artificial** em uma única solução.

---

## 🖥️ Visão Geral do Sistema

O dashboard foi desenvolvido em **HTML, CSS e JavaScript** e funciona como a interface principal do sistema.

Por meio dele é possível:

- cadastrar novas tarefas;
- informar data e horário;
- informar uma área ou deixar a IA decidir;
- visualizar o total de tarefas;
- acompanhar tarefas prioritárias;
- visualizar tarefas concluídas;
- identificar automaticamente tarefas não concluídas com prazo expirado;
- consultar as próximas atividades;
- acompanhar o planejamento pelo calendário;
- visualizar a Matriz de Eisenhower.

### Dashboard principal

![Dashboard Geral](images/dashboard-geral.png)

---

## 🧠 Técnica de produtividade utilizada

A principal técnica utilizada no projeto é a **Matriz de Eisenhower**.

Ela organiza as atividades considerando dois critérios: **urgência** e **importância**.

As tarefas são classificadas em quatro grupos:

- 🔴 **Fazer agora** — urgente e importante;
- 🟠 **Planejar** — importante e não urgente;
- 🔵 **Delegar** — urgente e não importante;
- ⚪ **Adiar/Eliminar** — não urgente e não importante.

No sistema, essa classificação é realizada com apoio da Inteligência Artificial e apresentada visualmente em uma área específica do dashboard.

### Matriz de Eisenhower

![Matriz de Eisenhower](images/eisenhower.png)

---

## 📅 Planejamento e organização

O sistema possui um calendário mensal que permite visualizar as tarefas de acordo com suas datas e horários.

Também é possível utilizar filtros por **área** e **prioridade**, facilitando a visualização das atividades de acordo com o contexto desejado.

### Calendário mensal

![Calendário](images/calendario.png)

---

## 🤖 Utilização da Inteligência Artificial

A Inteligência Artificial é utilizada como apoio à organização e à tomada de decisão.

Ao cadastrar uma tarefa, o sistema envia as informações para o **Google Gemini**, que analisa a atividade e retorna:

- área;
- urgência;
- importância;
- prioridade;
- tempo estimado.

A prioridade é definida de acordo com a lógica da Matriz de Eisenhower.

Dessa forma, o usuário não precisa classificar manualmente cada nova atividade.

---

## 🔄 Automação do cadastro

O processo de cadastro funciona da seguinte forma:

```text
Usuário
   ↓
Dashboard HTML
   ↓
Webhook do Make
   ↓
Google Gemini
   ↓
Text Parser
   ↓
Notion
```

O **Make** funciona como responsável pela automação e integração entre a interface, a Inteligência Artificial e a base de dados.

### Cenário de cadastro no Make

![Automação de Cadastro](images/make-cadastro.png)

---

## 🔄 Integração do Dashboard

Além do cadastro, foi criada uma segunda integração para que o dashboard possa consultar as tarefas armazenadas no Notion.

O fluxo funciona da seguinte forma:

```text
Dashboard HTML
   ↓
Webhook do Make
   ↓
Notion API
   ↓
Webhook Response
   ↓
Dashboard atualizado
```

Assim, as tarefas armazenadas na base podem ser utilizadas pelo próprio dashboard para alimentar o calendário, os indicadores, as listas e a Matriz de Eisenhower.

### Cenário de integração do Dashboard

![Integração do Dashboard](images/make-dashboard.png)

---

## 🗃️ Base de dados

O **Notion** é utilizado como base de dados para armazenar e gerenciar as tarefas.

Cada tarefa pode possuir as seguintes informações:

| Campo            | Função                                  |
| ---------------- | --------------------------------------- |
| Tarefa           | Descrição da atividade                  |
| Área             | Trabalho, Faculdade, Pessoal ou Família |
| Prazo            | Data e horário                          |
| Urgente?         | Identifica se a tarefa é urgente        |
| Importante?      | Identifica se a tarefa é importante     |
| Prioridade       | Classificação pela Matriz de Eisenhower |
| Status           | Situação atual da tarefa                |
| Tempo estimado   | Estimativa de duração                   |
| Data de cadastro | Registro da criação da tarefa           |

### Base de tarefas no Notion

![Base do Notion](images/notion-base.png)

---

## 🛠️ Tecnologias utilizadas

| Tecnologia        | Utilização                               |
| ----------------- | ---------------------------------------- |
| **HTML**          | Estrutura da interface                   |
| **CSS**           | Design e organização visual              |
| **JavaScript**    | Funcionamento dinâmico do dashboard      |
| **Make**          | Automação e integração                   |
| **Google Gemini** | Análise e classificação das tarefas      |
| **Notion**        | Armazenamento e gerenciamento dos dados  |
| **GitHub**        | Versionamento e armazenamento do projeto |
| **GitHub Pages**  | Publicação da interface web              |

---

## 🔁 Fluxo completo da solução

O sistema possui dois fluxos principais.

### 1. Cadastro inteligente

```text
Nova tarefa
    ↓
HTML / JavaScript
    ↓
Make
    ↓
Google Gemini
    ↓
Classificação com IA
    ↓
Notion
```

### 2. Visualização

```text
Notion
    ↓
Make
    ↓
Webhook Response
    ↓
HTML / JavaScript
    ↓
Dashboard
```

Essa arquitetura permite separar a **interface visual**, a **automação**, a **Inteligência Artificial** e a **base de dados**.

---

## 🔗 Links do projeto

- **Dashboard publicado (GitHub Pages):** https://takarakazue.github.io/produtividade-gestao-tempo/
- **Código-fonte e documentação (GitHub):** https://github.com/takarakazue/produtividade-gestao-tempo

O dashboard publicado permite visualizar a interface desenvolvida e demonstrar o funcionamento do sistema. O repositório contém o código-fonte, o README e as imagens utilizadas na documentação do projeto.

---

## 🚀 Como utilizar

1. Acesse o dashboard.
2. Digite a tarefa no campo **Nova tarefa**.
3. Informe a data e o horário, caso necessário.
4. Se desejar, selecione a área da tarefa.
5. Caso não escolha uma área, deixe a opção **Deixar a IA decidir**.
6. Clique em **Organizar com IA**.
7. A tarefa será enviada ao Make.
8. O Gemini analisará e classificará a tarefa.
9. O Make registrará as informações no Notion.
10. O dashboard consulta os dados armazenados e apresenta as tarefas nas áreas correspondentes.

---

## ✨ Funcionalidades

O sistema desenvolvido possui:

- cadastro de tarefas;
- classificação automática com IA;
- identificação de urgência e importância;
- Matriz de Eisenhower;
- estimativa de tempo;
- organização por áreas;
- planejamento por data e horário;
- calendário mensal;
- filtros por área e prioridade;
- indicadores de produtividade;
- lista de próximas tarefas;
- visualização de tarefas prioritárias;
- acompanhamento de status;
- monitoramento de tarefas atrasadas por data e horário;
- integração com base de dados;
- automação entre diferentes ferramentas.

---

## 📈 Ganhos esperados

A utilização do sistema busca proporcionar:

- maior centralização das informações;
- redução do tempo gasto organizando tarefas;
- melhor visualização das prioridades;
- redução de esquecimentos;
- apoio ao planejamento da rotina por datas, horários e calendário mensal;
- redução de retrabalho;
- maior clareza sobre tarefas urgentes e importantes;
- melhor equilíbrio entre trabalho, faculdade, vida pessoal e família.

A Inteligência Artificial atua como **apoio à organização**, enquanto a decisão final e o acompanhamento das atividades permanecem sob responsabilidade do usuário.

---

## 📁 Estrutura do projeto

```text
Meu-Sistema-Operacional-Pessoal/
│
├── index.html
├── style.css
├── script.js
├── README.md
│
└── images/
    ├── dashboard-geral.png
    ├── calendario.png
    ├── eisenhower.png
    ├── make-cadastro.png
    ├── make-dashboard.png
    └── notion-base.png
```

---

## 🎓 Considerações finais

O projeto demonstra como diferentes ferramentas digitais podem ser integradas para criar um sistema pessoal de produtividade.

A combinação entre **dashboard web, Matriz de Eisenhower, calendário, automação, Inteligência Artificial e armazenamento de dados** permite transformar o gerenciamento de tarefas em um processo mais visual, centralizado e automatizado.

Mais do que simplesmente registrar tarefas, a solução utiliza IA para auxiliar na organização das prioridades e no planejamento do tempo.

---

## 👩‍💻 Autora

**Eugenia Kazue Takara Stefens**  
**RA: 237219**  
**Graduação Tecnológica em Inteligência Artificial e Automação Digital**
