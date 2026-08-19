import React from 'react';
import { useCandidate } from '../../context/CandidateContext';

const Offers = () => {
  const { offers = [], respondToOffer } = useCandidate();

  const handleResponse = async (id, status) => {
    try {
      await respondToOffer(id, status);
    } catch (e) {
      console.error(e);
    }
  };

  if (offers.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Job Offers</h2>
        <p style={{ color: '#94a3b8' }}>No job offers available yet.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Job Offers</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {offers.map((offer) => (
          <div key={offer.id} className="card" style={{ padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{offer.title || 'Offer'}</p>
            <p style={{ marginTop: '0.5rem', color: '#64748b' }}>{offer.message || ''}</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => handleResponse(offer.id, 'ACCEPT')} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', backgroundColor: '#16a34a', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Accept
              </button>
              <button onClick={() => handleResponse(offer.id, 'REJECT')} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
