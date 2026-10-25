const formPedido = document.getElementById("form-pedido");
const formBusca = document.getElementById("form-busca");
const msgForm = document.getElementById("msg-form");
const msgLista = document.getElementById("msg-lista");
const listaEl = document.getElementById("pedidos");
const resultadoEl = document.getElementById("resultado-busca");
const btnPedido = document.getElementById("btn-pedido");

// Mostra uma mensagem (tipo: ok, erro ou info) num elemento
function mostrar(el, texto, tipo) {
  el.textContent = texto;
  el.className = "msg " + (tipo || "");
}

// Monta um card de pedido; textContent evita injetar HTML vindo do usuário
function criarCard(id, p) {
  const card = document.createElement("article");
  card.className = "pedido";
  const linhas = [
    ["numero", id ? "Pedido #" + id : "Pedido"],
    ["sabor", "🍕 " + p.sabor],
    ["", "Cliente: " + p.nome],
    ["", "Pagamento: " + p.pagamento],
  ];
  for (const [classe, texto] of linhas) {
    const linha = document.createElement("p");
    if (classe) linha.className = classe;
    linha.textContent = texto;
    card.appendChild(linha);
  }
  return card;
}

// Busca todos os pedidos com GET /pedidos e desenha os cards
async function carregarPedidos() {
  mostrar(msgLista, "Carregando pedidos...", "info");
  listaEl.replaceChildren();
  try {
    // fetch devolve uma Promise; await espera a resposta chegar
    const resp = await fetch("/pedidos");
    if (!resp.ok) throw new Error();
    const pedidos = await resp.json(); // objeto { id: {nome, sabor, pagamento} }
    const ids = Object.keys(pedidos);
    if (ids.length === 0) {
      mostrar(msgLista, "Nenhum pedido ainda", "info");
      return;
    }
    mostrar(msgLista, "", "");
    // Pedidos mais novos primeiro
    ids.reverse().forEach((id) => listaEl.appendChild(criarCard(id, pedidos[id])));
  } catch {
    mostrar(msgLista, "Não foi possível carregar os pedidos. Tente novamente.", "erro");
  }
}

// Envia um novo pedido com POST /pedidos
formPedido.addEventListener("submit", async (e) => {
  e.preventDefault(); // não recarrega a página
  const nome = document.getElementById("nome").value.trim();
  const sabor = document.getElementById("sabor").value.trim();
  const pagamento = document.getElementById("pagamento").value;

  if (!nome || !sabor || !pagamento) {
    mostrar(msgForm, "Preencha nome, sabor e forma de pagamento.", "erro");
    return;
  }

  btnPedido.disabled = true;
  mostrar(msgForm, "Enviando pedido...", "info");
  try {
    const resp = await fetch("/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // avisa que o corpo é JSON
      body: JSON.stringify({ nome, sabor, pagamento }), // converte o objeto em texto JSON
    });
    if (!resp.ok) throw new Error();
    const dados = await resp.json();
    mostrar(msgForm, "Pedido #" + dados.id + " feito com sucesso! 🎉", "ok");
    formPedido.reset();
    carregarPedidos(); // atualiza a lista logo depois de criar
  } catch {
    mostrar(msgForm, "Erro ao enviar o pedido. Tente novamente.", "erro");
  } finally {
    btnPedido.disabled = false;
  }
});

// Busca um pedido pelo número com GET /pedidos/{id}
formBusca.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("busca-id").value.trim();
  resultadoEl.replaceChildren();

  if (!id) {
    const aviso = document.createElement("p");
    mostrar(aviso, "Digite o número do pedido.", "erro");
    resultadoEl.appendChild(aviso);
    return;
  }

  const info = document.createElement("p");
  mostrar(info, "Buscando...", "info");
  resultadoEl.appendChild(info);
  try {
    const resp = await fetch("/pedidos/" + encodeURIComponent(id));
    const dados = await resp.json();
    resultadoEl.replaceChildren();
    if (resp.ok) {
      resultadoEl.appendChild(criarCard(id, dados));
    } else {
      // Em erro (ex.: 404) a API manda { detail: "mensagem" }; no 422 detail é uma lista
      const erro = document.createElement("p");
      const texto = typeof dados.detail === "string" ? dados.detail : "Número de pedido inválido.";
      mostrar(erro, texto, "erro");
      resultadoEl.appendChild(erro);
    }
  } catch {
    resultadoEl.replaceChildren();
    const erro = document.createElement("p");
    mostrar(erro, "Não foi possível buscar o pedido. Tente novamente.", "erro");
    resultadoEl.appendChild(erro);
  }
});

carregarPedidos();
