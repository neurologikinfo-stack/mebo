"use client";

export default function OwnerSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Configuración Propietario
      </h1>
      <p className="text-gray-600">
        Aquí puedes administrar la configuración de tu cuenta como propietario,
        preferencias de negocio y notificaciones.
      </p>

      <div className="p-6 bg-white rounded-xl shadow border space-y-4">
        <h2 className="text-lg font-semibold">Opciones</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Configurar alertas de pagos</li>
          <li>Preferencias de comunicación con inquilinos</li>
          <li>Actualizar contraseña</li>
          <li>Eliminar cuenta</li>
        </ul>
      </div>
    </div>
  );
}
