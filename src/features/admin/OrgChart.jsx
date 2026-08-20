import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../context/AdminContext';
import { 
  Building2, 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Maximize, 
  Minimize,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';
import { cn } from '../../utils/cn';

// Recursive Node Component
// Recursive Node Component
const OrgChartNode = ({ node, isRoot = false, searchQuery = '', parentColor = null }) => {
  const [isExpanded, setIsExpanded] = useState(isRoot || node.type === 'department');
  
  // Resolve branch color: inherits parent department color down the hierarchy
  const branchColor = node.color || parentColor || '#6366f1';

  // Highlight if it matches search
  const matchesSearch = searchQuery && (
    (node.name && node.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (node.fullName && node.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (node.role && node.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (node.type === 'department') {
    const childrenDepts = node.children || [];
    const directEmployees = node.employees || [];
    const allChildren = [...childrenDepts, ...directEmployees];
    const totalChildCount = allChildren.length;

    return (
      <div className="flex flex-col items-center relative">
        {/* Node Card */}
        <motion.div 
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative bg-white dark:bg-slate-900 rounded-2xl shadow-md border-2 w-64 p-4 z-10 transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer select-none",
            matchesSearch 
              ? "border-amber-400 ring-4 ring-amber-400/30 bg-amber-50/20 dark:bg-amber-950/20" 
              : "border-slate-200 dark:border-slate-800",
            isRoot ? "shadow-lg ring-2 ring-indigo-500/20" : ""
          )}
          style={{ borderTopColor: branchColor, borderTopWidth: '4px' }}
          onClick={toggleExpand}
        >
          <div className="flex items-start justify-between mb-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm font-bold"
              style={{ backgroundColor: branchColor }}
            >
              <Building2 size={20} />
            </div>
            {totalChildCount > 0 && (
              <button 
                onClick={toggleExpand}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs font-bold border border-slate-200 dark:border-slate-700"
                title={isExpanded ? "Collapse sub-items" : "Expand sub-items"}
              >
                <span>{totalChildCount}</span>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
          </div>
          
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-1 tracking-tight">{node.name}</h3>
          
          {node.head && (
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2 truncate">
              <span 
                className="w-4 h-4 rounded-full text-white flex items-center justify-center text-[9px] font-bold shrink-0 shadow-xs"
                style={{ backgroundColor: branchColor }}
              >
                H
              </span>
              <span className="truncate">{node.head}</span>
            </p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div 
              className="flex items-center gap-1.5 text-[11px] font-extrabold"
              style={{ color: branchColor }}
            >
              <Users size={13} />
              <span>{node.employeeCount || 0} Members</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Dept
            </span>
          </div>
        </motion.div>

        {/* Vertical connector line extending down from department node bottom */}
        {isExpanded && totalChildCount > 0 && (
          <div className="w-[2px] h-6 shadow-sm shrink-0" style={{ backgroundColor: branchColor }} />
        )}

        {/* Children (Sub-departments & Direct Employees) */}
        <AnimatePresence>
          {isExpanded && totalChildCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center relative"
            >
              {allChildren.map((child, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === totalChildCount - 1;
                const isSingle = totalChildCount === 1;

                return (
                  <div key={child.id || `child-${idx}`} className="relative flex flex-col items-center px-4">
                    {/* Horizontal Connector Line segment */}
                    {!isSingle && (
                      <div className="absolute top-0 left-0 right-0 h-[2px]">
                        {!isFirst && <div className="absolute top-0 left-0 w-1/2 h-[2px]" style={{ backgroundColor: branchColor }} />}
                        {!isLast && <div className="absolute top-0 right-0 w-1/2 h-[2px]" style={{ backgroundColor: branchColor }} />}
                      </div>
                    )}

                    {/* Vertical Connector Line segment down to child card */}
                    <div className="w-[2px] h-6 shrink-0" style={{ backgroundColor: branchColor }} />
                    
                    {/* Intersection Junction Dot */}
                    <div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm z-20" 
                      style={{ backgroundColor: branchColor }}
                    />

                    <OrgChartNode node={child} parentColor={branchColor} searchQuery={searchQuery} />
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Employee Node
  if (node.type === 'employee') {
    const reports = node.directReports || [];
    const reportCount = reports.length;

    return (
      <div className="flex flex-col items-center relative">
        <motion.div 
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative bg-white dark:bg-slate-900 rounded-2xl shadow-md border-2 border-slate-200 dark:border-slate-800 w-60 p-4 z-10 transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer select-none",
            matchesSearch 
              ? "border-amber-400 ring-4 ring-amber-400/30 bg-amber-50/20 dark:bg-amber-950/20" 
              : "hover:border-slate-300 dark:hover:border-slate-700"
          )}
          style={{ borderTopColor: branchColor, borderTopWidth: '3px' }}
          onClick={toggleExpand}
        >
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              {node.avatarUrl ? (
                <img 
                  src={node.avatarUrl} 
                  alt={node.fullName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                />
              ) : (
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-sm border-2 border-white dark:border-slate-800"
                  style={{ backgroundColor: branchColor }}
                >
                  {node.fullName ? node.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'EM'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" title="Active" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate tracking-tight">{node.fullName}</h4>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">{node.role || 'Employee'}</p>
              {(node.departmentName || node.department?.name) && (
                <p 
                  className="text-[10px] font-bold truncate mt-1"
                  style={{ color: branchColor }}
                >
                  {node.departmentName || node.department?.name}
                </p>
              )}
            </div>

            {reportCount > 0 && (
              <button 
                onClick={toggleExpand}
                className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[10px] font-bold shrink-0 border border-slate-200 dark:border-slate-700"
                title={isExpanded ? "Collapse Direct Reports" : "Expand Direct Reports"}
              >
                <span>{reportCount}</span>
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            )}
          </div>
        </motion.div>

        {/* Vertical connector down from employee node bottom */}
        {isExpanded && reportCount > 0 && (
          <div className="w-[2px] h-6 shadow-sm shrink-0" style={{ backgroundColor: branchColor }} />
        )}

        {/* Direct Reports */}
        <AnimatePresence>
          {isExpanded && reportCount > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center relative"
            >
              {reports.map((report, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === reportCount - 1;
                const isSingle = reportCount === 1;

                return (
                  <div key={report.id || `report-${idx}`} className="relative flex flex-col items-center px-4">
                    {/* Horizontal Connector Line segment */}
                    {!isSingle && (
                      <div className="absolute top-0 left-0 right-0 h-[2px]">
                        {!isFirst && <div className="absolute top-0 left-0 w-1/2 h-[2px]" style={{ backgroundColor: branchColor }} />}
                        {!isLast && <div className="absolute top-0 right-0 w-1/2 h-[2px]" style={{ backgroundColor: branchColor }} />}
                      </div>
                    )}

                    {/* Vertical Connector Line segment down to report card */}
                    <div className="w-[2px] h-6 shrink-0" style={{ backgroundColor: branchColor }} />
                    
                    {/* Intersection Junction Dot */}
                    <div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-sm z-20" 
                      style={{ backgroundColor: branchColor }}
                    />

                    <OrgChartNode node={report} parentColor={branchColor} searchQuery={searchQuery} />
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

const OrgChart = () => {
  const { orgChartData, fetchOrgChart, loading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  useEffect(() => {
    fetchOrgChart();
  }, [fetchOrgChart]);

  // Global prevention of browser zoom and mapping keyboard zoom to canvas zoom
  useEffect(() => {
    const handleGlobalWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const handleGlobalKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+' || e.key === '-' || e.key === '_')) {
        e.preventDefault();
        // Route keyboard zoom to our canvas scale
        if (e.key === '=' || e.key === '+') {
          setScale(s => Math.min(2.5, s + 0.1));
        } else {
          setScale(s => Math.max(0.2, s - 0.1));
        }
      }
    };

    // Must attach to document with passive: false to reliably override Chrome zoom
    document.addEventListener('wheel', handleGlobalWheel, { passive: false });
    document.addEventListener('keydown', handleGlobalKeydown, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleGlobalWheel);
      document.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, []);

  // Non-passive wheel event listener on canvas to control canvas-only zoom
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const handleWheelNative = (e) => {
      // Prevent browser default page zoom or scroll when wheeling on canvas
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom canvas on Ctrl+Scroll
        const delta = e.deltaY * -0.0015;
        setScale(s => Math.min(Math.max(0.2, s + delta), 2.5));
      } else {
        // Pan canvas on normal Scroll
        // Many mice only send deltaY, while trackpads and Shift+Scroll send deltaX
        setPosition(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };

    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelNative);
    };
  }, [loading, orgChartData]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrgChart(null, true);
    setIsRefreshing(false);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition(prev => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  };

  const lastTouchRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      lastTouchRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - lastTouchRef.current.x;
    const deltaY = currentY - lastTouchRef.current.y;
    
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    lastTouchRef.current = { x: currentX, y: currentY };
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!orgChartData && loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-[82vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg select-none">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur shrink-0 z-20">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
              <Building2 size={20} />
            </span>
            Organization Chart
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Visualize company hierarchy, department structure, and reporting lines</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search people, roles, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 h-9 pl-9 pr-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-bold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setScale(s => Math.max(0.2, s - 0.1)); }}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-lg transition-all active:scale-95"
              title="Zoom Out"
            >
              <Minus size={16} />
            </button>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); resetView(); }}
              className="w-12 py-1 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-lg transition-all active:scale-95 text-center"
              title="Reset View"
            >
              {Math.round(scale * 100)}%
            </button>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setScale(s => Math.min(2.5, s + 0.1)); }}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-lg transition-all active:scale-95"
              title="Zoom In"
            >
              <Plus size={16} />
            </button>
          </div>

          <button 
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
            title="Refresh Org Chart"
          >
            <RefreshCw size={16} className={cn((isRefreshing || loading) && "animate-spin text-indigo-500")} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={dragRef}
        className={cn(
          "flex-1 overflow-hidden relative cursor-grab bg-slate-50/70 dark:bg-slate-950/80 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px] touch-none",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div 
          className="absolute origin-top transition-transform duration-75 ease-out flex justify-center w-full pt-16 pb-32"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          {orgChartData?.tree?.length > 0 ? (
            <div className="flex gap-16">
              {orgChartData.tree.map((rootNode) => (
                <OrgChartNode 
                  key={rootNode.id} 
                  node={rootNode} 
                  isRoot={true} 
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 mt-20 p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Building2 size={56} className="mb-4 text-slate-300 dark:text-slate-600" />
              <p className="font-extrabold text-slate-700 dark:text-slate-300 text-lg">No organization structure found</p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">Configure departments and employee reporting lines to generate the org chart.</p>
            </div>
          )}
        </div>
        
        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex flex-col sm:flex-row gap-2 sm:gap-2.5 pointer-events-none z-20 scale-75 sm:scale-100 origin-bottom-left">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-3">
             <div className="w-3.5 h-3.5 rounded-lg bg-indigo-600 shadow-sm" />
             <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 font-bold">Department</span>
          </div>
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-3">
             <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-800 shadow-sm" />
             <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Employee</span>
          </div>
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-3">
             <div className="w-4 h-[2px] bg-indigo-500 rounded-full" />
             <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Relation Line</span>
          </div>
        </div>
        
        {/* Navigation Tips */}
        <div className="hidden xl:block absolute bottom-6 right-6 text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider pointer-events-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-md py-2.5 px-4 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
          Tip: Scroll or Drag to pan &bull; Ctrl + Scroll to zoom
        </div>
      </div>
    </div>
  );
};

export default OrgChart;


