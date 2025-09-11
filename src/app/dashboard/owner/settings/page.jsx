"use client";

export default function OwnerSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        Configuración Propietario
      </h1>
      <p className="text-muted-foreground">
        Aquí puedes administrar la configuración de tu cuenta como propietario,
        las preferencias de tus negocios y notificaciones.
      </p>

      <div className="p-6 bg-card text-card-foreground rounded-xl shadow border border-border space-y-4">
        <h2 className="text-lg font-semibold">Opciones</h2>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Configurar alertas de pagos</li>
          <li>Preferencias de comunicación con clientes</li>
          <li>Actualizar contraseña</li>
          <li>Eliminar cuenta</li>
        </ul>
      </div>
    </div>
  );
}
