import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NavLink from "@/components/NavLink";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase.from("staff").select("name, role").eq("id", user.id).single();

  const [enquiries, driving, permits, lodges, journalDrafts, workshop] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("stage", "enquiry"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("stage", "driving"),
    supabase.from("permits").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("lodge_bookings").select("id", { count: "exact", head: true }).neq("status", "confirmed"),
    supabase.from("journal_posts").select("id", { count: "exact", head: true }).is("published_at", null),
    supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("status", "in_workshop"),
  ]);

  const initials = (staff?.name ?? user.email ?? "?")
    .split(/\s+/)
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid grid-cols-[226px_1fr] h-screen overflow-hidden font-sans">
      <aside className="bg-[#1E3A2B] text-[#EFE7D2] flex flex-col p-3 gap-4 overflow-y-auto">
        <div className="flex items-center gap-2.5 px-1.5">
          <div className="w-[30px] h-[30px] rounded-full bg-[#C99A34] flex items-center justify-center font-display font-bold text-[16px] text-[#1E3A2B] shrink-0">
            G
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold tracking-tight text-[16px]">Golden Tai</div>
            <div className="text-[8.5px] tracking-[0.18em] text-[#8FA88B] uppercase font-mono">Operations</div>
          </div>
        </div>

        <nav className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 text-[10px] tracking-[0.18em] uppercase text-[#6E8A6C] font-mono mb-1">Sell</span>
            <NavLink href="/pipeline" label="Pipeline" />
            <NavLink href="/enquiries" label="Enquiries" badge={enquiries.count ?? 0} />
            <NavLink href="/payments" label="Payments & invoices" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 text-[10px] tracking-[0.18em] uppercase text-[#6E8A6C] font-mono mb-1">Run</span>
            <NavLink href="/on-the-road" label="On the road" badge={driving.count ?? 0} />
            <NavLink href="/fleet-calendar" label="Fleet calendar" />
            <NavLink href="/permits" label="Permits" badge={permits.count ?? 0} />
            <NavLink href="/lodge-bookings" label="Lodge bookings" badge={lodges.count ?? 0} />
            <NavLink href="/traveller-docs" label="Traveller docs" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="px-2.5 text-[10px] tracking-[0.18em] uppercase text-[#6E8A6C] font-mono mb-1">Site</span>
            <NavLink href="/journal" label="Journal" badge={journalDrafts.count ?? 0} />
            <NavLink href="/routes" label="Routes & pricing" />
            <NavLink href="/fleet" label="Fleet data" badge={workshop.count ?? 0} />
            <NavLink href="/overview" label="Overview" />
          </div>
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="rounded bg-[#173023] p-2.5 text-[12px] flex flex-col gap-1">
            <span className="text-[10px] tracking-[0.14em] uppercase text-[#8FA88B] font-mono">24/7 line</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5FA86B] inline-block" />
              On shift
            </span>
          </div>
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-[#33513F] flex items-center justify-center text-[12px] font-semibold shrink-0">
              {initials}
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-[13px] font-medium truncate">{staff?.name ?? user.email}</div>
              <div className="text-[11px] text-[#8FA88B] truncate">{staff?.role ?? "Team"}</div>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      <main className="overflow-y-auto bg-[#F7F1E3]">{children}</main>
    </div>
  );
}
