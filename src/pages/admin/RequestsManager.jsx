import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Check, X, RotateCcw } from 'lucide-react';
import ReturnNoteModal from '../../components/ReturnNoteModal';

const RequestsManager = () => {
  const inventory = useInventory();
  if (!inventory) {
    return (
      <div className="animate-fade-in" style={{ padding: '24px', color: 'var(--text-secondary)' }}>
        Loading inventory context...
      </div>
    );
  }

  const { requests = [], messages = [], items = [], updateRequestStatus, markMessageRead } = inventory;

  // Helper to get item details
  const getItem = (itemId) => {
    return items.find(i => i.id === itemId) || { name: 'Unknown Item (Deleted)', category: 'Unknown' };
  };

  const isReturnable = (category) => {
    return category?.toLowerCase() !== 'beverages' && category?.toLowerCase() !== 'tissues';
  };

  // Split requests into pending and history
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(req => req.status !== 'pending').sort((a, b) => new Date(b.date) - new Date(a.date));

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [activeReturnRequest, setActiveReturnRequest] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getResolvedDate = (req) => {
    if (req.status === 'approved') return req.approvedAt || req.approved_at;
    if (req.status === 'rejected') return req.rejectedAt || req.rejected_at;
    if (req.status === 'returned') return req.returnedAt || req.returned_at;
    return null;
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '32px' }}>Requests & Messages</h1>

      <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '32px' }}>

        {/* Pending Requests Section */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Pending Requests ({pendingRequests.length})</h2>
          <div className="panel table-container">
            {pendingRequests.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No pending requests.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Requested Item</th>
                    <th>Client Details</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '150px' }}>Requested At</th>
                    <th>Notes</th>
                    <th style={{ width: '180px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: '500', color: 'var(--accent-color)' }}>{getItem(req.itemId).name}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{req.clientName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.clientEmail}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{req.requestedQuantity || 1}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {formatDate(req.date)}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{req.notes || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="flex justify-end" style={{ gap: '8px' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            onClick={() => updateRequestStatus(req.id, 'approved')}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                            onClick={() => updateRequestStatus(req.id, 'rejected')}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Client Messages */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Client Messages</h2>
          <div className="panel table-container">
            {messages.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No messages yet.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>From</th>
                    <th>Message</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(msg => (
                    <tr key={msg.id} style={{ opacity: msg.read ? 0.6 : 1 }}>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(msg.date).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{msg.clientName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{msg.email}</div>
                      </td>
                      <td style={{ maxWidth: '300px' }}>{msg.content}</td>
                      <td style={{ textAlign: 'right' }}>
                        {!msg.read ? (
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => markMessageRead(msg.id)}>
                            Mark Read
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Read</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Past Requests */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>Request History</h2>
          <div className="panel table-container">
            {pastRequests.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No request history.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Requested Item</th>
                    <th>Client Details</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '140px' }}>Requested At</th>
                    <th style={{ width: '140px' }}>Resolved At</th>
                    <th style={{ width: '120px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastRequests.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: '500', color: 'var(--accent-color)' }}>{getItem(req.itemId).name}</td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{req.clientName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.clientEmail}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{req.requestedQuantity || 1}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {formatDate(req.date)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {formatDate(getResolvedDate(req))}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-between" style={{ gap: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className={`badge ${req.status === 'approved' ? 'available' : req.status === 'returned' ? 'pending' : 'unavailable'}`}>
                              {req.status}
                            </span>
                            {(req.returnedNote || req.returned_note) && (
                              <div style={{ marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '220px', textAlign: 'right' }}>
                                <strong style={{ fontSize: '0.78rem' }}>Return note:</strong> {req.returnedNote || req.returned_note}
                              </div>
                            )}
                          </div>
                          {req.status === 'approved' && isReturnable(getItem(req.itemId).category) && (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              onClick={() => {
                                setActiveReturnRequest(req);
                                setShowReturnModal(true);
                              }}
                            >
                              <RotateCcw size={14} /> Returned
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
      {activeReturnRequest && (
        <ReturnNoteModal
          isOpen={showReturnModal}
          initialValue={activeReturnRequest.returnedNote || activeReturnRequest.returned_note || ''}
          loading={returnLoading}
          onClose={() => { setShowReturnModal(false); setActiveReturnRequest(null); }}
          onSubmit={async (note) => {
            setReturnLoading(true);
            try {
              await updateRequestStatus(activeReturnRequest.id, 'returned', note);
            } catch (err) {
              console.error(err);
            } finally {
              setReturnLoading(false);
              setShowReturnModal(false);
              setActiveReturnRequest(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default RequestsManager;
