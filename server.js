const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve os arquivos do site
app.use(express.static(__dirname));

// --- NOVA CONEXÃO INTELIGENTE (POOL) ---
// Em vez de 'createConnection', usamos 'createPool'
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

// Teste simples para ver se o banco responde
db.getConnection((err, connection) => {
    if (err) {
        console.error('⚠️ O servidor ligou, mas o banco deu erro:', err.message);
    } else {
        console.log('✅ Banco conectado com sucesso via Pool!');
        connection.release(); // Solta a conexão para não travar
    }
});

// --- ROTA DE CORREÇÃO (FIX-DB) ---
app.get('/fix-db', (req, res) => {
    // Essa rota força o conserto do banco
    const sqls = [
        "SET FOREIGN_KEY_CHECKS = 0;",
        "ALTER TABLE usuarios MODIFY id INT AUTO_INCREMENT;",
        "ALTER TABLE apostas MODIFY id INT AUTO_INCREMENT;",
        "ALTER TABLE configuracoes MODIFY id INT AUTO_INCREMENT;",
        "SET FOREIGN_KEY_CHECKS = 1;"
    ];

    // Executa um por um
    db.query(sqls[0], () => {
        db.query(sqls[1], () => {
             db.query(sqls[2], () => {
                 db.query(sqls[3], () => {
                     db.query(sqls[4], () => {
                         res.send("<h1>✅ Banco Consertado!</h1><p>Tente cadastrar agora.</p>");
                     });
                 });
             });
        });
    });
});

// --- ROTA DE CADASTRO ---
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    console.log("Tentativa de cadastro:", nome);

    const sql = 'INSERT INTO usuarios (nome, email, senha, saldo, cargo) VALUES (?, ?, ?, 0, "comum")';
    
    db.query(sql, [nome, email, senha], (err, result) => {
        if (err) {
            console.error("Erro SQL:", err.message);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ sucesso: false, mensagem: 'E-mail já existe!' });
            }
            return res.status(500).json({ sucesso: false, mensagem: 'Erro no banco: ' + err.message });
        }
        res.json({ sucesso: true, mensagem: 'Conta criada! Pode entrar.' });
    });
});

// --- ROTA DE LOGIN ---
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        if (results.length > 0) {
            res.json({ sucesso: true, nome: results[0].nome, saldo: results[0].saldo, cargo: results[0].cargo });
        } else {
            res.json({ sucesso: false, mensagem: 'Dados incorretos' });
        }
    });
});

// Rotas Admin
app.get('/admin/stats', (req, res) => {
    db.query('SELECT count(*) as total FROM usuarios', (err, rUsers) => {
        const totalUsers = rUsers ? rUsers[0].total : 0;
        db.query('SELECT rtp_global FROM configuracoes WHERE id = 1', (err, rConfig) => {
            const rtp = rConfig[0] ? rConfig[0].rtp_global : 30;
            res.json({ usuarios: totalUsers, rtp: rtp });
        });
    });
});

app.post('/admin/mudar-rtp', (req, res) => {
    const { novoRtp } = req.body;
    db.query('UPDATE configuracoes SET rtp_global = ? WHERE id = 1', [novoRtp], (err, result) => {
        if(err) return res.json({ sucesso: false });
        res.json({ sucesso: true, mensagem: `RTP atualizado para ${novoRtp}%` });
    });
});

// ROTA FINAL
app.get('*', (req, res) => {
    if (req.path.includes('admin')) {
        res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

module.exports = app;
// No final do server.js, adicione:
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});
