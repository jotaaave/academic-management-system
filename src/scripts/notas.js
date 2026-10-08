const ITENS_POR_PAGINA = 6;

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

function normalizarNotas(aluno) {
    const notas = aluno.notas || {};

    return {
        p1: notas.p1 ?? aluno.p1 ?? null,
        p2: notas.p2 ?? aluno.p2 ?? null,
        projF1: notas.projF1 ?? notas.projeto1 ?? aluno.projF1 ?? aluno.projeto1 ?? null,
        projF2: notas.projF2 ?? notas.projeto2 ?? aluno.projF2 ?? aluno.projeto2 ?? null,
        final: notas.final ?? aluno.final ?? null,
    };
}

function normalizarAluno(aluno, indice) {
    const nome = aluno.nome || aluno.name || `Aluno ${indice + 1}`;

    return {
        ...aluno,
        id: aluno.id || `${indice + 1}`,
        matricula: aluno.matricula || aluno.ra || String(202304500 + indice + 1),
        nome,
        notas: normalizarNotas(aluno),
    };
}

function normalizarTurma(turma, indice) {
    return {
        ...turma,
        id: gerarIdTurma(turma, indice),
        nome: turma.nome || "Turma sem nome",
        codigo: turma.codigo || turma.periodo || "Sem código",
        color: turma.color || "#1877d1",
        alunos: Array.isArray(turma.alunos) ? turma.alunos.map(normalizarAluno) : [],
    };
}

function atualizarCabecalho(professor) {
    const iniciais = gerarIniciais(professor.name);

    document.querySelector("#nomeProfessor").textContent = professor.name || "Professor";
    document.querySelector("#iniciaisProfessor").textContent = iniciais;
    document.querySelector("#iniciaisTopo").textContent = iniciais;
}

function lerNumero(valor) {
    if (valor === null || valor === undefined || valor === "") {
        return null;
    }

    const numero = Number(String(valor).replace(",", "."));
    return Number.isFinite(numero) ? numero : null;
}

function calcularMediaSimples(valores) {
    const numeros = valores
        .map(lerNumero)
        .filter((valor) => valor !== null);

    if (!numeros.length) {
        return null;
    }

    const soma = numeros.reduce((acc, valor) => acc + valor, 0);
    return soma / numeros.length;
}

function calcularNotaIndividual(notas) {
    return calcularMediaSimples([notas.p1, notas.p2]);
}

function calcularNotaProjeto(notas) {
    return calcularMediaSimples([notas.projF1, notas.projF2]);
}

function calcularMediaFinal(notas) {
    const notaIndividual = calcularNotaIndividual(notas);
    const notaProjeto = calcularNotaProjeto(notas);

    if (notaIndividual === null || notaProjeto === null) {
        return null;
    }

    return (notaIndividual * 0.4) + (notaProjeto * 0.6);
}

function determinarStatus(mediaFinal, notaProjeto, notaFinal) {
    if (mediaFinal === null || notaProjeto === null) {
        return { texto: "SEM NOTA", classe: "sem-nota" };
    }

    if (mediaFinal >= 7) {
        return { texto: "APROVADO", classe: "aprovado" };
    }

    if (notaProjeto < 4) {
        return { texto: "REPROVADO", classe: "reprovado" };
    }

    if (notaFinal !== null) {
        if ((notaProjeto + notaFinal) >= 7) {
            return { texto: "APROVADO", classe: "aprovado" };
        }

        return { texto: "REPROVADO", classe: "reprovado" };
    }

    return { texto: "FARÁ PROVA FINAL", classe: "final" };
}

function obterTurmaAtual(professor) {
    const params = new URLSearchParams(window.location.search);
    const turmaId = params.get("turma");

    if (!turmaId) {
        return null;
    }

    return professor.turmas.find((turma) => turma.id === turmaId) || null;
}

function renderizarIdentificacaoTurma(turma) {
    document.querySelector("#nomeTurma").textContent = turma.nome;
    document.querySelector("#codigoTurma").textContent = turma.codigo;
}

function salvarProfessor(professor) {
    atualizarProfessor(professor);
}

function gerarMatriculaPadrao(alunos) {
    const base = 202304500;
    const quantidade = Array.isArray(alunos) ? alunos.length : 0;

    return String(base + quantidade + 1);
}

function adicionarAlunoTurma(nome, matricula) {
    const nomeLimpo = String(nome || "").trim();
    const matriculaLimpa = String(matricula || "").trim();

    if (!nomeLimpo) {
        return { ok: false, message: "Informe o nome do aluno." };
    }

    const novoAluno = {
        id: `${Date.now()}`,
        nome: nomeLimpo,
        matricula: matriculaLimpa || gerarMatriculaPadrao(estado.turma.alunos),
        notas: {
            p1: null,
            p2: null,
            projF1: null,
            projF2: null,
            final: null,
        },
    };

    estado.turma.alunos.push(novoAluno);
    salvarProfessor(estado.professor);

    return { ok: true };
}

function criarCelulaNota(alunoIndex, campo, valor) {
    return `
        <input
            class="nota-input"
            type="number"
            min="0"
            max="10"
            step="0.1"
            inputmode="decimal"
            value="${valor === null || valor === undefined ? "" : valor}"
            data-aluno-index="${alunoIndex}"
            data-campo="${campo}"
        >
    `;
}

function criarLinhaAluno(aluno, indiceGlobal) {
    const mediaFinal = calcularMediaFinal(aluno.notas);
    const notaProjeto = calcularNotaProjeto(aluno.notas);
    const notaFinal = lerNumero(aluno.notas.final);
    const status = determinarStatus(mediaFinal, notaProjeto, notaFinal);
    const mediaFormatada = mediaFinal === null ? "-" : mediaFinal.toFixed(1);
    const notaIndividual = calcularNotaIndividual(aluno.notas);

    return `
        <tr data-indice-global="${indiceGlobal}">
            <td class="matricula">${aluno.matricula}</td>
            <td class="nome-aluno">${aluno.nome}</td>
            <td>${criarCelulaNota(indiceGlobal, "p1", aluno.notas.p1)}</td>
            <td>${criarCelulaNota(indiceGlobal, "p2", aluno.notas.p2)}</td>
            <td>${criarCelulaNota(indiceGlobal, "projF1", aluno.notas.projF1)}</td>
            <td>${criarCelulaNota(indiceGlobal, "projF2", aluno.notas.projF2)}</td>
            <td class="media-cell" data-campo="media" title="Individual: ${notaIndividual === null ? "-" : notaIndividual.toFixed(1)} | Projeto: ${notaProjeto === null ? "-" : notaProjeto.toFixed(1)}">${mediaFormatada}</td>
            <td><span class="status-badge ${status.classe}" data-campo="status">${status.texto}</span></td>
            <td>${criarCelulaNota(indiceGlobal, "final", aluno.notas.final)}</td>
            <td class="boletim-cell"><a href="#" class="boletim-link"></a></td>
        </tr>
    `;
}

function atualizarLinhaNaTela(linha, aluno) {
    const mediaFinal = calcularMediaFinal(aluno.notas);
    const notaProjeto = calcularNotaProjeto(aluno.notas);
    const notaFinal = lerNumero(aluno.notas.final);
    const status = determinarStatus(mediaFinal, notaProjeto, notaFinal);

    const mediaCell = linha.querySelector('[data-campo="media"]');
    const statusCell = linha.querySelector('[data-campo="status"]');

    if (mediaCell) {
        mediaCell.textContent = mediaFinal === null ? "-" : mediaFinal.toFixed(1);
    }

    if (statusCell) {
        statusCell.textContent = status.texto;
        statusCell.className = `status-badge ${status.classe}`;
    }
}

function obterPaginas(totalPaginas, paginaAtual) {
    if (totalPaginas <= 7) {
        return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
    }

    const paginas = [1];
    const inicio = Math.max(2, paginaAtual - 1);
    const fim = Math.min(totalPaginas - 1, paginaAtual + 1);

    if (inicio > 2) {
        paginas.push("...");
    }

    for (let pagina = inicio; pagina <= fim; pagina += 1) {
        paginas.push(pagina);
    }

    if (fim < totalPaginas - 1) {
        paginas.push("...");
    }

    paginas.push(totalPaginas);
    return paginas;
}

function renderizarPaginacao(totalAlunos, paginaAtual) {
    const totalPaginas = Math.max(1, Math.ceil(totalAlunos / ITENS_POR_PAGINA));
    const paginaLista = document.querySelector("#paginaLista");
    const botaoAnterior = document.querySelector("#paginaAnterior");
    const botaoProxima = document.querySelector("#paginaProxima");

    paginaLista.innerHTML = "";

    obterPaginas(totalPaginas, paginaAtual).forEach((item) => {
        if (item === "...") {
            const span = document.createElement("span");
            span.className = "pagina-ellipsis";
            span.textContent = "...";
            paginaLista.appendChild(span);
            return;
        }

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = `pagina-numero${item === paginaAtual ? " ativo" : ""}`;
        botao.textContent = String(item);
        botao.addEventListener("click", () => {
            estado.paginaAtual = item;
            renderizarTabela();
        });
        paginaLista.appendChild(botao);
    });

    botaoAnterior.disabled = paginaAtual <= 1;
    botaoProxima.disabled = paginaAtual >= totalPaginas;

    botaoAnterior.onclick = () => {
        if (estado.paginaAtual > 1) {
            estado.paginaAtual -= 1;
            renderizarTabela();
        }
    };

    botaoProxima.onclick = () => {
        if (estado.paginaAtual < totalPaginas) {
            estado.paginaAtual += 1;
            renderizarTabela();
        }
    };
}

function renderizarTabela() {
    const tbody = document.querySelector("#tbodyNotas");
    const totalAlunos = estado.turma.alunos.length;
    const totalPaginas = Math.max(1, Math.ceil(totalAlunos / ITENS_POR_PAGINA));
    const paginaAtual = Math.min(Math.max(estado.paginaAtual, 1), totalPaginas);

    estado.paginaAtual = paginaAtual;

    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const alunosPagina = estado.turma.alunos.slice(inicio, fim);

    tbody.innerHTML = alunosPagina.map((aluno, indicePagina) => criarLinhaAluno(aluno, inicio + indicePagina)).join("");

    document.querySelector("#totalAlunos").textContent = `${totalAlunos} aluno${totalAlunos === 1 ? "" : "s"}`;

    const exibidosInicio = totalAlunos === 0 ? 0 : inicio + 1;
    const exibidosFim = totalAlunos === 0 ? 0 : Math.min(fim, totalAlunos);

    document.querySelector("#faixaExibida").textContent = `Mostrando ${exibidosInicio}-${exibidosFim} de ${totalAlunos} alunos`;

    tbody.querySelectorAll(".nota-input").forEach((input) => {
        input.addEventListener("input", (event) => {
            const alvo = event.currentTarget;
            const alunoIndex = Number(alvo.dataset.alunoIndex);
            const campo = alvo.dataset.campo;

            const aluno = estado.turma.alunos[alunoIndex];
            aluno.notas[campo] = lerNumero(alvo.value);

            salvarProfessor(estado.professor);

            const linha = alvo.closest("tr");
            atualizarLinhaNaTela(linha, aluno);
        });
    });

    renderizarPaginacao(totalAlunos, paginaAtual);
}

const estado = {
    professor: null,
    turma: null,
    paginaAtual: 1,
};

window.addEventListener("load", () => {
    const professor = verificarLogin();

    if (!professor) {
        return;
    }

    professor.turmas = (professor.turmas || []).map(normalizarTurma);
    salvarProfessor(professor);
    atualizarCabecalho(professor);

    const turma = obterTurmaAtual(professor);

    if (!turma) {
        alert("Turma nao encontrada. Redirecionando para as minhas turmas.");
        window.location.href = "index.html";
        return;
    }

    estado.professor = professor;
    estado.turma = turma;

    renderizarIdentificacaoTurma(turma);
    renderizarTabela();

    const formNovoAluno = document.querySelector("#formNovoAluno");
    const novoNomeAluno = document.querySelector("#novoNomeAluno");
    const novaMatricula = document.querySelector("#novaMatricula");

    formNovoAluno.addEventListener("submit", (event) => {
        event.preventDefault();

        const resultado = adicionarAlunoTurma(novoNomeAluno.value, novaMatricula.value);

        if (!resultado.ok) {
            alert(resultado.message);
            return;
        }

        const totalPaginas = Math.max(1, Math.ceil(estado.turma.alunos.length / ITENS_POR_PAGINA));
        estado.paginaAtual = totalPaginas;

        novoNomeAluno.value = "";
        novaMatricula.value = "";

        renderizarTabela();
    });

    document.querySelector("#sair").addEventListener("click", (event) => {
        event.preventDefault();

        professor.ativo = false;
        salvarProfessor(professor);

        alert("Usuario deslogado com sucesso. Redirecionando para a pagina de login.");
        window.location.href = "login.html";
    });
});