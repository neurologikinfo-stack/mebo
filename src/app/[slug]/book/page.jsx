"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/utils/supabase/client";
import { CalendarDays, CheckCircle, XCircle } from "lucide-react";
import SlotsCalendar from "@/components/SlotsCalendar"; // 👈 calendario pro

export default function BookPage() {
  const { slug } = useParams();
  const { user } = useUser();

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

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // 🔹 Cargar negocio, servicios y staff
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

    // 🔹 Buscar cliente existente
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
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {/* Encabezado */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Reserva en {biz.name}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Completa los pasos para agendar tu cita
      </p>

      {/* Mensajes */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Selecciones */}
      <div className="grid gap-4 md:grid-cols-2">
        <select
          className="border p-3 rounded-lg"
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
          className="border p-3 rounded-lg"
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
          className="border p-3 rounded-lg md:col-span-2"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white rounded-lg p-3 font-medium flex items-center justify-center gap-2 hover:bg-blue-500 transition md:col-span-2"
          onClick={fetchSlots}
          disabled={loadingSlots}
        >
          <CalendarDays className="h-5 w-5" />
          {loadingSlots ? "Cargando horarios..." : "Ver horarios disponibles"}
        </button>
      </div>

      {/* Datos del cliente */}
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tus datos
        </h2>
        <input
          type="text"
          placeholder="Nombre completo"
          className="w-full border rounded-lg p-3"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Teléfono (opcional)"
          className="w-full border rounded-lg p-3"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email (opcional)"
          className="w-full border rounded-lg p-3"
          value={customer.email}
          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
        />
      </div>

      {/* Calendario de slots */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          Horarios disponibles
        </h2>
        {slots.length > 0 ? (
          <SlotsCalendar
            slots={slots}
            onSelect={(event) =>
              book({ slot_start: event.start, slot_end: event.end })
            }
          />
        ) : (
          !loadingSlots && (
            <p className="text-sm text-gray-500">
              No hay horarios para esa fecha.
            </p>
          )
        )}
      </div>
    </div>
  );
}
