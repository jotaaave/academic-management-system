const form = document.querySelector("#signup");
const nomeInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const disciplinaInput = document.querySelector("#city");
const senhaInput = document.querySelector("#password");
const confirmInput = document.querySelector("#confirm");

const nameError = document.querySelector("#name-error");
const emailError = document.querySelector("#email-error");
const disciplinaError = document.querySelector("#city-error");
const passwordError = document.querySelector("#password-error");
const confirmError = document.querySelector("#confirm-error");

const successBox = document.querySelector("#success");
const summary = document.querySelector("#summary");

function limparMensagens() {
	[nameError, emailError, disciplinaError, passwordError, confirmError].forEach((el) => {
		el.textContent = "";
	});

	[nomeInput, emailInput, disciplinaInput, senhaInput, confirmInput].forEach((campo) => {
		campo.removeAttribute("aria-invalid");
	});

	successBox.style.display = "none";
	summary.innerHTML = "";
}

function mostrarErro(campo, elementoErro, mensagem) {
	elementoErro.textContent = mensagem;
	campo.setAttribute("aria-invalid", "true");
}

function gerarIniciais(nome) {
	const partes = String(nome || "")
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	if (partes.length === 0) {
		return "P";
	}

	return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function exibirResumo(professor) {
	summary.innerHTML = `
		<dt>Nome</dt>
		<dd>${professor.name}</dd>
		<dt>E-mail</dt>
		<dd>${professor.email}</dd>
		<dt>Disciplina</dt>
		<dd>${professor.disciplina}</dd>
	`;

	successBox.style.display = "block";
}

function salvarProfessor(professor) {
	if (typeof atualizarProfessor === "function") {
		atualizarProfessor(professor);
		return;
	}

	localStorage.setItem("professor", JSON.stringify(professor));
}

[nomeInput, emailInput, disciplinaInput, senhaInput, confirmInput].forEach((campo) => {
	campo.addEventListener("input", () => {
		limparMensagens();
	});
});

form.addEventListener("submit", (event) => {
	event.preventDefault();
	limparMensagens();

	const nome = nomeInput.value.trim();
	const email = emailInput.value.trim();
	const disciplina = disciplinaInput.value.trim();
	const senha = senhaInput.value;
	const confirmacao = confirmInput.value;

	const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	let valido = true;

	if (nome.length < 3) {
		mostrarErro(nomeInput, nameError, "Informe seu nome completo.");
		valido = false;
	}

	if (!emailValido) {
		mostrarErro(emailInput, emailError, "Informe um e-mail institucional válido.");
		valido = false;
	}

	if (disciplina.length < 2) {
		mostrarErro(disciplinaInput, disciplinaError, "Informe sua disciplina principal.");
		valido = false;
	}

	if (senha.length < 8) {
		mostrarErro(senhaInput, passwordError, "A senha precisa ter pelo menos 8 caracteres.");
		valido = false;
	}

	if (senha !== confirmacao) {
		mostrarErro(confirmInput, confirmError, "As senhas não conferem.");
		valido = false;
	}

	if (!valido) {
		return;
	}

	const professores = typeof obterProfessores === "function" ? obterProfessores() : [];
	const emailJaExiste = professores.some((professor) => String(professor.email).toLowerCase() === email.toLowerCase());

	if (emailJaExiste) {
		mostrarErro(emailInput, emailError, "Já existe uma conta cadastrada com esse e-mail.");
		return;
	}

	const professor = {
		name: nome,
		email,
		password: senha,
		disciplina,
		turmas: [],
		ativo: false,
		iniciais: gerarIniciais(nome),
	};

	const submitBtn = form.querySelector(".submit");
	submitBtn.disabled = true;
	submitBtn.textContent = "Criando conta...";

	setTimeout(() => {
		if (typeof criarProfessor === "function") {
			const criado = criarProfessor(professor.name, professor.email, professor.password, {
				disciplina: professor.disciplina,
				turmas: professor.turmas,
				ativo: true,
			});

			if (!criado) {
				mostrarErro(emailInput, emailError, "Já existe uma conta cadastrada com esse e-mail.");
				submitBtn.disabled = false;
				submitBtn.textContent = "Criar minha conta";
				return;
			}

			atualizarProfessor({ ...criado, ativo: true });
		} else {
			professor.ativo = true;
			salvarProfessor(professor);
		}
		exibirResumo(professor);

		submitBtn.disabled = false;
		submitBtn.textContent = "Criar minha conta";

		alert("Conta criada com sucesso. Agora faça login.");
		window.location.href = "index.html";
	}, 450);
});
