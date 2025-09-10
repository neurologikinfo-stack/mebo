"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../utils/supabase/client";

export default function PublicAppointmentPage() {
  const { token } = useParams();

  // Datos actuales de la cita
  const [appt, setAppt] = useState(null);
  const [biz, setBiz] = useState(null);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState(null);

  // UI/estado
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Reprogramación
  const [newDate, setNewDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [slots, setSlots] = useState([]);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(-1);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // ===== formatters en la TZ del negocio =====
  const fmtDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: biz?.time_zone || "UTC",
      }),
    [biz?.time_zone]
  );

  const fmtTime = useMemo(
    () =>
      new Intl.DateTimeFormat([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: biz?.time_zone || "UTC",
      }),
    [biz?.time_zone]
  );

  // ===== CARGA INICIAL =====
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      setErr("");

      // Traer cita por token
      const { data: a, error } = await supabase
        .from("appointments")
        .select(
          `
          id, starts_at, ends_at, status, public_token,
          business_id, service_id, staff_id,
          customers ( name, phone, email )
        `
        )
        .eq("public_token", token)
        .single();

      if (error || !a) {
        setErr("No se encontró la cita.");
        setLoading(false);
        return;
      }
      setAppt(a);

      // Extras para el RPC
      const [{ data: b }, { data: s }, { data: st }] = await Promise.all([
        supabase
          .from("businesses")
          .select("id, name, phone, email, time_zone")
          .eq("id", a.business_id)
          .single(),
        supabase
          .from("services")
          .select("id, name, duration_min")
          .eq("id", a.service_id)
          .single(),
        supabase.from("staff").select("id, name").eq("id", a.staff_id).single(),
      ]);

      setBiz(b || null);
      setService(s || null);
      setStaff(st || null);
      setLoading(false);
    })();
  }, [token]);

  // ===== CANCELAR =====
  async function cancelAppt() {
    if (!token) return;
    if (!confirm("¿Seguro que deseas cancelar la cita?")) return;

    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("public_token", token)
      .select("id, status")
      .single();

    if (error) {
      alert("No se pudo cancelar: " + error.message);
      return;
    }
    setAppt((prev) => (prev ? { ...prev, status: data.status } : prev));
    alert("Cita cancelada ✅");
  }

  // ===== OBTENER SLOTS PARA REPROGRAMAR =====
  async function loadSlots() {
    if (!biz || !service || !staff || !newDate) return;
    setSlotsLoading(true);
    setSelectedSlotIdx(-1);
    const { data, error } = await supabase.rpc("get_available_slots", {
      p_business: biz.id,
      p_staff: staff.id,
      p_service: service.id,
      p_date: newDate, // 'YYYY-MM-DD'
      p_tz: biz.time_zone, // <- TZ del negocio
    });
    setSlotsLoading(false);
    if (error) {
      console.error(error);
      alert("No se pudieron cargar los horarios.");
      return;
    }
    const arr = data ?? [];
    setSlots(arr);
    setSelectedSlotIdx(arr.length > 0 ? 0 : -1);
  }

  // ===== CONFIRMAR REPROGRAMACIÓN =====
  async function reschedule(slot) {
    if (!appt || !slot) return;
    if (appt.status === "cancelled") {
      alert("Esta cita ya fue cancelada.");
      return;
    }

    const whenTxt = fmtDateTime.format(new Date(slot.slot_start));
    if (!confirm(`Confirmar nueva hora:\n${whenTxt}`)) return;

    const { data, error } = await supabase
      .from("appointments")
      .update({
        starts_at: slot.slot_start, // ISO UTC del RPC
        ends_at: slot.slot_end,
        status: "confirmed",
      })
      .eq("id", appt.id)
      .select("id, starts_at, ends_at, status")
      .single();

    if (error) {
      alert("No se pudo reprogramar: " + error.message);
      return;
    }

    setAppt((prev) =>
      prev
        ? {
            ...prev,
            starts_at: data.starts_at,
            ends_at: data.ends_at,
            status: data.status,
          }
        : prev
    );
    alert("Cita reprogramada ✅");
  }

  function handleConfirmReschedule() {
    if (selectedSlotIdx < 0 || !slots[selectedSlotIdx]) {
      alert("Selecciona un horario disponible.");
      return;
    }
    reschedule(slots[selectedSlotIdx]);
  }

  if (loading) return <div className="p-6">Cargando…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!appt) return null;

  const startLocal = fmtDateTime.format(new Date(appt.starts_at));
  const endLocal = fmtTime.format(new Date(appt.ends_at));

  return (
    <div className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Tu cita</h1>

      <div className="rounded border p-4 space-y-1">
        <p>
          <b>Negocio:</b> {biz?.name}
        </p>
        <p>
          <b>Servicio:</b> {service?.name} ({service?.duration_min} min)
        </p>
        <p>
          <b>Técnico:</b> {staff?.name}
        </p>
        <p>
          <b>Fecha:</b> {startLocal} — {endLocal}
        </p>
        <p>
          <b>Estado:</b> {appt.status}
        </p>
        <p>
          <b>Contacto:</b> {biz?.phone} · {biz?.email}
        </p>
      </div>

      {appt.status !== "cancelled" ? (
        <>
          <div className="flex gap-2">
            <button
              onClick={cancelAppt}
              className="bg-red-600 text-white rounded px-3 py-2"
            >
              Cancelar cita
            </button>
          </div>

          {/* ======= Reprogramar (desplegable) ======= */}
          <details className="group rounded border p-4">
            <summary className="flex items-center justify-between cursor-pointer select-none font-semibold outline-none focus:ring-2 focus:ring-black/20 rounded">
              <span>Reprogramar</span>
              {/* Flecha que rota al abrir */}
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 transition-transform duration-200 group-open:rotate-90"
                aria-hidden="true"
              >
                <path d="M7 5l6 5-6 5V5z" />
              </svg>
            </summary>

            <div className="mt-3 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="border p-2 rounded"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <button
                  className="bg-black text-white rounded px-3 py-2 disabled:opacity-50"
                  onClick={loadSlots}
                  disabled={slotsLoading}
                >
                  {slotsLoading ? "Cargando…" : "Ver horarios"}
                </button>
              </div>

              {/* Dropdown de horarios */}
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <select
                  className="border rounded p-2 min-w-60"
                  value={selectedSlotIdx}
                  onChange={(e) => setSelectedSlotIdx(parseInt(e.target.value))}
                >
                  <option value={-1} disabled>
                    {slots.length ? "Elige un horario" : "Sin horarios"}
                  </option>
                  {slots.map((s, i) => (
                    <option key={i} value={i}>
                      {fmtTime.format(new Date(s.slot_start))} –{" "}
                      {fmtTime.format(new Date(s.slot_end))}
                    </option>
                  ))}
                </select>

                <button
                  className="bg-emerald-600 text-white rounded px-3 py-2 disabled:opacity-50"
                  onClick={handleConfirmReschedule}
                  disabled={selectedSlotIdx < 0}
                >
                  Confirmar
                </button>
              </div>

              {slots.length === 0 && (
                <p className="text-sm text-gray-500">
                  No hay horarios para esa fecha.
                </p>
              )}
            </div>
          </details>
        </>
      ) : (
        <p className="text-sm text-gray-600">Esta cita ya fue cancelada.</p>
      )}
    </div>
  );
}
