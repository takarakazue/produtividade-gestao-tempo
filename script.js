/* =========================================================
   MEU SISTEMA OPERACIONAL PESSOAL
========================================================= */

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/* =========================================================
   WEBHOOKS
========================================================= */

const WEBHOOK_URL =
  "https://hook.eu1.make.com/y7wnxqt8dmq4mbghphhsb4d4j4asreep";

const DASHBOARD_WEBHOOK_URL =
  "https://hook.eu1.make.com/peflgkytud992s32rgwy8arli86yppri";

/* =========================================================
   ESTADO
========================================================= */

let current = new Date();

let tasks = [];

/* =========================================================
   CARREGAR TAREFAS
========================================================= */

async function loadTasks(showMessage = true) {
  if (!DASHBOARD_WEBHOOK_URL || DASHBOARD_WEBHOOK_URL.includes("COLE_AQUI")) {
    console.warn("Webhook do Dashboard não configurado.");

    return;
  }

  try {
    if (showMessage) {
      showToast("Atualizando tarefas...");
    }

    const response = await fetch(DASHBOARD_WEBHOOK_URL, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Erro ao carregar dashboard: ${response.status}`);
    }

    const data = await response.json();

    const results = Array.isArray(data.results) ? data.results : [];

    tasks = results.map(convertNotionTask).filter((task) => task.title);

    render();

    if (showMessage) {
      showToast("Dashboard atualizado!");
    }
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);

    showToast("Não foi possível carregar as tarefas.");
  }
}

/* =========================================================
   CONVERTER DADOS DO NOTION
========================================================= */

function convertNotionTask(page) {
  const properties = page.properties || {};

  const title = properties["Tarefa"]?.title?.[0]?.plain_text || "";

  const rawArea = properties["Área"]?.select?.name || "";

  const rawPriority = properties["Prioridade"]?.select?.name || "";

  const status = properties["Status"]?.status?.name || "Não iniciada";

  const urgent = properties["Urgente?"]?.checkbox || false;

  const important = properties["Importante?"]?.checkbox || false;

  const estimated = properties["Tempo estimado (min)"]?.number ?? null;

  const created =
    properties["Data de cadastro"]?.created_time || page.created_time || "";

  const prazo = properties["Prazo"]?.date?.start || "";

  let date = "";
  let time = "";

  if (prazo) {
    date = prazo.substring(0, 10);

    if (prazo.includes("T")) {
      time = prazo.substring(11, 16);
    }
  }

  return {
    id: page.id,

    title,

    date,

    time,

    area: normalizeArea(rawArea),

    priority: normalizePriority(rawPriority),

    status,

    urgent,

    important,

    estimated,

    created,

    notionUrl: page.url || "",
  };
}

/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizeArea(value) {
  if (!value) {
    return "Sem área";
  }

  const text = value.toLowerCase();

  if (text.includes("trabalho")) {
    return "Trabalho";
  }

  if (text.includes("faculdade")) {
    return "Faculdade";
  }

  if (text.includes("família") || text.includes("familia")) {
    return "Família";
  }

  if (text.includes("pessoal")) {
    return "Pessoal";
  }

  return value.replace(/[^\p{L}\p{N}\s/-]/gu, "").trim();
}

function normalizePriority(value) {
  if (!value) {
    return "Sem prioridade";
  }

  const text = value.toLowerCase();

  if (text.includes("fazer agora")) {
    return "Fazer agora";
  }

  if (text.includes("planejar")) {
    return "Planejar";
  }

  if (text.includes("delegar")) {
    return "Delegar";
  }

  if (text.includes("adiar") || text.includes("eliminar")) {
    return "Adiar/Eliminar";
  }

  return value.replace(/[^\p{L}\p{N}\s/-]/gu, "").trim();
}

/* =========================================================
   STATUS
========================================================= */

function isDone(task) {
  const status = (task.status || "").toLowerCase();

  return (
    status === "concluído" ||
    status === "concluída" ||
    status === "concluido" ||
    status === "concluida"
  );
}

/* =========================================================
   ATUALIZAR STATUS
========================================================= */

let statusUpdateInProgress = false;

async function updateTaskStatus(pageId, newStatus) {
  if (!pageId || statusUpdateInProgress) {
    return;
  }

  statusUpdateInProgress = true;

  try {
    showToast("Atualizando status...");

    const response = await fetch(DASHBOARD_WEBHOOK_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        acao: "status",
        page_id: pageId,
        status: newStatus,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar status: ${response.status}`);
    }

    if (newStatus === "Em andamento") {
      showToast("▶ Tarefa iniciada!");
    }

    if (newStatus === "Concluído") {
      showToast("✅ Tarefa concluída!");
    }

    await loadTasks(false);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);

    showToast("Não foi possível atualizar o status.");
  } finally {
    statusUpdateInProgress = false;
  }
}

/* =========================================================
   CONTROLE VISUAL DO STATUS
========================================================= */

function taskStatusControl(task) {
  const status = (task.status || "").toLowerCase();

  if (isDone(task)) {
    return `
      <span class="task-status-done">
        ✅ Concluída
      </span>
    `;
  }

  if (status === "em andamento") {
    return `
      <div class="task-status-actions">

        <span class="task-status-progress">
          ● Em andamento
        </span>

        <button
          type="button"
          class="task-status-btn task-finish-btn"
          onclick="updateTaskStatus('${task.id}', 'Concluído')"
        >
          ✓ Concluir
        </button>

      </div>
    `;
  }

  return `
    <button
      type="button"
      class="task-status-btn task-start-btn"
      onclick="updateTaskStatus('${task.id}', 'Em andamento')"
    >
      ▶ Iniciar
    </button>
  `;
}

/* =========================================================
   PRAZO / ATRASO
========================================================= */

/*
Se houver horário:
2026-09-22 + 10:30
vira atraso após 10:30.

Se houver somente data:
a tarefa só fica atrasada depois
das 23:59 daquele dia.
*/

function getDeadline(task) {
  if (!task.date) {
    return null;
  }

  let deadline;

  if (task.time) {
    deadline = new Date(`${task.date}T${task.time}:00`);
  } else {
    deadline = new Date(`${task.date}T23:59:59.999`);
  }

  if (Number.isNaN(deadline.getTime())) {
    return null;
  }

  return deadline;
}

function isOverdue(task) {
  if (isDone(task)) {
    return false;
  }

  const deadline = getDeadline(task);

  if (!deadline) {
    return false;
  }

  return new Date() > deadline;
}

/* =========================================================
   TEXTO DO ATRASO
========================================================= */

function overdueLabel(task) {
  const deadline = getDeadline(task);

  if (!deadline) {
    return "";
  }

  const now = new Date();

  const difference = now.getTime() - deadline.getTime();

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    if (task.time) {
      return `Prazo expirado hoje às ${task.time}`;
    }

    return "Prazo expirado hoje";
  }

  if (days === 1) {
    return "Atrasada há 1 dia";
  }

  return `Atrasada há ${days} dias`;
}

/* =========================================================
   RENDER
========================================================= */

function render() {
  const areaFilter = document.getElementById("areaFilter").value;

  const priorityFilter = document.getElementById("priorityFilter").value;

  const filtered = tasks.filter((task) => {
    const areaOK = !areaFilter || task.area === areaFilter;

    const priorityOK = !priorityFilter || task.priority === priorityFilter;

    return areaOK && priorityOK;
  });

  renderCalendar(filtered);

  updateStats(filtered);

  renderLists(filtered);

  renderOverdue(filtered);

  renderCompleted(filtered);

  renderEisenhower(filtered);
}

/* =========================================================
   CALENDÁRIO
========================================================= */

function renderCalendar(list) {
  document.getElementById("monthTitle").textContent =
    `${MONTHS[current.getMonth()]} de ${current.getFullYear()}`;

  const calendar = document.getElementById("calendar");

  calendar.innerHTML = "";

  DOW.forEach((dayName) => {
    const element = document.createElement("div");

    element.className = "dow";

    element.textContent = dayName;

    calendar.appendChild(element);
  });

  const year = current.getFullYear();

  const month = current.getMonth();

  const firstDay = new Date(year, month, 1);

  const calendarStart = new Date(year, month, 1 - firstDay.getDay());

  const today = localISO(new Date());

  for (let i = 0; i < 42; i++) {
    const day = new Date(calendarStart);

    day.setDate(calendarStart.getDate() + i);

    const iso = localISO(day);

    const box = document.createElement("div");

    box.className = "day";

    if (day.getMonth() !== month) {
      box.classList.add("muted");
    }

    if (iso === today) {
      box.classList.add("today");
    }

    box.innerHTML = `<div class="date">${day.getDate()}</div>`;

    list
      .filter((task) => task.date === iso)
      .sort((a, b) => (a.time || "23:59").localeCompare(b.time || "23:59"))
      .forEach((task) => {
        const element = document.createElement("div");

        element.className = "task";

        if (isDone(task)) {
          element.classList.add("done");
        }

        if (isOverdue(task)) {
          element.classList.add("overdue");
        }

        element.dataset.priority = task.priority;

        element.innerHTML = `${isOverdue(task) ? "🚨 " : ""}${
          task.time ? escapeHtml(task.time) + " · " : ""
        }${escapeHtml(task.title)}`;

        element.title = makeTooltip(task);

        box.appendChild(element);
      });

    calendar.appendChild(box);
  }
}

/* =========================================================
   INDICADORES
========================================================= */

function updateStats(list) {
  document.getElementById("totalStat").textContent = list.length;

  document.getElementById("urgentStat").textContent = list.filter(
    (task) => task.priority === "Fazer agora",
  ).length;

  document.getElementById("plannedStat").textContent = list.filter(
    (task) => task.priority === "Planejar",
  ).length;

  document.getElementById("overdueStat").textContent =
    list.filter(isOverdue).length;

  document.getElementById("doneStat").textContent = list.filter(isDone).length;
}

/* =========================================================
   PRÓXIMAS TAREFAS
========================================================= */

function renderLists(list) {
  const today = localISO(new Date());

  const future = [...list]

    .filter((task) => !isDone(task))

    .filter((task) => !isOverdue(task))

    .filter((task) => !task.date || task.date >= today)

    .sort(compareTasksByDate)

    .slice(0, 5);

  const urgent = [...list]

    .filter((task) => task.priority === "Fazer agora" && !isDone(task))

    .sort(compareTasksByDate)

    .slice(0, 5);

  renderAgendaList("upcoming", future, false);

  renderAgendaList("priorityList", urgent, true);
}

/* =========================================================
   LISTAS DO DASHBOARD
========================================================= */

function renderAgendaList(elementId, list, forcePriority) {
  const container = document.getElementById(elementId);

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty">
        Nenhuma tarefa.
      </div>
    `;

    return;
  }

  container.innerHTML = list
    .map((task) => {
      return `
        <div class="agenda-item">

          <div>

            <strong>
              ${escapeHtml(task.title)}
            </strong>

            <div class="meta">

              ${formatDate(task.date)}

              ${task.time ? " · " + escapeHtml(task.time) : ""}

              · ${escapeHtml(task.area)}

              ${task.estimated !== null ? " · " + task.estimated + " min" : ""}

            </div>

          </div>

          <div class="task-control-area">

            <span class="pill">
              ${forcePriority ? "Fazer agora" : escapeHtml(task.priority)}
            </span>

            ${taskStatusControl(task)}

          </div>

        </div>
      `;
    })
    .join("");
}

/* =========================================================
   TAREFAS ATRASADAS
========================================================= */

function renderOverdue(list) {
  const container = document.getElementById("overdueList");

  const overdue = [...list].filter(isOverdue).sort(compareTasksByDate);

  if (overdue.length === 0) {
    container.innerHTML = `
      <div class="empty">
        ✅ Nenhuma tarefa atrasada.
      </div>
    `;

    return;
  }

  container.innerHTML = overdue
    .map((task) => {
      return `
        <div class="overdue-item">

          <div>

            <strong>
              ${escapeHtml(task.title)}
            </strong>

            <div class="overdue-meta">

              ${escapeHtml(task.area)}

              · Prazo:
              ${formatDate(task.date)}

              ${task.time ? " às " + escapeHtml(task.time) : ""}

              · ${escapeHtml(task.priority)}

            </div>

          </div>

          <div class="task-control-area">

            <span class="overdue-badge">
              ${escapeHtml(overdueLabel(task))}
            </span>

            ${taskStatusControl(task)}

          </div>

        </div>
      `;
    })
    .join("");
}

/* =========================================================
   TAREFAS CONCLUÍDAS
========================================================= */

function renderCompleted(list) {
  const container = document.getElementById("completedList");

  const completed = [...list]
    .filter(isDone)
    .sort((a, b) => {
      const dateA = `${a.date || "0000-00-00"} ${a.time || "00:00"}`;
      const dateB = `${b.date || "0000-00-00"} ${b.time || "00:00"}`;

      return dateB.localeCompare(dateA);
    })
    .slice(0, 8);

  if (completed.length === 0) {
    container.innerHTML = `
      <div class="empty">
        Nenhuma tarefa concluída.
      </div>
    `;

    return;
  }

  container.innerHTML = completed
    .map((task) => {
      return `
        <div class="completed-item">

          <div>

            <strong>
              ${escapeHtml(task.title)}
            </strong>

            <div class="completed-meta">

              ${escapeHtml(task.area)}

              · ${formatDate(task.date)}

              ${task.time ? " · " + escapeHtml(task.time) : ""}

              · ${escapeHtml(task.priority)}

            </div>

          </div>

          <span class="completed-badge">
            ✅ Concluída
          </span>

        </div>
      `;
    })
    .join("");
}

/* =========================================================
   MATRIZ DE EISENHOWER
========================================================= */

function renderEisenhower(list) {
  const now = list.filter(
    (task) => task.priority === "Fazer agora" && !isDone(task),
  );

  const plan = list.filter(
    (task) => task.priority === "Planejar" && !isDone(task),
  );

  const delegate = list.filter(
    (task) => task.priority === "Delegar" && !isDone(task),
  );

  const later = list.filter(
    (task) => task.priority === "Adiar/Eliminar" && !isDone(task),
  );

  renderQuadrant("eisenhowerNow", "countNow", now);

  renderQuadrant("eisenhowerPlan", "countPlan", plan);

  renderQuadrant("eisenhowerDelegate", "countDelegate", delegate);

  renderQuadrant("eisenhowerLater", "countLater", later);
}

/* =========================================================
   QUADRANTES
========================================================= */

function renderQuadrant(listId, countId, list) {
  const container = document.getElementById(listId);

  const count = document.getElementById(countId);

  count.textContent = list.length;

  const ordered = [...list].sort(compareTasksByDate);

  if (ordered.length === 0) {
    container.innerHTML = `
        <div class="eisenhower-empty">
          Nenhuma tarefa neste quadrante.
        </div>
      `;

    return;
  }

  container.innerHTML = ordered
    .map((task) => {
      return `
            <div class="eisenhower-task">

              <strong>

                ${isOverdue(task) ? "🚨 " : ""}

                ${escapeHtml(task.title)}

              </strong>

              <div class="eisenhower-meta">

                <span>
                  ${escapeHtml(task.area)}
                </span>

                <span>
                  •
                </span>

                <span>
                  ${formatDate(task.date)}
                </span>

                ${
                  task.time
                    ? `
                      <span>•</span>

                      <span>
                        ${escapeHtml(task.time)}
                      </span>
                    `
                    : ""
                }

                ${
                  task.estimated !== null
                    ? `
                      <span>•</span>

                      <span>
                        ${task.estimated} min
                      </span>
                    `
                    : ""
                }

              </div>

            </div>
          `;
    })
    .join("");
}

/* =========================================================
   CADASTRO
========================================================= */

document.getElementById("addBtn").addEventListener("click", async () => {
  const taskInput = document.getElementById("taskInput");

  const dateInput = document.getElementById("dateInput");

  const timeInput = document.getElementById("timeInput");

  const areaInput = document.getElementById("areaInput");

  const button = document.getElementById("addBtn");

  const title = taskInput.value.trim();

  if (!title) {
    showToast("Digite uma tarefa.");

    taskInput.focus();

    return;
  }

  if (!WEBHOOK_URL || WEBHOOK_URL.includes("COLE_AQUI")) {
    showToast("Configure o Webhook de cadastro.");

    return;
  }

  const originalText = button.textContent;

  button.disabled = true;

  button.textContent = "⏳ Organizando...";

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        tarefa: title,

        data: dateInput.value,

        horario: timeInput.value,

        area: areaInput.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro no Webhook: ${response.status}`);
    }

    taskInput.value = "";

    dateInput.value = "";

    timeInput.value = "";

    areaInput.value = "";

    showToast("✨ Tarefa organizada com IA!");

    setTimeout(() => {
      loadTasks(false);
    }, 3500);
  } catch (error) {
    console.error(error);

    showToast("Não foi possível enviar a tarefa.");
  } finally {
    button.disabled = false;

    button.textContent = originalText;
  }
});

/* =========================================================
   ENTER
========================================================= */

document.getElementById("taskInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();

    document.getElementById("addBtn").click();
  }
});

/* =========================================================
   CALENDÁRIO
========================================================= */

document.getElementById("prevMonth").addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() - 1, 1);

  render();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() + 1, 1);

  render();
});

document.getElementById("areaFilter").addEventListener("change", render);

document.getElementById("priorityFilter").addEventListener("change", render);

/* =========================================================
   UTILIDADES
========================================================= */

function localISO(date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function compareTasksByDate(a, b) {
  const dateA = `${a.date || "9999-99-99"} ${a.time || "23:59"}`;

  const dateB = `${b.date || "9999-99-99"} ${b.time || "23:59"}`;

  return dateA.localeCompare(dateB);
}

function formatDate(date) {
  if (!date) {
    return "Sem prazo";
  }

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[0]}/${parts[1]}/${parts[2]}`;
}

/* =========================================================
   TOOLTIP
========================================================= */

function makeTooltip(task) {
  let tooltip =
    `${task.title}\n` +
    `Área: ${task.area}\n` +
    `Prioridade: ${task.priority}\n` +
    `Status: ${task.status}\n` +
    `Urgente: ${task.urgent ? "Sim" : "Não"}\n` +
    `Importante: ${task.important ? "Sim" : "Não"}`;

  if (task.estimated !== null) {
    tooltip += `\nTempo estimado: ${task.estimated} min`;
  }

  if (isOverdue(task)) {
    tooltip += `\n🚨 ${overdueLabel(task)}`;
  }

  return tooltip;
}

/* =========================================================
   SEGURANÇA HTML
========================================================= */

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.style.display = "block";

  if (toastTimer) {
    clearTimeout(toastTimer);
  }

  toastTimer = setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

render();

loadTasks();
