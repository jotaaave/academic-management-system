const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const toggleBtn = document.getElementById("toggle-senha");
const errorEl = document.getElementById("error");

// Mostrar / ocultar senha
toggleBtn.addEventListener("click", () => {
  const mostrando = senhaInput.type === "text";
  senhaInput.type = mostrando ? "password" : "text";
  toggleBtn.classList.toggle("is-visible", !mostrando);
  toggleBtn.setAttribute("aria-pressed", String(!mostrando));
  toggleBtn.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Ocultar senha");
  senhaInput.focus();
});

function mostrarErro(mensagem, campo) {
  errorEl.textContent = mensagem;
  errorEl.hidden = false;
  campo.classList.add("invalid");
  campo.focus();
}

function limparErro() {
  errorEl.hidden = true;
  emailInput.classList.remove("invalid");
  senhaInput.classList.remove("invalid");
}

emailInput.addEventListener("input", limparErro);
senhaInput.addEventListener("input", limparErro);

// Validacao e envio
form.addEventListener("submit", (event) => {
  event.preventDefault();
  limparErro();

  const email = emailInput.value.trim();
  const senha = senhaInput.value;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailValido) {
    mostrarErro("Informe um e-mail institucional valido.", emailInput);
    return;
  }

  if (senha.length < 6) {
    mostrarErro("A senha deve ter pelo menos 6 caracteres.", senhaInput);
    return;
  }

  const botao = form.querySelector(".btn");
  botao.disabled = true;
  botao.textContent = "Entrando...";

  // Simulacao de requisicao. 
  setTimeout(() => {
    botao.disabled = false;
    botao.textContent = "Entrar";
    alert("Login realizado com sucesso!");
  }, 900);
});

// Links 
document.getElementById("forgot").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Fluxo de recuperacao de senha ainda nao implementado.");
});

document.getElementById("register").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Fluxo de cadastro de professor ainda nao implementado.");
});