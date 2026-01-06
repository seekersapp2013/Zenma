export function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">Zenma</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Coming Soon</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          We're working hard to bring you something amazing. Stay tuned!
        </p>
        <div className="flex justify-center">
          <div className="animate-pulse flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}