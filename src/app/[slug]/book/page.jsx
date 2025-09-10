"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // 👈 importamos Clerk
import { supabase } from "@/utils/supabase/client";

export default function BookPage() {
  const { slug } = useParams();
  const { user } = useUser(); // 👈 usuario de Clerk

  const [biz, setBiz] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState(null);

  // datos del cliente (relleno manual si no hay Clerk)
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // cargar negocio, servicios y staff
  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: b } = await supabase
        .from("businesses")
        .select("*")
        .eq("slug", slug)
        .single();
      if (!b) return;
      setBiz(b);

      const [{ data: serv }, { data: stf }] = await Promise.all([
        supabase.from("services").select("*").eq("business_id", b.id),
        supabase.from("staff").select("id,name").eq("business_id", b.id),
      ]);
      setServices(serv ?? []);
      setStaff(stf ?? []);
    })();
  }, [slug]);

  async function fetchSlots() {
    if (!biz || !serviceId || !staffId || !date) return;
    setLoadingSlots(true);
    setMessage(null);
    const { data, error } = await supabase.rpc("get_available_slots", {
      p_business: biz.id,
      p_staff: staffId,
      p_service: serviceId,
      p_date: date,
      p_tz: biz.time_zone,
    });
    if (error) {
      console.error(error);
      setMessage({ type: "error", text: "Error cargando horarios" });
    }
    setSlots(data ?? []);
    setLoadingSlots(false);
  }

  async function book(slot) {
    if (!biz || !serviceId || !staffId || !customer.name) {
      return setMessage({
        type: "error",
        text: "Completa todos los campos requeridos",
      });
    }

    setBooking(true);
    setMessage(null);

    let c = null;

    // 👇 Buscar cliente existente por Clerk ID o email
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .or(
        `clerk_id.eq.${user?.id},email.eq.${
          user?.primaryEmailAddress?.emailAddress || customer.email
        }`
      )
      .eq("business_id", biz.id)
      .maybeSingle();

    if (existing) {
      c = existing;
    } else {
      // 👇 Crear customer nuevo vinculado con Clerk
      const { data: created, error: ce } = await supabase
        .from("customers")
        .insert({
          business_id: biz.id,
          name: customer.name,
          phone: customer.phone || null,
          email:
            user?.primaryEmailAddress?.emailAddress || customer.email || null,
          clerk_id: user?.id || null,
        })
        .select("id")
        .single();

      if (ce) {
        setBooking(false);
        return setMessage({ type: "error", text: "Error creando cliente" });
      }
      c = created;
    }

    // 👇 Insertar cita
    const { error: apptErr } = await supabase.from("appointments").insert({
      business_id: biz.id,
      staff_id: staffId,
      customer_id: c.id,
      service_id: serviceId,
      starts_at: slot.slot_start,
      ends_at: slot.slot_end,
      status: "confirmed",
    });

    setBooking(false);

    if (apptErr) {
      console.error(apptErr);
      return setMessage({ type: "error", text: "Error al reservar cita" });
    }

    setMessage({ type: "success", text: "¡Cita confirmada con éxito!" });
  }

  if (!biz) return <div className="p-6">Cargando negocio…</div>;

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{biz.name}</h1>

      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Selecciones */}
      <div className="grid gap-3">
        <select
          className="border p-2 rounded"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
        >
          <option value="">Selecciona un servicio</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {s.duration_min} min
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
        >
          <option value="">Selecciona técnico</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          className="border p-2 rounded"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          className="bg-black text-white rounded p-2 disabled:opacity-50 hover:bg-gray-800 transition"
          onClick={fetchSlots}
          disabled={loadingSlots}
        >
          {loadingSlots ? "Cargando..." : "Ver horarios"}
        </button>
      </div>

      {/* Formulario cliente */}
      <div className="p-4 border rounded bg-gray-50 space-y-3">
        <h2 className="text-lg font-medium text-gray-700">Tus datos</h2>
        <input
          type="text"
          placeholder="Nombre completo"
          className="w-full border rounded p-2"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Teléfono (opcional)"
          className="w-full border rounded p-2"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email (opcional)"
          className="w-full border rounded p-2"
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
        />
      </div>

      {/* Slots disponibles */}
      <div>
        <h2 className="text-lg font-medium mb-2">Horarios disponibles</h2>
        <div className="grid grid-cols-2 gap-2">
          {slots.map((s, i) => (
            <button
              key={i}
              disabled={booking}
              className="border rounded p-2 hover:bg-blue-100 disabled:opacity-50"
              onClick={() => book(s)}
            >
              {new Date(s.slot_start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {new Date(s.slot_end).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </button>
          ))}
          {slots.length === 0 && !loadingSlots && (
            <p className="text-sm text-gray-500">
              No hay horarios para esa fecha.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
