"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AddOwnerModal({ open, onClose, onCreated }) {
  const [passwordError, setPasswordError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  // 🔑 Generador de contraseñas seguras
  function generatePassword(length = 12) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&._-";
    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pass);
    toast.success(`🔐 Contraseña generada: ${pass}`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const full_name = formData.get("full_name")?.trim();
    const email = formData.get("email")?.trim();
    const username = formData.get("username")?.trim();
    const password = generatedPassword || formData.get("password");

    // ✅ Validaciones básicas en frontend
    if (!full_name) {
      toast.error("⚠️ El nombre completo no puede estar vacío");
      return;
    }
    if (!email) {
      toast.error("⚠️ El email no puede estar vacío");
      return;
    }
    if (!username) {
      toast.error("⚠️ El username no puede estar vacío");
      return;
    }
    if (!password) {
      toast.error("⚠️ La contraseña no puede estar vacía");
      return;
    }

    // Validación de fuerza de contraseña
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

    if (!passwordRegex.test(password)) {
      const msg =
        "La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y un caracter especial.";
      setPasswordError(msg);
      toast.error(msg);
      return;
    } else {
      setPasswordError("");
    }

    // 📌 Log del payload que se enviará al backend
    console.log("📝 Payload enviado:", {
      full_name,
      email,
      username,
      password,
    });

    try {
      const res = await fetch("/api/admin/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, username, password }),
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
        if (result.details) {
          toast.error(`⚠️ ${result.details}`);
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
      <DialogContent className="sm:max-w-md rounded-lg bg-white p-6 shadow-lg">
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
            placeholder="Nombre de usuario (3-15 caracteres)"
            pattern="^[a-zA-Z0-9._]{3,15}$"
            minLength={3}
            maxLength={15}
            required
            className="w-full rounded border px-3 py-2"
          />
          <div className="flex gap-2 items-center">
            <input
              name="password"
              type="text"
              value={generatedPassword}
              onChange={(e) => setGeneratedPassword(e.target.value)}
              placeholder="Contraseña segura"
              minLength={8}
              required
              className={`w-full rounded border px-3 py-2 ${
                passwordError ? "border-red-500" : ""
              }`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => generatePassword(14)}
            >
              Generar
            </Button>
          </div>
          {passwordError && (
            <p className="mt-1 text-sm text-red-600">{passwordError}</p>
          )}
          <Button type="submit" className="w-full">
            Guardar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
