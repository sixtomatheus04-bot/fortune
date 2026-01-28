const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 1. CONFIGURAÇÃO PARA CARREGAR O SITE ---
// Isso diz: "Os arquivos do site estão nesta mesma pasta"
app.use(express.static(__dirname));

// --- 2. CONEXÃO COM O BANCO RAILWAY ---
const db = mysql.createConnection({
    host: 'gondola.proxy.rlwy.net',
    port: 43822,
    user: 'root',
    password: 'FaVogexYSbQIaaGTJJFMWwhTIMZAibUB',
    database: 'railway'
});

// Mantém a conexão viva
db.connect(err => {
    if (err) console.error('Erro fatal no banco:', err.message);
    else console.log('Banco de Dados Conectado!');
});

// --- 3. ROTAS DA API (CADASTRO E LOGIN) ---

app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    console.log("Tentando cadastrar:", nome, email); // Para logs da Vercel

    const sql = 'INSERT INTO usuarios (nome, email, senha, saldo, cargo) VALUES (?, ?, ?, 0, "comum")';
    
    db.query(sql, [nome, email, senha], (err, result) => {
        if (err) {
            console.error("Erro no SQL:", err.message);
            // Se o erro for de duplicidade (email igual)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ sucesso: false, mensagem: 'Esse e-mail já está em uso!' });
            }
            return res.status(500).json({ sucesso: false, mensagem: 'Erro no banco de dados: ' + err.message });
        }
        res.json({ sucesso: true, mensagem: 'Conta criada com sucesso! Pode logar.' });
    });
});

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND senha = ?';
    
    db.query(sql, [email, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        
        if (results.length > 0) {
            res.json({
                sucesso: true,
                nome: results[0].nome,
                saldo: results[0].saldo,
                cargo: results[0].cargo
            });
        } else {
            res.json({ sucesso: false, mensagem: 'Email ou senha incorretos' });
        }
    });
});

// ROTAS DO ADMIN (Mantivemos igual)
app.get('/admin/stats', (req, res) => { /* ... código igual ao anterior ... */ });
app.post('/admin/mudar-rtp', (req, res) => { /* ... código igual ao anterior ... */ });


// --- 4. ROTA FINAL (SE NÃO FOR API, É O SITE) ---
app.get('*', (req, res) => {
    // Se o usuário acessar /admin, manda o admin.html
    if (req.path === '/admin' || req.path === '/admin.html') {
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        // Para qualquer outra coisa, manda o index.html
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

module.exports = app;
