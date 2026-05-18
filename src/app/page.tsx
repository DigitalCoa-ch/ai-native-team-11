export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 flex flex-col items-center justify-center relative overflow-hidden">

      {/* Animated background orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-600 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Main content */}
      <div className="relative z-10 text-center px-6">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/80 text-sm font-medium tracking-wide">Powered by AI Native</span>
        </div>

        {/* Main heading */}
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-indigo-200 mb-6 leading-tight">
          Hello World
        </h1>

        {/* Subheading */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/40" />
          <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/90 tracking-wide">
            Team 11
          </p>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/40" />
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 max-w-xl mx-auto">
          <p className="text-white/70 text-lg sm:text-xl leading-relaxed">
            Welcome to our AI-powered workspace. We're building the future, one iteration at a time.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
    </main>
  );
}