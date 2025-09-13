-- 🚀 Initial Schema for project "mebo"
-- Fecha: 2025-09-13

-- ============================
-- Tabla: profiles
-- ============================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_orphan boolean DEFAULT false,
  avatar_url text,
  role text,
  clerk_id text UNIQUE,
  email text,
  full_name text,
  phone text             -- 👈 NUEVO CAMPO
);


-- ============================
-- Tabla: owners
-- ============================
CREATE TABLE IF NOT EXISTS public.owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE,
  status text,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- Tabla: businesses
-- ============================
CREATE TABLE IF NOT EXISTS public.businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- Tabla: customers
-- ============================
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text UNIQUE,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- Tabla: appointments
-- ============================
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  date timestamptz NOT NULL,
  notes text,
  status text DEFAULT 'pending'
);

-- ============================
-- Tabla: staff
-- ============================
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  full_name text,
  role text,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- Tabla: services
-- ============================
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.businesses(id) ON DELETE CASCADE,
  name text,
  description text,
  price numeric,
  created_at timestamptz DEFAULT now()
);

-- ============================
-- Tabla: schedules
-- ============================
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week int,
  start_time time,
  end_time time
);

-- ============================
-- Tabla: roles
-- ============================
CREATE TABLE IF NOT EXISTS public.roles (
  id serial PRIMARY KEY,
  name text UNIQUE
);

-- ============================
-- Tabla: role_changes
-- ============================
CREATE TABLE IF NOT EXISTS public.role_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id),
  old_role text,
  new_role text,
  changed_at timestamptz DEFAULT now()
);

-- ============================
-- Vista: view_user_roles
-- ============================
CREATE OR REPLACE VIEW public.view_user_roles AS
SELECT
  p.id AS profile_id,
  p.full_name,
  p.email,
  p.role
FROM public.profiles p;

-- ============================
-- Vista: view_owners_status
-- ============================
CREATE OR REPLACE VIEW public.view_owners_status
WITH (security_invoker = on) AS
SELECT
  o.id,
  o.full_name,
  o.email,
  o.status,
  o.created_at
FROM public.owners o;
