console.log("ARQUIVO CORRETO SENDO EXECUTADO");

const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const caminhoDados = path.join(__dirname, 'dados.json');

const lerDados = () => JSON.parse(fs.readFileSync(caminhoDados));
const salvarDados = (dados) => fs.writeFileSync(caminhoDados, JSON.stringify(dados, null, 2));

//Contatos
app.get('/contatos', (req, res) => {
    res.json(lerDados().contatos);
});

//Aqui estamos salvando o contato
app.post('/contatos', (req, res) => {
    const dados = lerDados();
    const novoId = dados.contatos.length > 0 ? Math.max(...dados.contatos.map(c => c.id || 0)) + 1 : 1;
    const novoContato = { id: novoId, ...req.body };
    dados.contatos.push(novoContato);
    salvarDados(dados);
    res.json(novoContato); //retorna o objeto completo com id gerado
});

// Aqui estou criando uma regra para deletar contatos.
app.delete('/contatos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const dados = lerDados();
    dados.contatos = dados.contatos.filter(c => c.id !== id);
    salvarDados(dados);
    res.sendStatus(200);
});

//Operadoras
app.get('/operadoras', (req, res) => {
    res.json(lerDados().operadoras);
});

app.listen(3000, () =>{
    console.log('Servidor rodando em http://localhost:3000');
});
