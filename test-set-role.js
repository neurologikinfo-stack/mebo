// test-set-role.js

const CLERK_API_KEY = process.env.CLERK_API_KEY; // ⚡ tu Server API Key
const CLERK_USER_ID = "user_32L4NaJdJfeXzlru4KBIgOMnkYd"; // 🔑 reemplaza con un ID real de Clerk
const NEW_ROLE = "admin"; // 🔑 rol que quieras probar

async function updateRole() {
  try {
    const res = await fetch(`https://api.clerk.dev/v1/users/${CLERK_USER_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${CLERK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: { role: NEW_ROLE },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Error:", data);
    } else {
      console.log("✅ Usuario actualizado en Clerk:");
      console.log(JSON.stringify(data.public_metadata, null, 2));
    }
  } catch (err) {
    console.error("❌ Error general:", err);
  }
}

updateRole();
