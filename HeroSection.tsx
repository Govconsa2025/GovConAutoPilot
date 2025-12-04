export default function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl overflow-hidden mb-8">
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/69293d16da4e37bf6ff388b6_1764311014570_13c77723.webp"
          alt="Dashboard"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative px-8 py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
            SDVOSB CERTIFIED
          </div>
          <div className="px-4 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
            SAM.gov INTEGRATED
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Automate Your GovCon Pipeline
        </h1>
        <p className="text-xl text-gray-300 mb-6 max-w-2xl">
          From opportunity discovery to proposal submission, GovCon Autopilot streamlines 
          your entire government contracting workflow with AI-powered automation.
        </p>
        
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            View Active Opportunities
          </button>
          <button className="px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Run New Search
          </button>
        </div>
      </div>
    </div>
  );
}
