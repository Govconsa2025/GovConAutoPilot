import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from './Sidebar';
import DashboardStats from './DashboardStats';
import FilterBar from './FilterBar';
import OpportunityCard from './OpportunityCard';
import OpportunityDetail from './OpportunityDetail';
import SubcontractorList from './SubcontractorList';
import SettingsPanel from './SettingsPanel';
import PricingEngine from './PricingEngine';
import ProposalBuilder from './ProposalBuilder';
import HeroSection from './HeroSection';
import QuickActions from './QuickActions';
import ActivityFeed from './ActivityFeed';
import { NotificationBell } from './NotificationBell';
import { DocumentLibrary } from './DocumentLibrary';
import { TemplatesLibrary } from './TemplatesLibrary';
import { ProposalEvaluator } from './ProposalEvaluator';
import ProposalComparison from './ProposalComparison';










export default function AppLayout() {
  const [activeView, setActiveView] = useState('dashboard');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [filters, setFilters] = useState({ classification: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('solicitations')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      setOpportunities(data || []);
    } catch (err) {
      console.error('Error loading opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpps = opportunities.filter(opp => {
    if (filters.classification && filters.classification !== 'all' && opp.classification !== filters.classification) return false;
    if (filters.status && filters.status !== 'all' && opp.status !== filters.status) return false;
    if (filters.search && !opp.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    // Contract value filter
    if (filters.minValue !== undefined && opp.estimated_value < filters.minValue) return false;
    if (filters.maxValue !== undefined && opp.estimated_value > filters.maxValue) return false;
    
    // NAICS code filter
    if (filters.naicsCodes && filters.naicsCodes.length > 0) {
      const oppNaics = opp.naics_code || '';
      if (!filters.naicsCodes.some((code: string) => oppNaics.includes(code))) return false;
    }
    
    // Geographic filter (simplified - would need geocoding for production)
    if (filters.zipCode && opp.place_of_performance) {
      const oppZip = opp.place_of_performance.match(/\d{5}/)?.[0];
      if (oppZip && oppZip !== filters.zipCode) {
        // In production, calculate distance using geocoding
        // For now, just check exact match
      }
    }
    
    return true;
  });


  const stats = {
    activeOpportunities: opportunities.length,
    primeOpportunities: opportunities.filter(o => o.classification === 'PRIME').length,
    activeProposals: opportunities.filter(o => o.status === 'proposal_draft').length,
    totalValue: `$${(opportunities.reduce((sum, o) => sum + (o.estimated_value || 0), 0) / 1000000).toFixed(1)}M`
  };

  const [subcontractors, setSubcontractors] = useState<any[]>([]);

  useEffect(() => {
    loadSubcontractors();
  }, []);

  const loadSubcontractors = async () => {
    try {
      const { data, error } = await supabase
        .from('subcontractors')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setSubcontractors(data || []);
    } catch (err) {
      console.error('Error loading subcontractors:', err);
    }
  };

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    if (action === 'search') setActiveView('opportunities');
    if (action === 'proposal') setActiveView('proposals');
    if (action === 'outreach') setActiveView('subcontractors');
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {activeView === 'dashboard' && 'Dashboard Overview'}
                {activeView === 'opportunities' && 'Active Opportunities'}
                {activeView === 'subcontractors' && 'Subcontractor Network'}
                {activeView === 'proposals' && 'Proposal Management'}
                {activeView === 'evaluator' && 'AI Proposal Evaluator'}
                {activeView === 'comparison' && 'Proposal Comparison'}
                {activeView === 'pricing' && 'Pricing Engine'}
                {activeView === 'documents' && 'Document Library'}
                {activeView === 'templates' && 'Document Templates'}
                {activeView === 'settings' && 'System Settings'}
              </h1>

              <p className="text-gray-600">
                {activeView === 'dashboard' && 'Monitor your government contracting pipeline'}
                {activeView === 'opportunities' && `${filteredOpps.length} opportunities in pipeline`}
                {activeView === 'evaluator' && 'AI-powered proposal scoring and compliance checking'}
                {activeView === 'comparison' && 'Compare multiple proposals side-by-side with AI analysis'}
              </p>
            </div>

            <NotificationBell />
          </div>

          {activeView === 'dashboard' && (
            <>
              <HeroSection />
              <QuickActions onAction={handleQuickAction} />
              <DashboardStats stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Opportunities</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {opportunities.slice(0, 4).map(opp => (
                        <OpportunityCard 
                          key={opp.id} 
                          opportunity={opp} 
                          onClick={() => setSelectedOpp(opp)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <ActivityFeed />
                </div>
              </div>
            </>
          )}

          {activeView === 'opportunities' && (
            <>
              <FilterBar filters={filters} onFilterChange={setFilters} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOpps.map(opp => (
                  <OpportunityCard 
                    key={opp.id} 
                    opportunity={opp} 
                    onClick={() => setSelectedOpp(opp)}
                  />
                ))}
              </div>
            </>
          )}

          {activeView === 'subcontractors' && (
            <SubcontractorList subcontractors={subcontractors} />
          )}

          {activeView === 'proposals' && <ProposalBuilder />}

          {activeView === 'evaluator' && <ProposalEvaluator />}

          {activeView === 'comparison' && <ProposalComparison />}

          {activeView === 'pricing' && <PricingEngine />}

          {activeView === 'documents' && <DocumentLibrary />}

          {activeView === 'templates' && <TemplatesLibrary />}

          {activeView === 'settings' && <SettingsPanel />}




        </div>
      </div>


      {selectedOpp && (
        <OpportunityDetail 
          opportunity={selectedOpp} 
          onClose={() => setSelectedOpp(null)}
        />
      )}
    </div>
  );
}
