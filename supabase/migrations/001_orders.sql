create table public.orders (
  id               uuid default gen_random_uuid() primary key,
  created_at       timestamp with time zone default now(),
  nama_bisnes      text not null,
  tagline          text,
  jenis_bisnes     text,
  produk_servis    text not null,
  target_pelanggan text,
  nama_owner       text not null,
  whatsapp         text not null,
  telefon          text not null,
  email            text,
  alamat           text not null,
  waktu_operasi    text not null,
  google_maps_link text,
  instagram        text,
  facebook         text,
  tiktok           text,
  banner_atas_url  text not null,
  logo_url         text,
  gallery_urls     text[],
  template_pilihan text not null,
  domain_sendiri   boolean default false,
  domain_url       text,
  domain_pref_1    text,
  domain_pref_2    text,
  domain_pref_3    text,
  catatan          text,
  status           text default 'pending',
  slug             text unique,
  preview_url      text,
  live_url         text,
  toyyibpay_bill_code text,
  payment_ref      text,
  paid_at          timestamp with time zone,
  revision_count   integer default 0
);

grant insert on public.orders to anon;
grant select, insert, update on public.orders to authenticated;
grant select, insert, update, delete on public.orders to service_role;

alter table public.orders enable row level security;

create policy "anon can submit order"
  on public.orders for insert to anon
  with check (true);

create policy "authenticated can manage orders"
  on public.orders for all to authenticated
  using (true)
  with check (true);
