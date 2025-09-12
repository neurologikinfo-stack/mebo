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

    const full_name = formData.get("full_name")?.trim();
    const email = formData.get("email")?.trim();

    console.log("📝 Payload enviado:", { full_name, email });

    if (!full_name || !email) {
      toast.error("⚠️ Debes ingresar nombre completo y email");
      return;
    }

    try {
      const res = await fetch("/api/admin/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email }), // 👈 ambos campos
      });

      const rawText = await res.text();
      console.log("📡 Respuesta cruda del servidor:", rawText);

      let result = {};
      try {
        result = rawText ? JSON.parse(rawText) : {};
      } catch {
        toast.error(`El servidor devolvió un error inesperado (${res.status})`);
        return;
      }

      if (res.ok && result.ok) {
        onCreated(result.data);
        toast.success("✅ Invitación enviada correctamente");
        onClose();
      } else {
        toast.error(
          result.details || result.error || `❌ Error (${res.status})`
        );
      }
    } catch (err) {
      toast.error(err.message || "❌ Error de red");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-lg bg-white p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle>Invitar nuevo Owner</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="full_name"
            type="text"
            placeholder="Nombre completo"
            required
            className="w-full rounded border px-3 py-2 text-black"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded border px-3 py-2 text-black"
          />

          <Button type="submit" className="w-full">
            Enviar invitación
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
