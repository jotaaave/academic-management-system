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

function gerarIdTurma(turma) {
    const base = [turma.nome, turma.codigo, turma.ano, turma.semestre]
        .filter(Boolean)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return base || `turma-${Date.now()}`;
}

function gerarCorTurma(indice) {
    const cores = ["#1877d1", "#20a05a", "#f5a800", "#e63b4a", "#7b61ff", "#00a6a6"];
    return cores[indice % cores.length];
}

const form = document.querySelector("#form-criar-turma");
const nomeTurmaInput = document.querySelector("#nomeTurma");
const codigoTurmaInput = document.querySelector("#codigoTurma");
const disciplinaInput = document.querySelector("#disciplina");
const anoInput = document.querySelector("#ano");
const semestreInput = document.querySelector("#semestre");
const descricaoInput = document.querySelector("#descricao");
const feedback = document.querySelector("#feedback");
const btnCancelar = document.querySelector("#btnCancelar");
const sairBtn = document.querySelector("#sair");
const nomeProfessor = document.querySelector("#nomeProfessor");
const iniciaisProfessor = document.querySelector("#iniciaisProfessor");

function mostrarFeedback(texto, erro = false) {
    feedback.textContent = texto;
    feedback.classList.toggle("erro", erro);
}

function salvarProfessor(professor) {
    atualizarProfessor(professor);
}

function atualizarCabecalho(professor) {
    nomeProfessor.textContent = professor.name || "Professor";
    iniciaisProfessor.textContent = gerarIniciais(professor.name);
}

window.addEventListener("load", () => {
    const professor = verificarLogin();

    if (!professor) {
        return;
    }

    atualizarCabecalho(professor);

    btnCancelar.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    sairBtn.addEventListener("click", (event) => {
        event.preventDefault();

        professor.ativo = false;
        salvarProfessor(professor);

        alert("Usuario deslogado com sucesso. Redirecionando para a pagina de login.");
        window.location.href = "login.html";
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        mostrarFeedback("");

        const nome = nomeTurmaInput.value.trim();
        const codigo = codigoTurmaInput.value.trim();
        const disciplina = disciplinaInput.value.trim();
        const ano = anoInput.value;
        const semestre = semestreInput.value;
        const descricao = descricaoInput.value.trim();

        if (!nome || !codigo || !disciplina || !ano || !semestre) {
            mostrarFeedback("Preencha nome, código, disciplina, ano e semestre.", true);
            return;
        }

        const turmas = Array.isArray(professor.turmas) ? professor.turmas : [];
        const novaTurma = {
            id: gerarIdTurma({ nome, codigo, ano, semestre }),
            nome,
            codigo,
            disciplina,
            ano,
            semestre,
            descricao,
            color: gerarCorTurma(turmas.length),
            alunos: [],
        };

        professor.turmas = [...turmas, novaTurma];
        salvarProfessor(professor);

        mostrarFeedback("Turma criada com sucesso. Redirecionando...");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);
    });
});