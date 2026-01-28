const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'gondola.proxy.rlwy.net',
    port: 43822,
    user: 'root',
    password: 'FaVogexYSbQIaaGTJJFMWwhTIMZAibUB',
    database: 'railway'
});

connection.connect(err => {
    if (err) {
        console.error('❌ Erro de conexão:', err.message);
        return;
    }
    console.log('🔧 Conectado. Iniciando reparo forçado...');
    forcarReparo();
});

function forcarReparo() {
    // 1. Desativa a segurança de chaves estrangeiras
    connection.query('SET FOREIGN_KEY_CHECKS = 0;', (err) => {
        if(err) console.log('Erro ao desligar checks:', err.message);

        // 2. Conserta a tabela USUARIOS
        connection.query('ALTER TABLE usuarios MODIFY COLUMN id INT AUTO_INCREMENT;', (err) => {
            if (err) console.log('❌ Falha em Usuarios:', err.message);
            else console.log('✅ Tabela USUARIOS: Modo Automático ATIVADO!');

            // 3. Conserta a tabela APOSTAS
            connection.query('ALTER TABLE apostas MODIFY COLUMN id INT AUTO_INCREMENT;', (err) => {
                if (err) console.log('❌ Falha em Apostas:', err.message);
                else console.log('✅ Tabela APOSTAS: Modo Automático ATIVADO!');

                // 4. Conserta a tabela CONFIGURACOES
                connection.query('ALTER TABLE configuracoes MODIFY COLUMN id INT AUTO_INCREMENT;', (err) => {
                    if (err) console.log('❌ Falha em Configuracoes:', err.message);
                    else console.log('✅ Tabela CONFIGURACOES: Modo Automático ATIVADO!');

                    // 5. Liga a segurança de volta
                    connection.query('SET FOREIGN_KEY_CHECKS = 1;', () => {
                        console.log('🔒 Segurança reativada.');
                        console.log('🚀 FIM! Tente cadastrar no site agora.');
                        connection.end();
                    });
                });
            });
        });
    });
}
