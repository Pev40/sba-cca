/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/testdb.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../config/db';  // Asegúrate de que la ruta a tu archivo db es correcta

interface QueryResult {
  'NOW()': string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  db.query('SELECT NOW()', (err: any, results: QueryResult[]) => {
    if (err) {
      console.error('Error durante la consulta:', err);
      return res.status(500).json({ message: 'Error al conectar con la base de datos', error: err });
    }
    res.status(200).json({ currentTime: results[0]['NOW()'] });
  });
}
