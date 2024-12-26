document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('/usuarios');
  const usuarios = await response.json();

  const tableBody = document.querySelector('#usersTable tbody');
  usuarios.forEach(usuario => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${usuario.Id}</td>
      <td>${usuario.Nombre}</td>
      <td>${usuario.Apellido}</td>
      <td>${usuario.Email}</td>
      <td>${usuario.ImagenPerfil ? `<img src="${usuario.ImagenPerfil}" alt="${usuario.Nombre}" class="profile-image">` : 'N/A'}</td>
      <td class="action-buttons">
        <button onclick="deleteUser(${usuario.Id})">Eliminar</button>
        <button onclick="updateUser(${usuario.Id})">Actualizar</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
});

async function deleteUser(id) {
  const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este usuario?');
  if (!confirmDelete) return;

  try {
    const response = await fetch(`/usuarios/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      const errorResult = await response.json();
      throw new Error(errorResult.error || 'Error al eliminar el usuario.');
    }

    const result = await response.json();
    alert(result.message || 'Usuario eliminado exitosamente.');
    location.reload(); // Recargar la página después de la eliminación
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    alert(error.message || 'Hubo un problema al eliminar el usuario.');
  }
}

async function updateUser(id) {
  window.location.href = `/formUpdate.html?id=${id}`;
}
