const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexão Railway (A mesma que você já tinha)
const db = mysql.createConnection({
    host: 'gondola.proxy.rlwy.net',
    port: 43822,
    user: 'root',
    password: 'FaVogexYSbQIaaGTJJFMWwhTIMZAibUB',
    database: 'railway'
});

// A Vercel reconecta a cada requisição, então tratamos o erro sem fechar
db.connect(err => {
    if (err) console.error('Erro conexão:', err.message);
    else console.log('Banco OK');
});

// ROTA DE LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    db.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        if (results.length > 0) {
            res.json({ sucesso: true, nome: results[0].nome, saldo: results[0].saldo, cargo: results[0].cargo });
        } else {
            res.json({ sucesso: false, mensagem: 'Dados incorretos' });
        }
    });
});

// ROTA DE CADASTRO
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    const sql = 'INSERT INTO usuarios (nome, email, senha, saldo, cargo) VALUES (?, ?, ?, 0, "comum")';
    db.query(sql, [nome, email, senha], (err, result) => {
        if (err) return res.json({ sucesso: false, mensagem: 'Erro ou email duplicado' });
        res.json({ sucesso: true, mensagem: 'Conta criada!' });
    });
});

// Rota padrão para testar se a API tá on
app.get('/', (req, res) => {
    res.send('API Fortune Bet rodando!');
});

// --- O SEGREDO DA VERCEL ESTÁ AQUI EMBAIXO ---
module.exports = app;
