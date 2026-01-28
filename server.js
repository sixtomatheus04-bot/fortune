const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

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

// --- ROTAS DO ADMIN ---

// 1. Listar todos os usuários
app.get('/admin/usuarios', (req, res) => {
    db.query('SELECT id, nome, email, saldo, cargo FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Adicionar/Remover Dinheiro
app.post('/admin/saldo', (req, res) => {
    const { email, valor } = req.body; // Valor pode ser positivo ou negativo
    db.query('UPDATE usuarios SET saldo = saldo + ? WHERE email = ?', [valor, email], (err) => {
        if (err) return res.json({ sucesso: false });
        res.json({ sucesso: true });
    });
});

// 3. Pegar estatísticas e RTP
app.get('/admin/stats', (req, res) => {
    db.query('SELECT count(*) as total FROM usuarios', (err, rUsers) => {
        const totalUsers = rUsers ? rUsers[0].total : 0;
        db.query('SELECT rtp_global FROM configuracoes WHERE id = 1', (err, rConfig) => {
            const rtp = rConfig[0] ? rConfig[0].rtp_global : 30;
            res.json({ usuarios: totalUsers, rtp: rtp });
        });
    });
});

// 4. Mudar RTP
app.post('/admin/mudar-rtp', (req, res) => {
    const { novoRtp } = req.body;
    db.query('UPDATE configuracoes SET rtp_global = ? WHERE id = 1', [novoRtp], (err) => {
        res.json({ sucesso: !err });
    });
});

// --- ROTAS DE CHAT (SUPORTE) ---

// Usuário manda mensagem
app.post('/chat/enviar', (req, res) => {
    const { email, mensagem } = req.body;
    db.query('INSERT INTO chat (email_usuario, mensagem) VALUES (?, ?)', [email, mensagem], (err) => {
        res.json({ sucesso: !err });
    });
});

// Admin responde
app.post('/chat/responder', (req, res) => {
    const { id, resposta } = req.body;
    db.query('UPDATE chat SET resposta = ?, respondido = TRUE WHERE id = ?', [resposta, id], (err) => {
        res.json({ sucesso: !err });
    });
});

// Listar mensagens (Para o Admin ver tudo)
app.get('/chat/todas', (req, res) => {
    db.query('SELECT * FROM chat ORDER BY id DESC', (err, results) => {
        res.json(results);
    });
});

// Listar mensagens do Usuário (Para o jogador ver as dele)
app.post('/chat/minhas', (req, res) => {
    const { email } = req.body;
    db.query('SELECT * FROM chat WHERE email_usuario = ? ORDER BY id DESC', [email], (err, results) => {
        res.json(results);
    });
});

// --- ROTAS PADRÃO (LOGIN/CADASTRO/JOGOS) ---
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    db.query('INSERT INTO usuarios (nome, email, senha, saldo, cargo) VALUES (?, ?, ?, 0, "comum")', [nome, email, senha], (err) => {
        if (err) return res.json({ sucesso: false, mensagem: 'Email já existe' });
        res.json({ sucesso: true });
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
        if (results.length > 0) res.json({ sucesso: true, ...results[0] });
        else res.json({ sucesso: false, mensagem: 'Dados incorretos' });
    });
});

app.post('/atualizar-saldo', (req, res) => {
    const { email, novoSaldo } = req.body;
    db.query('UPDATE usuarios SET saldo = ? WHERE email = ?', [novoSaldo, email], (err) => {
        res.json({ sucesso: !err });
    });
});

// Rota para criar tabela chat (se precisar rodar de novo)
app.get('/setup-chat', (req, res) => {
    const sql = `CREATE TABLE IF NOT EXISTS chat (id INT AUTO_INCREMENT PRIMARY KEY, email_usuario VARCHAR(255), mensagem TEXT, resposta TEXT, respondido BOOLEAN DEFAULT FALSE, data TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    db.query(sql, (err) => res.send(err ? "Erro" : "Tabela Chat OK"));
});

// Entregar arquivos HTML
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/dragon.html', (req, res) => res.sendFile(path.join(__dirname, 'dragon.html')));
app.get('/mines.html', (req, res) => res.sendFile(path.join(__dirname, 'mines.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/suporte.html', (req, res) => res.sendFile(path.join(__dirname, 'suporte.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

module.exports = app;
