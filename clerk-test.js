import "dotenv/config";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error("❌ No se encontró CLERK_SECRET_KEY en .env.local");
  process.exit(1);
}

const url = "https://api.clerk.dev/v1/users"; // 👈 usar siempre api.clerk.dev

const payload = {
  email_address: `test+${Date.now()}@gmail.com`,
  password: "ClerkTest123!",
};

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${CLERK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const data = await res.json();
console.log("📡 Clerk response:", JSON.stringify(data, null, 2));
