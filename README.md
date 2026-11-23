# Pizzaria API

API REST para gerenciamento de pedidos de pizzaria desenvolvida com **Python**, **FastAPI**, **Pydantic** e **SQLite**, acompanhada de uma interface web estática.

## Funcionalidades

- **`GET /pedidos`**: Lista todos os pedidos registrados no banco de dados SQLite, ordenados por ID.
- **`POST /pedidos`**: Cria um novo pedido validando os dados com Pydantic (`nome`, `sabor`, `tamanho`, `pagamento`) e checando sabores e tamanhos permitidos (retorna `400` em caso de valor inválido).
- **`GET /pedidos/{pedido_id}`**: Busca um pedido específico pelo ID (retorna `404` caso não exista).
- **Interface Web**: Pasta `static/` servida na rota raiz (`/`) via `StaticFiles`.

## Tecnologias

- **Python 3**
- **FastAPI** & **Uvicorn**
- **Pydantic** (validação de payloads)
- **SQLite** (`sqlite3` com consultas parametrizadas contra SQL injection)
- **HTML, CSS e JavaScript** (interface em `static/`)

## Estrutura do projeto

```text
Pizzaria/
├── main.py          # Aplicação FastAPI, rotas, validações e conexão SQLite
├── static/
│   ├── index.html   # Interface web
│   ├── script.js    # Consumo da API
│   └── style.css    # Estilização
└── .gitignore
```

## Como executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/joaogabriel586/Pizzaria.git
   cd Pizzaria
   ```

2. Crie e ative um ambiente virtual e instale as dependências:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install fastapi uvicorn pydantic
   ```

3. Inicie o servidor:
   ```bash
   uvicorn main:app --reload
   ```

4. Acesse no navegador:
   - Interface web: `http://127.0.0.1:8000/`
   - Documentação interativa (Swagger): `http://127.0.0.1:8000/docs`
