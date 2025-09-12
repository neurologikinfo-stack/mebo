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

  // 🔑 Generador de contraseñas seguras garantizadas
  function generatePassword(length = 12) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "@$!%*?&._-"; // 👈 sin coma ni espacios

    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    const all = upper + lower + numbers + symbols;
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Mezclar para no dejar los obligatorios al inicio
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setGeneratedPassword(password);
    toast.success(`🔐 Contraseña generada: ${password}`);
  }

  // 🔍 Función describe como en el backend
  function describe(value) {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "string") {
      return `"${value}" (string, len=${value.length})`;
    }
    return `${value} (${typeof value})`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const full_name = formData.get("full_name")?.trim();
    const email = formData.get("email")?.trim();
    const username = formData.get("username")?.trim();
    const password = generatedPassword || formData.get("password");

    // 📌 Log detallado del payload antes de enviar
    console.log("📝 Payload enviado (detallado):", {
      full_name: describe(full_name),
      email: describe(email),
      username: describe(username),
      password: describe(password),
    });

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

  // 📋 Copiar contraseña al portapapeles
  function copyPassword() {
    if (!generatedPassword) {
      toast.error("⚠️ No hay contraseña generada");
      return;
    }
    navigator.clipboard.writeText(generatedPassword);
    toast.success("📋 Contraseña copiada al portapapeles");
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
            <Button type="button" variant="outline" onClick={copyPassword}>
              Copiar
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
