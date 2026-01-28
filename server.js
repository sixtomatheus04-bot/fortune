// --- ROTA PARA ATUALIZAR SALDO (JOGOS) ---
app.post('/atualizar-saldo', (req, res) => {
    const { email, novoSaldo } = req.body;
    
    // Segurança básica: só atualiza se mandar email e valor
    if (!email || novoSaldo === undefined) {
        return res.status(400).json({ sucesso: false, mensagem: "Dados inválidos" });
    }

    // Atualiza no banco
    const sql = 'UPDATE usuarios SET saldo = ? WHERE email = ?';
    db.query(sql, [novoSaldo, email], (err, result) => {
        if (err) {
            console.error("Erro ao salvar saldo:", err);
            return res.status(500).json({ sucesso: false });
        }
        res.json({ sucesso: true, saldo: novoSaldo });
    });
});
