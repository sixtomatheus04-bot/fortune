// --- ROTA DE EMERGÊNCIA PARA CONSERTAR O BANCO ---
app.get('/fix-db', (req, res) => {
    const sql = "ALTER TABLE usuarios MODIFY id INT AUTO_INCREMENT;";
    const sql2 = "ALTER TABLE apostas MODIFY id INT AUTO_INCREMENT;";
    const sql3 = "ALTER TABLE configuracoes MODIFY id INT AUTO_INCREMENT;";

    // Desliga a segurança para permitir a mudança
    db.query('SET FOREIGN_KEY_CHECKS = 0;', (err) => {
        if(err) return res.send("Erro ao desligar checks: " + err.message);

        // Arruma Usuários
        db.query(sql, (err) => {
            if(err) console.log("Erro users (pode ignorar se já foi): " + err.message);
            
            // Arruma Apostas
            db.query(sql2, (err) => {
                
                // Arruma Configurações
                db.query(sql3, (err) => {
                    
                    // Liga a segurança de volta
                    db.query('SET FOREIGN_KEY_CHECKS = 1;', () => {
                        res.send("<h1>✅ SUCESSO! O Banco foi consertado.</h1><p>Pode voltar e cadastrar.</p>");
                    });
                });
            });
        });
    });
});
// -------------------------------------------------
