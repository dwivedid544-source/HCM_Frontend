import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ icon: Icon, label, value, sub, style }) => (
  <motion.div
    variants={style?.variants}
    whileHover={{ y: -4 }}
    className="card relative overflow-hidden"
  >
    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style?.color}`} />
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl ${style?.bg} ${style?.text} flex items-center justify-center`}> 
        <Icon size={20} />
      </div>
      {style?.growth && (
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
          {style.growth}
        </span>
      )}
    </div>
    <p className="card-title">{label}</p>
    <h3 className="card-value">{value}</h3>
    <p className="card-desc">{sub}</p>
  </motion.div>
);

export default StatCard;
