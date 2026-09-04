export default function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="p-8">
      <h1 className="font-display font-semibold text-2xl">{title}</h1>
      <p className="text-sm text-[#6B7A6F] mt-1 mb-6">{blurb}</p>
      <div className="bg-white border border-dashed border-black/15 rounded p-10 text-center text-[#9C9575]">
        Not built yet — next up.
      </div>
    </div>
  );
}
