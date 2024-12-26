document.getElementById('userForm').addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const formData = new FormData(document.getElementById('userForm'));

    try {
      const response = await fetch('/usuarios', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Usuario registrado exitosamente.');
        window.location.href = '/index.html';
      } else {
        alert(result.error || 'Error al registrar el usuario.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un problema al registrar el usuario.');
    }
  });