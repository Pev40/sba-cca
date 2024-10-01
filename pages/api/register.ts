// /pages/api/register.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres'; // Importa el conector de Vercel para PostgreSQL
import nodemailer from 'nodemailer';
import path from 'path';
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
  html: string;
  attachments: Array<{
    filename: string;
    path: string;
    cid: string;
  }>;
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
      user: 'donacion@sbarequipa.org.pe',
      pass: 'Sbarequipa141*'
    },
    tls: {
      rejectUnauthorized: false
    }
  } as SMTPTransportOptions);

  // Definir la ruta de la imagen
  const imagePath = path.join(process.cwd(), 'public/afichecorreo.jpg');
  // Definir la ruta de la imagen y el PDF
  const pdfPath = path.join(process.cwd(), 'public/Régimen tributario de Donaciones - Cartilla Informativa.pdf');


  const mailOptions = {
    from: 'tecnologias_informacion@sbarequipa.org.pe',
    to: correo,
    subject: '¡Registro Exitoso en Ayúdame a Ayudar!',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; text-align: center;">
        <h1 style="color: #0056b3;">¡Gracias por Registrarte, ${nombre}!</h1>
        <p>Nos alegra tenerte como parte de nuestra comunidad. A través de tu registro, estás ayudando a mejorar la vida de muchas personas en nuestra región.</p>
        <img src="cid:aficheCorreo" alt="Afiche Ayúdame a Ayudar" style="max-width: 100%; height: auto;"/>
        <p>Gracias por asistir a nuestro evento en la Cámara de Comercio de Arequipa. ¡Juntos podemos hacer una gran diferencia!</p>
        <p style="font-weight: bold;">Mira este video para conocer más:</p>
        <a href="https://www.youtube.com/watch?v=LL1DVl4l3ho" target="_blank">
          <img src="https://img.youtube.com/vi/LL1DVl4l3ho/hqdefault.jpg"
               alt="Ver video en YouTube" 
               style="max-width: 100%; height: auto;"/>
        </a>
        <p style="font-weight: bold;">Atentamente,</p>
        <p>Sociedad de Beneficencia de Arequipa</p>
      </div>
    `,
    attachments: [
      {
        filename: 'aficheCorreo.jpg',
        path: imagePath,  // Ruta a la imagen cargada
        cid: 'aficheCorreo' // Referencia para usar la imagen en el HTML
      },
      {
        filename: 'Régimen tributario de Donaciones - Cartilla Informativa.pdf',
        path: pdfPath,  // Ruta del PDF
        contentType: 'application/pdf'
      }
    ]
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
