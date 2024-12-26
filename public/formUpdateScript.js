document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
      alert('ID de usuario no proporcionado.');
      window.location.href = '/index.html';
      return;
    }

    try {
      const response = await fetch(`/usuarios/${userId}`);
      const user = await response.json();

      if (!response.ok) {
        alert('Error al cargar datos del usuario.');
        return;
      }

      document.getElementById('nombre').value = user.Nombre;
      document.getElementById('apellido').value = user.Apellido;
      document.getElementById('email').value = user.Email;
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      alert('Hubo un problema al cargar los datos del usuario.');
    }

    document.getElementById('userUpdateForm').addEventListener('submit', async (event) => {
      event.preventDefault();

      const passwordAnterior = document.getElementById('passwordAnterior').value;
      const passwordNueva = document.getElementById('passwordNueva').value;
      const formData = new FormData(document.getElementById('userUpdateForm'));

      try {
        const validateResponse = await fetch(`/usuarios/${userId}/validarPassword`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passwordAnterior }),
        });

        const validateResult = await validateResponse.json();

        if (!validateResponse.ok) {
          alert(validateResult.error || 'La contraseña anterior es incorrecta.');
          return;
        }

        if (!passwordNueva) {
          formData.delete('passwordNueva');
        }

        const imagenInput = document.getElementById('imagen');
        if (!imagenInput.files.length) {
          formData.delete('imagen'); 
        }

        const updateResponse = await fetch(`/usuarios/${userId}`, {
          method: 'PUT',
          body: formData,
        });

        const updateResult = await updateResponse.json();

        if (updateResponse.ok) {
          alert('Usuario actualizado exitosamente.');
          window.location.href = '/index.html';
        } else {
          alert(updateResult.error || 'Error al actualizar el usuario.');
        }
      } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        alert('Hubo un problema al actualizar el usuario.');
      }
    });
  });