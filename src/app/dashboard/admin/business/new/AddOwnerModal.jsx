"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AddOwnerModal({ open, onClose, onCreated }) {
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    // 🔎 Validación extra en frontend antes de enviar
    const password = formData.get("password");
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

    if (!passwordRegex.test(password)) {
      toast.error(
        "La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y un caracter especial."
      );
      return;
    }

    console.log("📝 Valores del formulario:");
    console.log("full_name:", formData.get("full_name"));
    console.log("email:", formData.get("email"));
    console.log("username:", formData.get("username"));
    console.log("password:", password);

    try {
      const res = await fetch("/api/admin/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.get("full_name"),
          email: formData.get("email"),
          username: formData.get("username"),
          password,
        }),
      });

      const rawText = await res.text();
      console.log("📡 Respuesta cruda del servidor:", rawText);

      let result = {};
      try {
        result = rawText ? JSON.parse(rawText) : {};
      } catch (parseErr) {
        console.error("❌ Error parseando JSON:", parseErr);
        toast.error(`El servidor devolvió un error inesperado (${res.status})`);
        return;
      }

      if (res.ok && result.ok) {
        onCreated(result.data);
        toast.success("✅ Owner creado correctamente");
        onClose();
      } else {
        if (res.status === 405) {
          toast.error("❌ Método no permitido (405). Revisa tu route.js");
        } else if (res.status === 409) {
          if (result.error?.includes("username")) {
            toast.error("⚠️ Ese nombre de usuario ya está registrado.");
          } else if (
            result.error?.includes("email") &&
            result.error?.includes("Clerk")
          ) {
            toast.error("⚠️ Ese correo ya está registrado en Clerk.");
          } else if (result.error?.includes("owners")) {
            toast.error("⚠️ Ese Owner ya existe en la base de datos.");
          } else {
            toast.error("⚠️ Ese usuario ya existe.");
          }
        } else {
          toast.error(result.error || `❌ Error creando owner (${res.status})`);
        }
      }
    } catch (err) {
      console.error("❌ Error en handleSubmit:", err);
      toast.error(err.message || "❌ Error de red");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md rounded-lg bg-white p-6 shadow-lg
                   animate-in fade-in-0 zoom-in-95
                   animate-out fade-out-0 zoom-out-95"
      >
        <DialogHeader>
          <DialogTitle>Crear nuevo Owner</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="full_name"
            placeholder="Nombre completo"
            required
            className="w-full rounded border px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded border px-3 py-2"
          />
          <input
            name="username"
            type="text"
            placeholder="Nombre de usuario (3-15 caracteres, solo letras/números/._)"
            pattern="^[a-zA-Z0-9._]{3,15}$"
            minLength={3}
            maxLength={15}
            required
            className="w-full rounded border px-3 py-2"
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña (8+, mayúscula, minúscula, número y caracter especial)"
            minLength={8}
            required
            className="w-full rounded border px-3 py-2"
          />
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
