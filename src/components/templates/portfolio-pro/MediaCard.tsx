import { dateParts } from "./theme";

// Shared card shape for Courses/Certificates and Projects/Case Studies —
// pill + date-pill header, title (+optional description), image thumbnail.
export function MediaCard({
  pillLabel,
  date,
  title,
  titleClassName = "",
  description,
  imageUrl,
  isDark,
  isGrid,
  onClick,
}: {
  pillLabel?: string;
  date?: string;
  title: string;
  titleClassName?: string;
  description?: string;
  imageUrl?: string;
  isDark: boolean;
  isGrid: boolean;
  onClick: () => void;
}) {
  const dp = dateParts(date);
  return (
    <div
      onClick={onClick}
      className={`group relative flex ${isGrid ? "w-full" : "w-[290px] shrink-0 sm:w-[340px]"} h-[420px] cursor-pointer flex-col overflow-hidden rounded-[2rem] border shadow-md transition-all duration-300 hover:-translate-y-1.5 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"}`}
    >
      <div className="flex h-full w-full flex-col justify-between px-6 pt-6 pb-4 text-left">
        <div className="flex w-full items-center justify-between">
          {pillLabel && (
            <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wide shadow-sm sm:text-[11px] ${isDark ? "bg-white text-slate-900" : "bg-slate-900 text-white"}`}>
              {pillLabel}
            </span>
          )}
          {dp && (
            <div className={`flex h-7 items-center overflow-hidden rounded-lg border text-[10px] font-bold shadow-inner ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-100"}`}>
              <span className="flex h-full items-center justify-center bg-slate-800 px-2.5 text-white">{dp.month}</span>
              <span className={`flex h-full items-center justify-center px-2.5 ${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-800"}`}>{dp.year}</span>
            </div>
          )}
        </div>
        <div className="mt-8 mb-7 flex-1">
          <h3 className={`text-lg leading-tight font-bold tracking-tight sm:text-xl ${titleClassName} ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
          {description && <p className={`mt-2 line-clamp-3 text-xs leading-relaxed sm:text-[13px] ${isDark ? "text-gray-400" : "text-slate-500"}`}>{description}</p>}
        </div>
        <div className="mt-auto w-full" style={{ position: "relative", top: "-18px" }}>
          <div className={`relative h-[180px] w-full overflow-hidden rounded-[1.5rem] border shadow-sm ${isDark ? "border-white/10" : "border-slate-200"}`}>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={title} className="h-full w-full object-cover object-top" />
            ) : (
              <div className={`flex h-full w-full items-center justify-center ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
