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
        console.error('❌ Erro ao conectar:', err);
        return;
    }
    console.log('🔌 Conectado! Iniciando reparos nas tabelas...');
    repararTabelas();
});

function repararTabelas() {
    // 1. Consertar tabela USUARIOS
    const sqlUsers = "ALTER TABLE usuarios MODIFY id INT AUTO_INCREMENT;";
    
    // 2. Consertar tabela APOSTAS (para o futuro)
    const sqlBets = "ALTER TABLE apostas MODIFY id INT AUTO_INCREMENT;";

    // 3. Consertar tabela CONFIGURACOES
    const sqlConfig = "ALTER TABLE configuracoes MODIFY id INT AUTO_INCREMENT;";

    connection.query(sqlUsers, (err) => {
        if (err) console.log('⚠️ Aviso em Usuarios (talvez já esteja ok):', err.message);
        else console.log('✅ Tabela USUARIOS corrigida!');

        connection.query(sqlBets, (err) => {
            if (err) console.log('⚠️ Aviso em Apostas:', err.message);
            else console.log('✅ Tabela APOSTAS corrigida!');

            connection.query(sqlConfig, (err) => {
                if (err) console.log('⚠️ Aviso em Configuracoes:', err.message);
                else console.log('✅ Tabela CONFIGURACOES corrigida!');
                
                console.log('🏁 Tudo pronto! Tente cadastrar no site agora.');
                connection.end();
            });
        });
    });
}
