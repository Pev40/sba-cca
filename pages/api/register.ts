// /pages/api/register.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres'; // Importa el conector de Vercel para PostgreSQL
import nodemailer from 'nodemailer';

interface RegistroRequest {
  ruc_dni: string;
  nombre_completo: string;
  correo_contacto: string;
  telefono_contacto: string;
  empresa: string;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { ruc_dni, nombre_completo, correo_contacto, telefono_contacto, empresa } = req.body as RegistroRequest;

    // Verifica que todos los campos requeridos están presentes
    if (!ruc_dni || !nombre_completo || !correo_contacto || !telefono_contacto) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
      // Comprobar si el RUC/DNI ya existe en la base de datos
      const result = await sql`
        SELECT ruc_dni FROM contacto WHERE ruc_dni = ${ruc_dni}
      `;
      const existingRecord = result.rows[0];

      if (existingRecord) {
        // Si ya existe, retorna un error
        return res.status(409).json({ message: 'El RUC/DNI ya está registrado' });
      }

      // Si no existe, inserta los datos en la base de datos
      await sql`
        INSERT INTO contacto (ruc_dni, nombre_completo, correo_contacto, telefono_contacto, empresa)
        VALUES (${ruc_dni}, ${nombre_completo}, ${correo_contacto}, ${telefono_contacto}, ${empresa})
      `;

      // Enviar correo al contacto registrado
      await enviarCorreo(correo_contacto, nombre_completo);

      res.status(201).json({ message: 'Usuario registrado y correo enviado' });
    } catch (err) {
      console.error('Error al procesar la solicitud:', err);
      res.status(500).json({ message: 'Error interno del servidor', error: err });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
}

interface SMTPTransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls: {
    rejectUnauthorized: boolean;
  };
}

async function enviarCorreo(correo: string, nombre: string) {
  const transporter = nodemailer.createTransport({
    host: 'mail.sbarequipa.org.pe',
    port: 587,
    secure: false,  // True para 465, false para otros puertos
    auth: {
      user: 'tecnologias_informacion@sbarequipa.org.pe',
      pass: 'Sbarequipa141*'
    },
    tls: {
      rejectUnauthorized: false
    }
  } as SMTPTransportOptions);

  const mailOptions = {
    from: 'tecnologias_informacion@sbarequipa.org.pe',
    to: correo,
    subject: 'Registro Exitoso',
    text: `Hola ${nombre}, gracias por registrarte en nuestra plataforma.`
  } as MailOptions;

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error: unknown, info: unknown) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
        reject(error);
      } else {
        console.log('Correo enviado: ' + (info as nodemailer.SentMessageInfo).response);
        resolve(info);
      }
    });
  });
}
