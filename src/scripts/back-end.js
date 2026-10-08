function normalizarProfessor(professor) {
    return {
        id: professor.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: professor.name || "",
        email: professor.email || "",
        password: professor.password || "",
        disciplina: professor.disciplina || "",
        foto: professor.foto,
        turmas: Array.isArray(professor.turmas) ? professor.turmas : [],
        ativo: Boolean(professor.ativo),
    };
}

function obterProfessores() {
    const professoresJSON = localStorage.getItem("professores");

    if (professoresJSON) {
        try {
            const professores = JSON.parse(professoresJSON);

            if (Array.isArray(professores)) {
                return professores.map(normalizarProfessor);
            }
        } catch (error) {
            console.error("Nao foi possivel ler os professores salvos.", error);
        }
    }

    const professorJSON = localStorage.getItem("professor");

    if (professorJSON) {
        try {
            const professor = normalizarProfessor(JSON.parse(professorJSON));
            localStorage.setItem("professores", JSON.stringify([professor]));
            return [professor];
        } catch (error) {
            console.error("Nao foi possivel migrar o professor salvo.", error);
        }
    }

    return [];
}

function salvarProfessores(professores) {
    const normalizados = professores.map(normalizarProfessor);
    localStorage.setItem("professores", JSON.stringify(normalizados));

    const professorAtivo = normalizados.find((professor) => professor.ativo);

    if (professorAtivo) {
        localStorage.setItem("professor", JSON.stringify(professorAtivo));
    } else if (normalizados.length === 1) {
        localStorage.setItem("professor", JSON.stringify(normalizados[0]));
    } else {
        localStorage.removeItem("professor");
    }
}

function criarProfessor(name, email, password, extras = {}) {
    const professores = obterProfessores();

    if (professores.some((professor) => professor.email.toLowerCase() === String(email).toLowerCase())) {
        return null;
    }

    const professor = normalizarProfessor({
        ...extras,
        name,
        email,
        password,
    });

    professores.push(professor);
    salvarProfessores(professores);

    return professor;
}

function pegarProfessor() {
    const professores = obterProfessores();

    const professorAtivo = professores.find((professor) => professor.ativo);

    if (professorAtivo) {
        return professorAtivo;
    }

    const professorJSON = localStorage.getItem("professor");

    if (professorJSON) {
        try {
            return normalizarProfessor(JSON.parse(professorJSON));
        } catch (error) {
            console.error("Nao foi possivel ler o professor atual.", error);
        }
    }

    return null;
}

function atualizarProfessor(professor) {
    const professores = obterProfessores();
    const professorAtualizado = normalizarProfessor(professor);
    const indice = professores.findIndex((item) => item.email.toLowerCase() === professorAtualizado.email.toLowerCase() || item.id === professorAtualizado.id);

    if (indice >= 0) {
        professores[indice] = professorAtualizado;
    } else {
        professores.push(professorAtualizado);
    }

    salvarProfessores(professores);
    return professorAtualizado;
}


