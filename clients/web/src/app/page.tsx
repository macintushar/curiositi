export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-800">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-7xl font-extrabold text-white">curiositi</h1>
        <h1 className="font-serif text-3xl text-stone-100">
          Find what you need,{" "}
          <span className="text-stone-100/50 italic">
            anything from anywhere.
          </span>
        </h1>
      </div>
    </main>
  );
}
