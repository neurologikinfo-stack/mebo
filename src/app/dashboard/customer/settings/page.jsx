"use client";

export default function CustomerSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
      <p className="text-muted-foreground">
        Aquí podrás personalizar tus preferencias, actualizar información y
        configurar notificaciones.
      </p>

      <div className="p-6 bg-card text-card-foreground rounded-xl shadow border border-border space-y-4">
        <h2 className="text-lg font-semibold">Opciones</h2>
        <ul className="list-disc list-inside text-muted-foreground">
          <li>Cambiar idioma</li>
          <li>Preferencias de notificación</li>
          <li>Actualizar contraseña</li>
          <li>Eliminar cuenta</li>
        </ul>
      </div>
    </div>
  );
}
