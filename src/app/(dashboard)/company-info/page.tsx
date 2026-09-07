import { db } from "@/db";
import { companyInfo } from "@/db/schema";
import CompanyInfoForm from "@/components/CompanyInfoForm";

export default async function CompanyInfoPage() {
  const info = db.select().from(companyInfo).get();

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl">Company info</h1>
        <p className="text-sm text-[#6B7A6F]">
          Phone, WhatsApp, email, social links and founder name — shown across the public site and its structured data.
        </p>
      </div>

      {info ? (
        <CompanyInfoForm info={info} />
      ) : (
        <div className="bg-white border border-dashed border-black/15 rounded p-10 text-center text-[#9C9575]">
          No company info row exists yet.
        </div>
      )}
    </div>
  );
}
