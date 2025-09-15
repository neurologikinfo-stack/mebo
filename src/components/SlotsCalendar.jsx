"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function SlotsCalendar({ slots, onSelect }) {
  // Transformamos los slots en eventos para el calendario
  const events = slots.map((s) => ({
    start: new Date(s.slot_start),
    end: new Date(s.slot_end),
    title: s.status === "booked" ? "Ocupado" : "Disponible",
    status: s.status || "available", // 👈 por si viene de Supabase con campo status
    allDay: false,
  }));

  return (
    <div className="h-[600px] bg-white dark:bg-gray-900 rounded-xl shadow border p-3">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="day"
        views={["day", "week"]}
        style={{ height: "100%" }}
        selectable
        onSelectEvent={(event) => {
          if (event.status !== "booked") {
            onSelect(event);
          }
        }}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
        }}
        eventPropGetter={(event) => {
          let bg = "#2563eb"; // azul por defecto
          if (event.status === "booked") {
            bg = "#9ca3af"; // gris Tailwind
          }
          return {
            style: {
              backgroundColor: bg,
              color: "white",
              borderRadius: "6px",
              border: "none",
              padding: "2px 6px",
              fontSize: "0.85rem",
              cursor: event.status === "booked" ? "not-allowed" : "pointer",
              opacity: event.status === "booked" ? 0.6 : 1,
            },
          };
        }}
      />
    </div>
  );
}
