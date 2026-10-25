import sqlite3
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

DB_ARQUIVO = "pedidos.db"

sabores = ["calabresa","mussarela","frango com bacon","frango com catupiri","portuguesa",
           "peperoni","4 queijos","carne seca","banana","chocolate"]

tamanhos = ["G","M","P","Brotinho"]

class Pedido(BaseModel):
    nome : str
    sabor : str
    tamanho : str
    pagamento : str

app = FastAPI()


def conectar():
    # Uma conexão por requisição (o FastAPI roda as rotas em threads diferentes)
    conn = sqlite3.connect(DB_ARQUIVO)
    conn.row_factory = sqlite3.Row  # permite acessar colunas pelo nome
    return conn


def criar_tabela():
    with conectar() as conn:
        # Cria a tabela só se ela ainda não existir; o id é gerado automaticamente
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS pedidos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                sabor TEXT NOT NULL,
                pagamento TEXT NOT NULL
            )
            """
        )
    conn.close()


criar_tabela()


def linha_para_pedido(linha):
    return {"nome": linha["nome"], "sabor": linha["sabor"], "pagamento": linha["pagamento"]}


@app.get("/pedidos")
def lista_pedidos():
    conn = conectar()
    # Busca todos os pedidos, em ordem de id
    linhas = conn.execute("SELECT id, nome, sabor, pagamento FROM pedidos ORDER BY id").fetchall()
    conn.close()
    return {linha["id"]: linha_para_pedido(linha) for linha in linhas}

@app.post("/pedidos")
def criar_pedidos(pedido: Pedido):
    if pedido.sabor not in sabores:
        raise HTTPException (status_code=400, detail="Sabor invalido!")

    if pedido.tamanho not in tamanhos:
        raise HTTPException (status_code=400, detail="Tamanho invalido!")
     
    conn = conectar()
    # Insere um pedido novo; os "?" evitam SQL injection ao receber os valores
    cursor = conn.execute(
        "INSERT INTO pedidos (nome, sabor, pagamento) VALUES (?, ?, ?)",
        (pedido.nome, pedido.sabor, pedido.pagamento),
    )
    conn.commit()  # grava de verdade no arquivo
    novo_id = cursor.lastrowid  # id que o SQLite gerou para a nova linha
    conn.close()
    return {"id": novo_id, "pedido": pedido}

@app.get("/pedidos/{pedido_id}")
def buscar_pedido(pedido_id : int):
    conn = conectar()
    # Busca um único pedido pelo id
    linha = conn.execute(
        "SELECT nome, sabor, pagamento FROM pedidos WHERE id = ?", (pedido_id,)
    ).fetchone()
    conn.close()
    if linha is not None:
        return linha_para_pedido(linha)
    raise HTTPException(status_code=404, detail="pedido não encontrado")

# Serve a interface (pasta static) na rota "/"; fica por último para não esconder as rotas /pedidos
app.mount("/", StaticFiles(directory=Path(__file__).parent / "static", html=True), name="static")
