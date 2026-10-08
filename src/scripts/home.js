function verificarLogin() {
    const professor = pegarProfessor();

    if (!professor || !professor.ativo) {
        alert("Usuario nao logado. Redirecionando para a pagina de login.");
        window.location.href = "login.html";
        return null;
    }

    return professor;
}

function gerarIniciais(nome) {
    const partes = String(nome || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!partes.length) {
        return "P";
    }

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function gerarIdTurma(turma, indice) {
    const base = [turma.nome, turma.codigo, indice]
        .filter(Boolean)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return turma.id || base || `turma-${indice + 1}`;
}

function normalizarTurma(turma, indice) {
    const alunos = Array.isArray(turma.alunos) ? turma.alunos : [];

    return {
        ...turma,
        id: gerarIdTurma(turma, indice),
        nome: turma.nome || "Turma sem nome",
        codigo: turma.codigo || turma.periodo || "Sem código",
        color: turma.color || "#1877d1",
        alunos,
    };
}

function atualizarCabecalho(professor) {
    const nomeProfessor = document.querySelector("#nomeProfessor");
    const iniciaisProfessor = document.querySelector("#iniciaisProfessor");
    const iniciaisTopo = document.querySelector("#iniciaisTopo");

    const iniciais = gerarIniciais(professor.name);

    nomeProfessor.textContent = professor.name || "Professor";
    iniciaisProfessor.textContent = iniciais;
    iniciaisTopo.textContent = iniciais;
}

function criarCardTurma(turma) {
    const card = document.createElement("article");
    card.className = "card-turma";

    const cor = turma.color || "#1877d1";
    const alunosQtde = Array.isArray(turma.alunos) ? turma.alunos.length : 0;

    card.innerHTML = `
        <div class="card-linha" style="background-color: ${cor}"></div>
        <div class="card-conteudo">
            <div class="card-letra">${String(turma.codigo || "T").charAt(0)}</div>
            <h2>${turma.nome}</h2>
            <p>${turma.codigo}</p>
            <span>${alunosQtde} alunos</span>
            <a href="./notas.html?turma=${encodeURIComponent(turma.id)}" class="abrir-turma">Abrir turma &gt;</a>
        </div>
    `;

    return card;
}

function renderizarTurmas(turmas) {
    const container = document.querySelector(".turmas");
    const estadoVazio = document.querySelector("#estadoVazio");

    container.innerHTML = "";

    if (!turmas.length) {
        estadoVazio.hidden = false;
        return;
    }

    estadoVazio.hidden = true;

    turmas.forEach((turma) => {
        container.appendChild(criarCardTurma(turma));
    });
}

window.addEventListener("load", () => {
    const professor = verificarLogin();

    if (!professor) {
        return;
    }

    professor.turmas = (professor.turmas || []).map(normalizarTurma);
    atualizarProfessor(professor);
    atualizarCabecalho(professor);
    renderizarTurmas(professor.turmas);

    const sairBtn = document.querySelector("#sair");
    const adicionarTurmaBtn = document.querySelector(".adicionar-turma");

    adicionarTurmaBtn.addEventListener("click", () => {
        window.location.href = "criarTurma.html";
    });

    sairBtn.addEventListener("click", (event) => {
        event.preventDefault();

        professor.ativo = false;
        atualizarProfessor(professor);

        alert("Usuario deslogado com sucesso. Redirecionando para a pagina de login.");
        window.location.href = "login.html";
    });
});