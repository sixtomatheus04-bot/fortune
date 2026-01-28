const mysql = require('mysql2');

// Seus dados do Railway
const connection = mysql.createConnection({
    host: 'gondola.proxy.rlwy.net',
    port: 43822,
    user: 'root',
    password: 'FaVogexYSbQIaaGTJJFMWwhTIMZAibUB',
    database: 'railway'
});

connection.connect(err => {
    if (err) {
        console.error('Erro ao conectar:', err);
        return;
    }
    console.log('Conectado! Corrigindo o erro do ID...');

    // Comando que ativa o AUTO_INCREMENT na tabela de usuários
    const sql = "ALTER TABLE usuarios MODIFY id INT AUTO_INCREMENT;";

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('❌ Deu erro ao corrigir:', err.message);
        } else {
            console.log('✅ SUCESSO! O ID agora é automático.');
            console.log('Agora você pode cadastrar usuários normalmente.');
        }
        connection.end();
    });
});
