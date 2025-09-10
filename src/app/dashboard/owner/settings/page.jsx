"use client";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Configuración Admin</h1>
      <p className="text-gray-600">
        Aquí puedes gestionar la configuración general de la plataforma,
        preferencias globales y administración de cuentas.
      </p>

      <div className="p-6 bg-white rounded-xl shadow border space-y-4">
        <h2 className="text-lg font-semibold">Opciones</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Configurar roles y permisos</li>
          <li>Gestión de seguridad</li>
          <li>Actualizar contraseña</li>
          <li>Eliminar cuenta de administrador</li>
        </ul>
      </div>
    </div>
  );
}
