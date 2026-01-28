const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexão Railway
const db = mysql.createConnection({
    host: 'gondola.proxy.rlwy.net',
    port: 43822,
    user: 'root',
    password: 'FaVogexYSbQIaaGTJJFMWwhTIMZAibUB',
    database: 'railway'
});

db.connect(err => {
    if (err) console.error('Erro conexão:', err.message);
    else console.log('Banco OK');
});

// LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: err });
        if (results.length > 0) {
            res.json({
                sucesso: true, 
                nome: results[0].nome, 
                saldo: results[0].saldo, 
                cargo: results[0].cargo 
            });
        } else {
            res.json({ sucesso: false, mensagem: 'Dados incorretos' });
        }
    });
});

// CADASTRO
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    db.query('INSERT INTO usuarios (nome, email, senha, saldo, cargo) VALUES (?, ?, ?, 0, "comum")', [nome, email, senha], (err, result) => {
        if (err) return res.json({ sucesso: false, mensagem: 'Erro ou email duplicado' });
        res.json({ sucesso: true, mensagem: 'Conta criada!' });
    });
});

// --- NOVAS ROTAS DE ADMIN ---

// 1. Pegar estatísticas (Total de usuários e RTP atual)
app.get('/admin/stats', (req, res) => {
    // Pega total de usuários
    db.query('SELECT count(*) as total FROM usuarios', (err, resultsUsers) => {
        const totalUsers = resultsUsers[0].total;
        
        // Pega configuração atual
        db.query('SELECT rtp_global FROM configuracoes WHERE id = 1', (err, resultsConfig) => {
            const rtp = resultsConfig[0] ? resultsConfig[0].rtp_global : 30;
            res.json({ usuarios: totalUsers, rtp: rtp });
        });
    });
});

// 2. Mudar o RTP (A chance de ganhar)
app.post('/admin/mudar-rtp', (req, res) => {
    const { novoRtp } = req.body;
    db.query('UPDATE configuracoes SET rtp_global = ? WHERE id = 1', [novoRtp], (err, result) => {
        if(err) return res.json({ sucesso: false });
        res.json({ sucesso: true, mensagem: `Chance de vitória alterada para ${novoRtp}%` });
    });
});

// Rota padrão (API status)
app.get('/', (req, res) => {
    res.send('API Fortune Bet rodando!');
});

module.exports = app;
