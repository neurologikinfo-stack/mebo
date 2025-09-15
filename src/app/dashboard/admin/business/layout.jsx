import BusinessHeader from '@/components/admin/BusinessHeader'

export default function BusinessesLayout({ children }) {
  return (
    <div className="w-full">
      {/* Encabezado de la sección Negocios */}
      <BusinessHeader />

      {/* Contenido dinámico de la sección */}
      <div>{children}</div>
    </div>
  )
}
