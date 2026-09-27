function criarProfessor(name, email, password) {
    const professor = {
        name: name,
        email: email,
        password: password,
        turmas: [],
        ativo: false,
    }

    const professorJSON = JSON.stringify(professor);
    localStorage.setItem("professor", professorJSON);
}

function pegarProfessor() {
    const professorJSON = localStorage.getItem("professor");

    if (professorJSON) {
        return JSON.parse(professorJSON);
    } else {
        return null;
    }
}

function atualizarProfessor(professor) {
    const professorJSON = JSON.stringify(professor);
    localStorage.setItem("professor", professorJSON);
}


