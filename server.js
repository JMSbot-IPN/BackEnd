const express = require('express');
const path = require('path');
const multer = require('multer');
const { sequelize, Usuario } = require('./models');
const { console } = require('inspector');
const fs = require('fs');
require('dotenv').config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Sincronizar la base de datos
sequelize.sync({ alter: true }).then(() => {
  console.log('Base de datos sincronizada.');
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Crear usuario
app.post('/usuarios', upload.single('imagen'), async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const imagenPerfil = req.file ? `/uploads/${req.file.filename}` : null;
    const usuario = await Usuario.create({
      Nombre: nombre,
      Apellido: apellido,
      Email: email,
      Password: password,
      ImagenPerfil: imagenPerfil,
    });

    res.status(201).json({ message: 'Usuario creado exitosamente.', usuario });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// Obtener un usuario por ID
app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario.' });
  }
});

// Actualizar usuario
app.put('/usuarios/:id', upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email, passwordNueva } = req.body;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (nombre) usuario.Nombre = nombre;
    if (apellido) usuario.Apellido = apellido;
    if (email) usuario.Email = email;

    // Actualizar contraseña si se proporciona una nueva
    if (passwordNueva) {
      usuario.Password = passwordNueva;
    }

    // Actualizar imagen de perfil si se proporciona
    if (req.file) {
      // Eliminar imagen de perfil si existe
      if (usuario.ImagenPerfil) {
        const imagePath = path.join(__dirname, usuario.ImagenPerfil);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen de perfil:', err);
          }
        });
      }
      usuario.ImagenPerfil = `/uploads/${req.file.filename}`;
    }

    await usuario.save();

    res.json({ message: 'Usuario actualizado exitosamente.', usuario });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario.' });
  }
});

// Eliminar usuario
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Eliminar imagen de perfil si existe
    if (usuario.ImagenPerfil) {
      const imagePath = path.join(__dirname, usuario.ImagenPerfil);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error al eliminar la imagen de perfil:', err);
        }
      });
    }

    // Eliminar usuario de la base de datos
    await usuario.destroy();

    res.json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
});

// Validar contraseña anterior
app.post('/usuarios/:id/validarPassword', async (req, res) => {
  const { id } = req.params;
  const { passwordAnterior } = req.body;

  if (!passwordAnterior) {
    return res.status(400).json({ error: 'La contraseña anterior es obligatoria.' });
  }

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Comparacion de contraseñas
    if (usuario.Password !== passwordAnterior) {
      return res.status(401).json({ error: 'La contraseña anterior no coincide.' });
    }

    res.json({ message: 'Contraseña validada correctamente.' });
  } catch (error) {
    console.error('Error al validar la contraseña:', error);
    res.status(500).json({ error: 'Error al validar la contraseña.' });
  }
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
