import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MapPin, 
  ArrowUpRight, Building2, ChevronRight,
  TrendingUp, Star
} from 'lucide-react';
import api from '../../api';
import ListSkeleton from '../../components/skeletons/ListSkeleton';
import CompanyScorecard from '../../components/CompanyScorecard';
import { motion } from 'framer-motion';

const ExploreCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies/list');
        setCompanies(res.data);
      } catch (err) {
        console.error('Failed to fetch companies', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <ListSkeleton />;

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#000613] rounded-[40px] p-10 md:p-16 text-white group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
              Company Intelligence
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6">
            Explore Your <span className="text-blue-500 italic">Future</span> Partners.
          </h1>
          <p className="text-blue-200/60 font-bold text-lg md:text-xl leading-relaxed">
            Data-driven scorecards based on real student experiences and actual hiring history at {companies.length} industry leaders.
          </p>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 focus:border-blue-200 rounded-[28px] font-bold text-[15px] outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-8 px-8 py-4 bg-white border border-gray-50 rounded-[28px] shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Logos</span>
            <span className="text-[20px] font-black">{companies.length}</span>
          </div>
          <div className="w-px bg-gray-100"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified</span>
            <span className="text-[20px] font-black">100%</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCompanies.map((company) => (
          <motion.div 
            key={company.name}
            whileHover={{ y: -8 }}
            className="bg-white border border-gray-100 rounded-[32px] p-8 group relative hover:border-blue-100 transition-all shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 p-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
              </div>
              <button 
                onClick={() => setSelectedCompany(company.name)}
                className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
              >
                <ArrowUpRight size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-black tracking-tight text-gray-900">{company.name}</h3>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Opportunities</span>
                  <span className="text-[15px] font-black flex items-center gap-1.5 mt-0.5">
                    <Building2 size={14} className="text-blue-500" /> {company.jobCount}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rating</span>
                  <span className="text-[15px] font-black flex items-center gap-1.5 mt-0.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" /> 4.8
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedCompany(company.name)}
              className="mt-8 w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-[11px] uppercase tracking-widest group-hover:bg-[#000613] group-hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Analyze Scorecard <ChevronRight size={14} />
            </button>
          </motion.div>
        ))}

        {filteredCompanies.length === 0 && (
          <div className="col-span-full py-32 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
            <Building2 className="mx-auto text-gray-300 mb-6" size={60} />
            <p className="text-xl font-black text-gray-400 uppercase tracking-widest">No matching companies found</p>
          </div>
        )}
      </div>

      {/* Scorecard Modal */}
      {selectedCompany && (
        <CompanyScorecard 
          companyName={selectedCompany} 
          onClose={() => setSelectedCompany(null)} 
        />
      )}
    </div>
  );
};

export default ExploreCompanies;
