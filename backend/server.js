const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

//Aqui estamos lendo o contato
app.get('/contatos', (req, res) => {
    const data = fs.readFileSync('dados.json');
    res.json(JSON.parse(data));
});

//Aqui estamos salvando o contato
app.post('/contatos', (req, res) => {
    const data = JSON.parse(fs.readFileSync('dados.json'));
    data.push(req.body);
    fs.writeFileSync('dados.json', JSON.stringify(data, null, 2));
    res.json({status: "ok"});
})

app.listen(3000, () =>{
    console.log('Servidor rodando em http://localhost:3000');
});