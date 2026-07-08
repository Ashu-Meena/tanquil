export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FAF8F5]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-10 h-10 border-[3px] border-[#EFEFEF] border-t-[#C7A17A] rounded-full animate-spin"></div>
        <p className="font-serif text-sm tracking-[0.3em] uppercase text-[#111111]">Tranquil</p>
      </div>
    </div>
  );
}
