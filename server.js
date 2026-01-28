const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// --- CONEXÃO SEGURA ---
// Criamos o pool, mas NÃO testamos a conexão logo de cara para não travar o servidor
const db = mysql.createPool({
    host: 'gondola.proxy.rlwy.net',
    port: 43822,
    user: 'root',
    password: 'FaVogexYSbQIaaGTJJFMWwhTIMZAibUB',
    database: 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- ROTA DE DIAGNÓSTICO ---
// Acesse /status para ver se o banco está respondendo
app.get('/status', (req, res) => {
    db.query('SELECT 1', (err, results) => {
        if (err) {
            res.json({ status: 'ERRO', mensagem: 'Servidor ON, mas Banco OFF', erro: err.message });
        } else {
            res.json({ status: 'OK', mensagem: 'Tudo funcionando 100%!' });
        }
    });
});

// ROTAS DO JOGO
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    db.query('INSERT INTO usuarios (nome, email, senha, saldo, cargo) VALUES (?, ?, ?, 0, "comum")', [nome, email, senha], (err) => {
        if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
        res.json({ sucesso: true });
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (results.length > 0) res.json({ sucesso: true, ...results[0] });
        else res.json({ sucesso: false, mensagem: 'Dados incorretos' });
    });
});

app.post('/atualizar-saldo', (req, res) => {
    const { email, novoSaldo } = req.body;
    db.query('UPDATE usuarios SET saldo = ? WHERE email = ?', [novoSaldo, email], (err) => {
        if (err) return res.status(500).json({ sucesso: false });
        res.json({ sucesso: true });
    });
});

// ENTREGAR PÁGINAS HTML
app.get('/login.html', (req, res) => { res.sendFile(path.join(__dirname, 'login.html')); });
app.get('/dragon.html', (req, res) => { res.sendFile(path.join(__dirname, 'dragon.html')); });
app.get('/mines.html', (req, res) => { res.sendFile(path.join(__dirname, 'mines.html')); });
app.get('/admin.html', (req, res) => { res.sendFile(path.join(__dirname, 'admin.html')); });

// ROTA FINAL (HOME)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;
