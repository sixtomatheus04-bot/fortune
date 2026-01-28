const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 1. ARQUIVOS ESTÁTICOS ---
// Isso permite que o servidor entregue imagens, CSS e JS que estão na pasta
app.use(express.static(__dirname));

// --- 2. CONEXÃO COM O BANCO (POOL INTELIGENTE) ---
// Usamos 'createPool' para a Vercel não derrubar a conexão
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

// Teste silencioso de conexão
db.getConnection((err, connection) => {
    if (err) console.error('⚠️ Erro ao conectar no Pool:', err.message);
    else {
        console.log('✅ Banco conectado via Pool!');
        connection.release();
    }
});

// --- 3. ROTAS DE PÁGINAS (HTML) ---

// Rota específica para o Login
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota específica para o Admin
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- 4. ROTAS DA API (DADOS) ---

// CADASTRO
app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    console.log("Novo cadastro:", nome);

    const sql = 'INSERT INTO usuarios (nome, email, senha, saldo, cargo) VALUES (?, ?, ?, 0, "comum")';
    
    db.query(sql, [nome, email, senha], (err, result) => {
        if (err) {
            console.error("Erro SQL:", err.message);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ sucesso: false, mensagem: 'Este e-mail já está em uso!' });
            }
            return res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor: ' + err.message });
        }
        res.json({ sucesso: true, mensagem: 'Conta criada com sucesso!' });
    });
});

// LOGIN
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
        if (err) return res.status(500).json({ erro: err.message });
        
        if (results.length > 0) {
            res.json({
                sucesso: true,
                nome: results[0].nome,
                saldo: results[0].saldo,
                cargo: results[0].cargo
            });
        } else {
            res.json({ sucesso: false, mensagem: 'E-mail ou senha incorretos' });
        }
    });
});

// ADMIN: Estatísticas
app.get('/admin/stats', (req, res) => {
    db.query('SELECT count(*) as total FROM usuarios', (err, rUsers) => {
        const totalUsers = rUsers ? rUsers[0].total : 0;
        db.query('SELECT rtp_global FROM configuracoes WHERE id = 1', (err, rConfig) => {
            const rtp = rConfig[0] ? rConfig[0].rtp_global : 30;
            res.json({ usuarios: totalUsers, rtp: rtp });
        });
    });
});

// ADMIN: Mudar RTP
app.post('/admin/mudar-rtp', (req, res) => {
    const { novoRtp } = req.body;
    db.query('UPDATE configuracoes SET rtp_global = ? WHERE id = 1', [novoRtp], (err, result) => {
        if(err) return res.json({ sucesso: false });
        res.json({ sucesso: true, mensagem: `RTP atualizado para ${novoRtp}%` });
    });
});

// --- 5. ROTA DE EMERGÊNCIA (CORREÇÃO) ---
app.get('/fix-db', (req, res) => {
    const sqls = [
        "SET FOREIGN_KEY_CHECKS = 0;",
        "ALTER TABLE usuarios MODIFY id INT AUTO_INCREMENT;",
        "ALTER TABLE apostas MODIFY id INT AUTO_INCREMENT;",
        "ALTER TABLE configuracoes MODIFY id INT AUTO_INCREMENT;",
        "SET FOREIGN_KEY_CHECKS = 1;"
    ];

    // Executa em cascata
    db.query(sqls[0], () => {
        db.query(sqls[1], () => {
             db.query(sqls[2], () => {
                 db.query(sqls[3], () => {
                     db.query(sqls[4], () => {
                         res.send("<h1>✅ Banco Verificado e Consertado!</h1>");
                     });
                 });
             });
        });
    });
});

// --- 6. ROTA FINAL (FALLBACK) ---
// Se não for nenhuma rota acima, entrega a Home (index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Exporta para a Vercel
module.exports = app;
