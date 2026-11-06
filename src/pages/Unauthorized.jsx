export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-slate-100">

      <div className="bg-white shadow-2xl rounded-3xl p-8 max-w-md w-full text-center">

        {/* Icon */}
        <div className="text-red-500 text-6xl mb-4">
          ❌
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-gray-500 mb-6">
          You don’t have permission to view this page.
        </p>

        {/* Button */}
        <button
          onClick={() => window.history.back()}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition"
        >
          Go Back
        </button>

      </div>
    </div>
  );
}