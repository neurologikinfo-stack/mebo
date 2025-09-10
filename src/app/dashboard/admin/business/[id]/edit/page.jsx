import { supabaseServer } from "@/utils/supabase/server";
import { updateBusiness, deleteBusiness } from "../../actions";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EditBusinessPage({ params }) {
  const supabase = supabaseServer();
  const { id } = params;

  const { data: b, error } = await supabase
    .from("businesses")
    .select("id,name,slug,phone,email,description")
    .eq("id", id)
    .single();

  if (error || !b) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-semibold">Negocio no encontrado</h1>
      </main>
    );
  }

  async function action(formData) {
    "use server";
    const res = await updateBusiness(b.id, formData);
    if (!res.ok) return { error: res.error };
    redirect("/dashboard/admin/business"); // ✅ corregido a singular
  }

  async function remove() {
    "use server";
    const res = await deleteBusiness(b.id);
    if (!res.ok) return { error: res.error };
    redirect("/dashboard/admin/business"); // ✅ corregido a singular
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Editar negocio</h1>

      <form action={action} className="space-y-3">
        <Field name="name" label="Nombre" defaultValue={b.name} required />
        <Field name="slug" label="Slug" defaultValue={b.slug} required />
        <Field name="phone" label="Teléfono" defaultValue={b.phone || ""} />
        <Field
          name="email"
          label="Email"
          type="email"
          defaultValue={b.email || ""}
        />
        <Textarea
          name="description"
          label="Descripción"
          rows={4}
          defaultValue={b.description || ""}
        />

        <div className="flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-white">
            Guardar
          </button>
          <Link
            href="/dashboard/admin/business"
            className="rounded border px-4 py-2"
          >
            Cancelar
          </Link>
          <button
            formAction={remove}
            className="rounded border px-4 py-2 text-red-600 border-red-300"
          >
            Eliminar
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({ label, name, type = "text", required, hint, defaultValue }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded border px-3 py-2"
      />
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </label>
  );
}

function Textarea({ label, name, rows = 3, defaultValue }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded border px-3 py-2"
      />
    </label>
  );
}
