'use client'; // Habilitar uso de hooks en Next.js

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { TextField, Button, Container, Box, Typography, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const RegistroForm = () => {
  const [formData, setFormData] = useState({
    ruc_dni: '',
    nombre_completo: '',
    correo_contacto: '',
    telefono_contacto: '',
    empresa: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false); // Estado para controlar la apertura del modal

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleConsultar = async () => {
    const { ruc_dni } = formData;
    const isRUC = ruc_dni.length === 11;
    const isDNI = ruc_dni.length === 8;

    if (!isRUC && !isDNI) {
      setError('El RUC debe tener 11 dígitos o el DNI debe tener 8 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    const url = isRUC ? `https://apiperu.dev/api/ruc` : `https://apiperu.dev/api/dni`;
    const body = isRUC ? { ruc: ruc_dni } : { dni: ruc_dni };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer 727eb76e677982d373a90531bc86502d542cff22a4f973fcd08594d1b27ede85`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Error al consultar la API');
      }

      const data = await response.json();

      if (isRUC) {
        setFormData({
          ...formData,
          nombre_completo: data.data.nombre_o_razon_social || '',
          empresa: data.data.nombre_o_razon_social || '',
        });
      } else {
        setFormData({
          ...formData,
          nombre_completo: `${data.data.nombre_completo}`,
        });
      }

    } catch (error) {
      setError('Error al consultar la API');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setOpenModal(true); // Abrir el modal si el registro es exitoso
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
    }
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <div></div>
      </Box>

      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          marginTop: '25px',
          gap: 2,
          bgcolor: 'white',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
        }}
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label="RUC / DNI"
            variant="outlined"
            name="ruc_dni"
            value={formData.ruc_dni}
            onChange={handleChange}
            required
            fullWidth
            disabled={loading}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleConsultar}
            disabled={loading || formData.ruc_dni.length < 8}
          >
            {loading ? <CircularProgress size={24} /> : 'Consultar'}
          </Button>
        </Box>

        {error && <Typography color="error">{error}</Typography>}

        <TextField
          label="Nombre Completo"
          variant="outlined"
          name="nombre_completo"
          value={formData.nombre_completo}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Correo de Contacto"
          variant="outlined"
          name="correo_contacto"
          value={formData.correo_contacto}
          onChange={handleChange}
          required
          fullWidth
          type="email"
          disabled={loading}
        />
        <TextField
          label="Teléfono de Contacto"
          variant="outlined"
          name="telefono_contacto"
          value={formData.telefono_contacto}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading}
        />
        <TextField
          label="Empresa"
          variant="outlined"
          name="empresa"
          value={formData.empresa}
          onChange={handleChange}
          required
          fullWidth
          disabled={loading }
        />

        <Button variant="contained" color="primary" fullWidth type="submit" disabled={loading}>
          Registrar
        </Button>
      </Box>

      {/* Modal para mostrar éxito en el registro */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Registro Exitoso</DialogTitle>
        <DialogContent>
          <DialogContentText>
            El usuario ha sido registrado correctamente y se ha enviado un correo de confirmación.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegistroForm;
