function verificarLogin() {
    const professor = pegarProfessor();

    if (!professor || !professor.ativo) {
        alert("Usuario nao logado. Redirecionando para a pagina de login.");
        window.location.href = "login.html";
    }

    console.log(professor);

    return professor;
}

window.addEventListener("load", () => {
    verificarLogin();
    
    let professorLoad = pegarProfessor();

    if (professorLoad) {
        const turmas = professorLoad.turmas;

        turmas.forEach((turma) => {
            if (turma) {
                adicionarTurmaAoHtml(turma);
            }
        });
    }
});

let professor = pegarProfessor();

console.log(JSON.stringify({
    name: "John",
    email: "jv1446170@gmail.com",
    password: "12345678",
    turmas: [
        {
            nome: "Engenharia de Software",
            codigo: "ADS2026.1",
            color: "blue",
            alunos: [
                { nome: "Alice", email: "alice@example.com" },
                { nome: "Bob", email: "bob@example.com" },
                { nome: "Charlie", email: "charlie@example.com" }
            ]
        },
        {
            nome: "Banco de Dados",
            codigo: "ADS2026.2",
            color: "green",
            alunos: [
                { nome: "David", email: "david@example.com" }
            ]
        }
],
    ativo: true
}));

function adicionarTurmaAoHtml(turma) {
    const turmaDisplay = `<div class="card-turma">
        <div class="card-linha" style="background-color: ${turma.color}"></div>
        <div class="card-conteudo">
            <div class="card-letra">${turma.codigo.charAt(0)}</div>

            <h2>${turma.nome}</h2>

            <p>${turma.codigo}</p>
            <span>${turma.alunos.length} alunos</span>
            <a href="#" class="abrir-turma" data-turma="engenharia">Abrir turma &gt;</a>
        </div>
    </div>`;

    const turmasContainer = document.querySelector(".turmas");
    turmasContainer.innerHTML += turmaDisplay;
}

const botoesTurma = document.querySelectorAll(".abrir-turma");

const diario = document.querySelector("#diario");
const turmas = document.querySelector(".turmas");

const sairBtn = document.querySelector("#sair");

const adicionarTurmaBtn = document.querySelector(".adicionar-turma");

adicionarTurmaBtn.addEventListener("click", () => {
    window.location.href = "criarTurma.html";
});



sairBtn.addEventListener("click", () => {
    professor.ativo = false;

    atualizarProfessor(professor);

    alert("Usuario deslogado com sucesso. Redirecionando para a pagina de login.");
    window.location.href = "login.html";
});


botoesTurma.forEach(function(botao) {

    botao.addEventListener("click", function() {

        const turma = botao.dataset.turma;

        turmas.style.display = "none";
        dica.style.display = "none";
        diario.style.display = "block";
        console.log(turma);

    });

});

const nomeProfessor = document.querySelector("#nomeProfessor");

const iniciaisProfessor = document.querySelector("#iniciaisProfessor");

nomeProfessor.textContent = professor.name;

const partesNome = professor.name.split(" ")

const primeiraInicial = partesNome[0][0];

const ultimaInicial = partesNome[partesNome.length - 1][0];

iniciaisProfessor.textContent =
    primeiraInicial + ultimaInicial;