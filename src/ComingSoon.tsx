export function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff0f8] to-indigo-100">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-[#ff1493] mb-4">Zenma</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Coming Soon</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          We're working hard to bring you something amazing. Stay tuned!
        </p>
        <div className="flex justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="w-3 h-3 bg-[#ff1493] rounded-full"></div>
            <div className="w-3 h-3 bg-[#ff1493] rounded-full"></div>
            <div className="w-3 h-3 bg-[#ff1493] rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}