import { auth } from "@clerk/nextjs/server";

export default async function TestAuthPage() {
  const { userId, sessionId } = await auth();

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Prueba de Autenticación</h1>

      {userId ? (
        <div className="rounded bg-green-100 p-4">
          ✅ Usuario autenticado
          <p>
            <strong>User ID:</strong> {userId}
          </p>
          <p>
            <strong>Session ID:</strong> {sessionId}
          </p>
        </div>
      ) : (
        <div className="rounded bg-red-100 p-4">❌ No hay sesión activa</div>
      )}
    </main>
  );
}
