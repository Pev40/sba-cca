// Cambia la importación de mysql a mysql2/promise
import mysql from 'mysql2';

// Configuración de la conexión
const config = {
  host: 'localhost',
  user: 'root',
  password: 'root',  // Cambia esto por tu contraseña
  database: 'empresaDB'  // Cambia esto por el nombre de tu base de datos
};

// Crear conexión a la base de datos
const connection = await mysql.createConnection(config);
console.log('Conectado a la base de datos');
export default connection;