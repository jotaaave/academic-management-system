const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB
const TIPOS_PERMITIDOS = ["image/png", "image/jpeg"];

function verificarLogin() {
    const professor = pegarProfessor();

    if (!professor || !professor.ativo) {
        alert("Usuario nao logado. Redirecionando para a pagina de login.");
        window.location.href = "login.html";
    }

    return professor;
}

const formPerfil = document.querySelector("#form-perfil");

const nomeInput = document.querySelector("#nome");
const emailInput = document.querySelector("#email");
const disciplinaInput = document.querySelector("#disciplina");

const erroNome = document.querySelector("#erro-nome");
const erroEmail = document.querySelector("#erro-email");
const erroDisciplina = document.querySelector("#erro-disciplina");

const inputFoto = document.querySelector("#inputFoto");
const fotoImg = document.querySelector("#fotoImg");
const iniciaisFoto = document.querySelector("#iniciaisFoto");

const btnAlterarFoto = document.querySelector("#btnAlterarFoto");
const btnRemoverFoto = document.querySelector("#btnRemoverFoto");
const btnSalvar = document.querySelector("#btnSalvar");

const aviso = document.querySelector("#aviso");

const nomeProfessor = document.querySelector("#nomeProfessor");
const iniciaisProfessor = document.querySelector("#iniciaisProfessor");
const iniciaisTopo = document.querySelector("#iniciaisTopo");

const sairBtn = document.querySelector("#sair");

function gerarIniciais(nome) {
    const partesNome = String(nome || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partesNome.length === 0) {
        return "P";
    }

    const primeiraInicial = partesNome[0][0];
    const ultimaInicial = partesNome[partesNome.length - 1][0];

    return (primeiraInicial + ultimaInicial).toUpperCase();
}

function atualizarAvatares(professor) {
    const iniciais = gerarIniciais(professor.name);

    nomeProfessor.textContent = professor.name || "Professor";

    iniciaisProfessor.textContent = iniciais;
    iniciaisTopo.textContent = iniciais;
    iniciaisFoto.textContent = iniciais;

    if (professor.foto) {
        fotoImg.src = professor.foto;
        fotoImg.hidden = false;
        iniciaisFoto.hidden = true;
    } else {
        fotoImg.removeAttribute("src");
        fotoImg.hidden = true;
        iniciaisFoto.hidden = false;
    }
}

function preencherFormulario(professor) {
    nomeInput.value = professor.name || "";
    emailInput.value = professor.email || "";
    disciplinaInput.value = professor.disciplina || "";

    atualizarAvatares(professor);
}

function mostrarAviso(mensagem, ehErro = false) {
    aviso.textContent = mensagem;
    aviso.classList.toggle("erro-aviso", ehErro);

    clearTimeout(mostrarAviso.timer);

    mostrarAviso.timer = setTimeout(() => {
        aviso.textContent = "";
    }, 3000);
}

function mostrarErro(campo, elementoErro, mensagem) {
    elementoErro.textContent = mensagem;
    campo.classList.add("invalido");
}

function limparErros() {
    [erroNome, erroEmail, erroDisciplina].forEach((el) => {
        el.textContent = "";
    });

    [nomeInput, emailInput, disciplinaInput].forEach((campo) => {
        campo.classList.remove("invalido");
    });
}

[nomeInput, emailInput, disciplinaInput].forEach((campo) => {
    campo.addEventListener("input", limparErros);
});

btnAlterarFoto.addEventListener("click", () => {
    inputFoto.click();
});

inputFoto.addEventListener("change", () => {
    const arquivo = inputFoto.files[0];

    if (!arquivo) {
        return;
    }

    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
        mostrarAviso("Formato invalido. Envie uma imagem PNG ou JPG.", true);
        inputFoto.value = "";
        return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
        mostrarAviso("A imagem deve ter no maximo 2 MB.", true);
        inputFoto.value = "";
        return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
        const professor = pegarProfessor();

        professor.foto = leitor.result; // base64 salvo no localStorage
        atualizarProfessor(professor);

        atualizarAvatares(professor);
        mostrarAviso("Foto atualizada com sucesso.");
    };

    leitor.onerror = () => {
        mostrarAviso("Nao foi possivel ler a imagem.", true);
    };

    leitor.readAsDataURL(arquivo);

    inputFoto.value = "";
});

btnRemoverFoto.addEventListener("click", () => {
    const professor = pegarProfessor();

    if (!professor.foto) {
        mostrarAviso("Nenhuma foto para remover.", true);
        return;
    }

    if (!confirm("Remover a foto do perfil?")) {
        return;
    }

    delete professor.foto;
    atualizarProfessor(professor);

    atualizarAvatares(professor);
    mostrarAviso("Foto removida.");
});

formPerfil.addEventListener("submit", (event) => {
    event.preventDefault();
    limparErros();

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const disciplina = disciplinaInput.value.trim();

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    let valido = true;

    if (nome.length < 3) {
        mostrarErro(nomeInput, erroNome, "Informe seu nome completo.");
        valido = false;
    }

    if (!emailValido) {
        mostrarErro(emailInput, erroEmail, "Informe um e-mail institucional valido.");
        valido = false;
    }

    if (disciplina.length < 2) {
        mostrarErro(disciplinaInput, erroDisciplina, "Informe sua disciplina principal.");
        valido = false;
    }

    if (!valido) {
        return;
    }

    const professor = pegarProfessor();

    professor.name = nome;
    professor.email = email;
    professor.disciplina = disciplina;

    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";

    setTimeout(() => {
        atualizarProfessor(professor);
        atualizarAvatares(professor);

        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar";

        mostrarAviso("Perfil atualizado com sucesso.");
    }, 500);
});

sairBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const professor = pegarProfessor();

    professor.ativo = false;
    atualizarProfessor(professor);

    alert("Usuario deslogado com sucesso. Redirecionando para a pagina de login.");
    window.location.href = "login.html";
});

window.addEventListener("load", () => {
    const professor = verificarLogin();

    if (professor) {
        preencherFormulario(professor);
    }
});
