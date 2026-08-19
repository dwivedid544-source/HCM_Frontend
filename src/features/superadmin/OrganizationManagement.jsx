import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { superAdminAPI } from '../../utils/apiService';
import {
  Building2, Plus, Search, Trash2, Edit3, X, 
  Shield, Mail, Phone, Calendar, PlayCircle, PauseCircle,
  Activity, ExternalLink, CheckCircle, CreditCard
} from 'lucide-react';
import PageHeader from '../../shared/components/layout/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);
  
  const [showToastMsg, setShowToastMsg] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', org: null });

  // Subscription Edit State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subFormData, setSubFormData] = useState({
    plan: 'Professional',
    maxEmployees: 100,
    maxStorageGB: 50,
    status: 'Active'
  });
  const [isSavingSub, setIsSavingSub] = useState(false);

  const handleOpenEditSub = (org) => {
    setSelectedOrg(org);
    setSubFormData({
      plan: org.plan || 'Professional',
      maxEmployees: org.maxEmployees || 100,
      maxStorageGB: org.maxStorageGB || 50,
      status: org.status || 'Active'
    });
    setIsSubModalOpen(true);
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (!selectedOrg) return;
    setIsSavingSub(true);
    try {
      await superAdminAPI.updateOrgSubscription(selectedOrg.id, subFormData);
      showToast(`Subscription updated for ${selectedOrg.name}!`, 'success');
      setIsSubModalOpen(false);
      fetchOrganizations();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update subscription', 'error');
    } finally {
      setIsSavingSub(false);
    }
  };

  // Provision Form State
  const [formData, setFormData] = useState({
    orgName: '',
    industry: 'Technology',
    country: 'United States',
    adminFullName: '',
    adminEmail: '',
    plan: 'Trial',
    billingCycle: 'Monthly',
  });

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getAllOrganizations();
      setOrganizations(res.data.data || []);
    } catch (err) {
      showToast('Failed to load organizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const showToast = (msg, type = 'success') => {
    setShowToastMsg({ msg, type });
    setTimeout(() => setShowToastMsg(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        organization: {
          name: formData.orgName,
          industry: formData.industry,
          country: formData.country,
        },
        admin: {
          fullName: formData.adminFullName,
          email: formData.adminEmail,
        },
        subscription: {
          plan: formData.plan,
          billingCycle: formData.billingCycle,
        }
      };

      await superAdminAPI.provisionOrganization(payload);
      showToast('Organization provisioned successfully!');
      setIsProvisionModalOpen(false);
      fetchOrganizations();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to provision organization', 'error');
    }
  };

  const viewDetails = async (org) => {
    setSelectedOrg(org);
    setIsDetailsModalOpen(true);
    try {
      const res = await superAdminAPI.getOrganizationDetails(org.id);
      setOrgDetails(res.data.data);
    } catch (err) {
      showToast('Failed to load details', 'error');
    }
  };

  const toggleStatus = async (org) => {
    try {
      if (org.status === 'Active') {
        await superAdminAPI.suspendOrganization(org.id);
        showToast('Organization suspended');
      } else {
        await superAdminAPI.activateOrganization(org.id);
        showToast('Organization activated');
      }
      fetchOrganizations();
    } catch (err) {
      showToast('Failed to change status', 'error');
    }
  };

  const confirmDelete = (org) => {
    setConfirmDialog({ isOpen: true, type: 'delete', org });
  };

  const handleDelete = async () => {
    try {
      await superAdminAPI.deleteOrganization(confirmDialog.org.id);
      showToast('Organization deleted permanently');
      fetchOrganizations();
    } catch (err) {
      showToast('Failed to delete organization', 'error');
    } finally {
      setConfirmDialog({ isOpen: false, type: '', org: null });
    }
  };

  const resendInvitation = async (invitationId) => {
    try {
      await superAdminAPI.resendOrgInvitation(invitationId);
      showToast('Invitation resent successfully');
      viewDetails(selectedOrg); // Refresh details
    } catch (err) {
      showToast('Failed to resend invitation', 'error');
    }
  };

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.industry && o.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organization Management" 
        subtitle="Provision and manage SaaS tenants across the platform"
        icon={Building2}
      />

      {showToastMsg && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg text-white font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-5 ${showToastMsg.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {showToastMsg.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {showToastMsg.msg}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search organizations..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-shadow"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setFormData({
              orgName: '', industry: 'Technology', country: 'United States',
              adminFullName: '', adminEmail: '', plan: 'Trial', billingCycle: 'Monthly'
            });
            setIsProvisionModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Provision Tenant
        </button>
      </div>

      {/* Organizations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
            No organizations found matching "{searchTerm}"
          </div>
        ) : (
          filteredOrgs.map(org => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={org.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow relative group"
            >
              {org.status === 'Suspended' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
              )}
              {org.status === 'Active' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm
                      ${org.status === 'Active' ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{org.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        {org.industry || 'Unknown Industry'}
                      </p>
                    </div>
                  </div>
                  <ActionDropdown
                    trigger={
                      <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <Edit3 className="w-5 h-5" />
                      </button>
                    }
                    items={[
                      { label: 'View Details', icon: ExternalLink, onClick: () => viewDetails(org) },
                      { label: 'Edit Subscription', icon: CreditCard, onClick: () => handleOpenEditSub(org) },
                      { 
                        label: org.status === 'Active' ? 'Suspend Tenant' : 'Activate Tenant', 
                        icon: org.status === 'Active' ? PauseCircle : PlayCircle, 
                        onClick: () => toggleStatus(org),
                        danger: org.status === 'Active'
                      },
                      { label: 'Delete Organization', icon: Trash2, onClick: () => setConfirmDialog({ isOpen: true, type: 'delete', org }), danger: true }
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><CreditCard className="w-3 h-3"/> Plan</p>
                    <p className="font-bold text-slate-900">{org.pricingPlanId ? 'Custom' : 'SaaS Plan'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Status</p>
                    <p className={`font-semibold ${org.status === 'Active' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {org.status}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(org.createdAt).toLocaleDateString()}
                  </div>
                  <button onClick={() => viewDetails(org)} className="text-indigo-600 font-medium hover:text-indigo-700">
                    Manage &rarr;
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Provision Modal */}
      <AnimatePresence>
        {isProvisionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProvisionModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  Provision New Tenant
                </h2>
                <button onClick={() => setIsProvisionModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="provisionForm" onSubmit={handleProvisionSubmit} className="space-y-6">
                  {/* Organization Info */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-bold mb-4">Organization Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name *</label>
                        <input required type="text" name="orgName" value={formData.orgName} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Acme Corp" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                        <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                          <option value="Technology">Technology</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Retail">Retail</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                        <input type="text" name="country" value={formData.country} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                  </div>

                  {/* Admin User */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Primary Administrator</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Admin Full Name *</label>
                        <input required type="text" name="adminFullName" value={formData.adminFullName} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email *</label>
                        <input required type="email" name="adminEmail" value={formData.adminEmail} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" placeholder="john@acme.com" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">An invitation email will be sent to this address to securely set their password.</p>
                  </div>

                  {/* Subscription Plan */}
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Subscription</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Plan Level</label>
                        <select name="plan" value={formData.plan} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                          <option value="Trial">14-Day Free Trial</option>
                          <option value="Starter">Starter Plan</option>
                          <option value="Professional">Professional Plan</option>
                          <option value="Enterprise">Enterprise Plan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Billing Cycle</label>
                        <select name="billingCycle" value={formData.billingCycle} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Annually (20% off)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                <button type="button" onClick={() => setIsProvisionModalOpen(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" form="provisionForm" className="px-6 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">
                  Provision Tenant
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDetailsModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Tenant Details: {selectedOrg.name}
                </h2>
                <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-8">
                {!orgDetails ? (
                  <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                ) : (
                  <>
                    {/* Metrics row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-slate-500 text-sm font-medium mb-1">Status</p>
                        <p className={`text-xl font-bold ${orgDetails.status === 'Active' ? 'text-emerald-600' : 'text-red-600'}`}>{orgDetails.status}</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-slate-500 text-sm font-medium mb-1">Users</p>
                        <p className="text-xl font-bold text-slate-900">{orgDetails._count?.users || 0}</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-slate-500 text-sm font-medium mb-1">Departments</p>
                        <p className="text-xl font-bold text-slate-900">{orgDetails._count?.departments || 0}</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-slate-500 text-sm font-medium mb-1">Setup</p>
                        <p className={`text-xl font-bold ${orgDetails.setupComplete ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {orgDetails.setupComplete ? 'Complete' : 'Pending'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Subscription */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 font-bold mb-4 border-b border-slate-100 pb-2">Active Subscription</h3>
                        {orgDetails.subscriptions && orgDetails.subscriptions.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                              <span className="text-slate-500">Plan</span>
                              <span className="font-bold text-slate-900">{orgDetails.subscriptions[0].plan}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                              <span className="text-slate-500">Billing</span>
                              <span className="font-semibold text-slate-900">{orgDetails.subscriptions[0].billingCycle}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                              <span className="text-slate-500">Employee Limit</span>
                              <span className="font-semibold text-slate-900">{orgDetails.subscriptions[0].employeeLimit}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                              <span className="text-slate-500">Created</span>
                              <span className="font-semibold text-slate-900">{new Date(orgDetails.subscriptions[0].createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No active SaaS subscription. (Using legacy pricing plan)</p>
                        )}
                      </div>

                      {/* Admin Invitations */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Admin Invitations</h3>
                        {orgDetails.invitations && orgDetails.invitations.length > 0 ? (
                          <div className="space-y-3">
                            {orgDetails.invitations.map(inv => (
                              <div key={inv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-semibold text-slate-900">{inv.email}</p>
                                    <p className="text-xs text-slate-500">Sent: {new Date(inv.createdAt).toLocaleString()}</p>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium
                                    ${inv.status === 'USED' ? 'bg-emerald-100 text-emerald-700' : 
                                      inv.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                                    {inv.status}
                                  </span>
                                </div>
                                {inv.status === 'PENDING' && (
                                  <button onClick={() => resendInvitation(inv.id)} className="text-xs text-indigo-600 font-medium hover:text-indigo-800">
                                    Resend Invitation
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No admin invitations found.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subscription Edit Modal */}
      <AnimatePresence>
        {isSubModalOpen && selectedOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSubModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  Edit Subscription: {selectedOrg.name}
                </h2>
                <button onClick={() => setIsSubModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSub} className="p-6 space-y-4">
                <div>
                  <label className="form-label">Subscription Plan</label>
                  <select
                    className="input-field h-11 dark:bg-slate-900"
                    value={subFormData.plan}
                    onChange={e => setSubFormData({ ...subFormData, plan: e.target.value })}
                  >
                    <option value="Trial">14-Day Free Trial</option>
                    <option value="Starter">Starter Plan</option>
                    <option value="Professional">Professional Plan</option>
                    <option value="Enterprise">Enterprise Plan</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Max Employees</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input-field h-11"
                      value={subFormData.maxEmployees}
                      onChange={e => setSubFormData({ ...subFormData, maxEmployees: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Max Storage (GB)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input-field h-11"
                      value={subFormData.maxStorageGB}
                      onChange={e => setSubFormData({ ...subFormData, maxStorageGB: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Tenant Subscription Status</label>
                  <select
                    className="input-field h-11 dark:bg-slate-900"
                    value={subFormData.status}
                    onChange={e => setSubFormData({ ...subFormData, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsSubModalOpen(false)} className="btn-secondary px-5 py-2 text-xs">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSavingSub} className="btn-primary px-6 py-2 text-xs flex items-center gap-2">
                    {isSavingSub ? <span>Saving...</span> : <span>Save Plan Changes</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Organization"
        message={`Are you sure you want to completely delete "${confirmDialog.org?.name}"? This will permanently erase ALL data associated with this tenant, including users, payroll, and history. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, type: '', org: null })}
      />
    </div>
  );
};

export default OrganizationManagement;
