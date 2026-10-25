from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class Pedido(BaseModel):
    nome : str
    sabor : str
    pagamento : str

app = FastAPI()

pedidos = {}

@app.get("/pedidos")
def lista_pedidos():
    return pedidos

@app.post("/pedidos")
def criar_pedidos(pedido: Pedido):
    novo_id = len(pedidos) + 1
    pedidos[novo_id] = pedido
    return {"id": novo_id, "pedido": pedido}

@app.get("/pedidos/{pedido_id}")
def buscar_pedido(pedido_id : int):
    if pedido_id in pedidos:
        return pedidos[pedido_id]
    raise HTTPException(status_code=404, detail="pedido não encontrado")