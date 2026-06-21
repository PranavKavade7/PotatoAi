'use client';

import { useState, useEffect } from 'react';
import { supabase, type Company } from '@/lib/supabase';

const TABS = ['News', 'Models', 'Companies', 'Glossary', 'Newsletter'];

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  is_active: boolean;
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('News');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subLoading, setSubLoading] = useState(false);
  const [sendStatus, setSendStatus] = useState('');

  // Form states
  const [newsForm, setNewsForm] = useState({ title: '', summary: '', source_url: '', source_name: '', category: 'model-launch' });
  const [modelForm, setModelForm] = useState({ name: '', company_id: '', description: '', use_cases: '', pricing_type: 'free', pricing_detail: '', context_window: '', benchmark_score: '', official_url: '', launched_at: '' });
  const [companyForm, setCompanyForm] = useState({ name: '', country: '', founded_year: '', description: '', website: '' });
  const [glossaryForm, setGlossaryForm] = useState({ term: '', definition: '', example: '', category: 'basics' });

  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const auth = document.cookie.includes('admin_auth=true');
    setAuthenticated(auth);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    if (activeTab === 'Newsletter') {
      fetchSubscribers();
    } else {
      fetchData();
    }
    if (activeTab === 'Models') {
      supabase.from('companies').select('*').order('name').then(({ data }) => setCompanies(data || []));
    }
  }, [authenticated, activeTab]);

  async function fetchData() {
    setLoading(true);
    let query;
    switch (activeTab) {
      case 'News':
        query = supabase.from('news').select('*').order('published_at', { ascending: false });
        break;
      case 'Models':
        query = supabase.from('models').select('*, companies(*)').order('name');
        break;
      case 'Companies':
        query = supabase.from('companies').select('*').order('name');
        break;
      case 'Glossary':
        query = supabase.from('glossary').select('*').order('term');
        break;
      default:
        query = supabase.from('news').select('*');
    }
    const { data } = await query;
    setItems(data || []);
    setLoading(false);
  }

  async function fetchSubscribers() {
    setSubLoading(true);
    const { data } = await supabase.from('subscribers').select('*').order('subscribed_at', { ascending: false });
    setSubscribers(data || []);
    setSubLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  }

  function resetForms() {
    setNewsForm({ title: '', summary: '', source_url: '', source_name: '', category: 'model-launch' });
    setModelForm({ name: '', company_id: '', description: '', use_cases: '', pricing_type: 'free', pricing_detail: '', context_window: '', benchmark_score: '', official_url: '', launched_at: '' });
    setCompanyForm({ name: '', country: '', founded_year: '', description: '', website: '' });
    setGlossaryForm({ term: '', definition: '', example: '', category: 'basics' });
    setEditingId(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let payload: any = {};
    let table = '';

    switch (activeTab) {
      case 'News':
        table = 'news';
        payload = { ...newsForm, published_at: new Date().toISOString() };
        break;
      case 'Models':
        table = 'models';
        payload = {
          ...modelForm,
          use_cases: modelForm.use_cases.split(',').map((s) => s.trim()).filter(Boolean),
          benchmark_score: modelForm.benchmark_score ? parseFloat(modelForm.benchmark_score) : null,
          launched_at: modelForm.launched_at || null,
        };
        break;
      case 'Companies':
        table = 'companies';
        payload = { ...companyForm, founded_year: companyForm.founded_year ? parseInt(companyForm.founded_year) : null };
        break;
      case 'Glossary':
        table = 'glossary';
        payload = { ...glossaryForm };
        break;
    }

    if (editingId) {
      await supabase.from(table).update(payload).eq('id', editingId);
    } else {
      await supabase.from(table).insert(payload);
    }

    resetForms();
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    let table = '';
    switch (activeTab) {
      case 'News': table = 'news'; break;
      case 'Models': table = 'models'; break;
      case 'Companies': table = 'companies'; break;
      case 'Glossary': table = 'glossary'; break;
    }
    await supabase.from(table).delete().eq('id', id);
    fetchData();
  }

  function handleEdit(item: any) {
    setEditingId(item.id);
    setShowForm(true);
    switch (activeTab) {
      case 'News':
        setNewsForm({ title: item.title, summary: item.summary || '', source_url: item.source_url || '', source_name: item.source_name || '', category: item.category || 'model-launch' });
        break;
      case 'Models':
        setModelForm({
          name: item.name,
          company_id: item.company_id || '',
          description: item.description || '',
          use_cases: item.use_cases?.join(', ') || '',
          pricing_type: item.pricing_type || 'free',
          pricing_detail: item.pricing_detail || '',
          context_window: item.context_window || '',
          benchmark_score: item.benchmark_score?.toString() || '',
          official_url: item.official_url || '',
          launched_at: item.launched_at || '',
        });
        break;
      case 'Companies':
        setCompanyForm({ name: item.name, country: item.country || '', founded_year: item.founded_year?.toString() || '', description: item.description || '', website: item.website || '' });
        break;
      case 'Glossary':
        setGlossaryForm({ term: item.term, definition: item.definition, example: item.example || '', category: item.category || 'basics' });
        break;
    }
  }

  async function handleSendDigest() {
    setSendStatus('Sending...');
    try {
      const res = await fetch('/api/send-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSendStatus(`Sent to ${data.sent} subscribers.`);
      } else {
        setSendStatus(data.error || 'Failed to send.');
      }
    } catch {
      setSendStatus('Failed to send.');
    }
  }

  function exportCSV() {
    const headers = ['Email', 'Name', 'Subscribed At', 'Active'];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || '',
      new Date(s.subscribed_at).toISOString(),
      s.is_active ? 'Yes' : 'No',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authenticated) {
    return (
      <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Admin Login</h1>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', fontSize: 14, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 4, marginBottom: 12, outline: 'none' }}
          />
          {error && <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 12px' }}>{error}</p>}
          <button
            type="submit"
            style={{ fontSize: 14, fontWeight: 600, padding: '10px 20px', borderRadius: 4, background: '#1877F2', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '32px 0 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Admin Panel</h1>
        <button
          onClick={() => { document.cookie = 'admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; setAuthenticated(false); }}
          style={{ fontSize: 14, padding: '6px 14px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #e5e7eb', paddingBottom: 12 }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setShowForm(false); setEditingId(null); setSendStatus(''); }}
            style={{
              fontSize: 14,
              padding: '8px 16px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              background: tab === activeTab ? '#1877F2' : 'transparent',
              color: tab === activeTab ? '#fff' : '#374151',
              fontWeight: tab === activeTab ? 600 : 400,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Newsletter' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Total Subscribers: {subscribers.length}</div>
            <button
              onClick={handleSendDigest}
              style={{ fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 4, background: '#1877F2', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Send This Week&apos;s Digest
            </button>
            <button
              onClick={exportCSV}
              style={{ fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
            >
              Export CSV
            </button>
          </div>
          {sendStatus && (
            <div style={{ fontSize: 14, color: sendStatus.includes('Sent') ? '#166534' : '#dc2626', marginBottom: 16, fontWeight: 600 }}>
              {sendStatus}
            </div>
          )}
          {subLoading ? (
            <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
          ) : (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Email</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Subscribed</th>
                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{sub.email}</td>
                      <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{sub.name || '-'}</td>
                      <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                      <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: sub.is_active ? '#dcfce7' : '#fee2e2', color: sub.is_active ? '#166534' : '#991b1b' }}>
                          {sub.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {subscribers.length === 0 && (
                <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', padding: '24px 0' }}>No subscribers yet.</p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab !== 'Newsletter' && (
        <>
          <button
            onClick={() => { resetForms(); setShowForm(!showForm); }}
            style={{ fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 4, background: '#1877F2', color: '#fff', border: 'none', cursor: 'pointer', marginBottom: 16 }}
          >
            {showForm ? 'Cancel' : editingId ? 'Edit Form' : 'Add New'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 24, background: '#fff' }}>
              {activeTab === 'News' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input required placeholder="Title" value={newsForm.title} onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <textarea placeholder="Summary" value={newsForm.summary} onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })} rows={3} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none', resize: 'vertical' }} />
                  <input placeholder="Source URL" value={newsForm.source_url} onChange={(e) => setNewsForm({ ...newsForm, source_url: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <input placeholder="Source Name" value={newsForm.source_name} onChange={(e) => setNewsForm({ ...newsForm, source_name: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <select value={newsForm.category} onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}>
                    <option value="model-launch">Model Launch</option>
                    <option value="funding">Funding</option>
                    <option value="research">Research</option>
                    <option value="india">India</option>
                    <option value="policy">Policy</option>
                  </select>
                </div>
              )}
              {activeTab === 'Models' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input required placeholder="Name" value={modelForm.name} onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <select value={modelForm.company_id} onChange={(e) => setModelForm({ ...modelForm, company_id: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}>
                    <option value="">Select company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <textarea placeholder="Description" value={modelForm.description} onChange={(e) => setModelForm({ ...modelForm, description: e.target.value })} rows={2} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none', resize: 'vertical' }} />
                  <input placeholder="Use cases (comma separated: coding,writing,image)" value={modelForm.use_cases} onChange={(e) => setModelForm({ ...modelForm, use_cases: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <select value={modelForm.pricing_type} onChange={(e) => setModelForm({ ...modelForm, pricing_type: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}>
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Paid</option>
                  </select>
                  <input placeholder="Pricing detail" value={modelForm.pricing_detail} onChange={(e) => setModelForm({ ...modelForm, pricing_detail: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <input placeholder="Context window" value={modelForm.context_window} onChange={(e) => setModelForm({ ...modelForm, context_window: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <input placeholder="Benchmark score" value={modelForm.benchmark_score} onChange={(e) => setModelForm({ ...modelForm, benchmark_score: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <input placeholder="Official URL" value={modelForm.official_url} onChange={(e) => setModelForm({ ...modelForm, official_url: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <input type="date" placeholder="Launch date" value={modelForm.launched_at} onChange={(e) => setModelForm({ ...modelForm, launched_at: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                </div>
              )}
              {activeTab === 'Companies' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input required placeholder="Name" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <input placeholder="Country" value={companyForm.country} onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <input placeholder="Founded Year" value={companyForm.founded_year} onChange={(e) => setCompanyForm({ ...companyForm, founded_year: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <textarea placeholder="Description" value={companyForm.description} onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })} rows={2} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none', resize: 'vertical' }} />
                  <input placeholder="Website" value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                </div>
              )}
              {activeTab === 'Glossary' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input required placeholder="Term" value={glossaryForm.term} onChange={(e) => setGlossaryForm({ ...glossaryForm, term: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <textarea required placeholder="Definition" value={glossaryForm.definition} onChange={(e) => setGlossaryForm({ ...glossaryForm, definition: e.target.value })} rows={3} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none', resize: 'vertical' }} />
                  <input placeholder="Example" value={glossaryForm.example} onChange={(e) => setGlossaryForm({ ...glossaryForm, example: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }} />
                  <select value={glossaryForm.category} onChange={(e) => setGlossaryForm({ ...glossaryForm, category: e.target.value })} style={{ fontSize: 14, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 4, outline: 'none' }}>
                    <option value="basics">Basics</option>
                    <option value="technical">Technical</option>
                    <option value="business">Business</option>
                  </select>
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <button type="submit" style={{ fontSize: 14, fontWeight: 600, padding: '10px 20px', borderRadius: 4, background: '#1877F2', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p style={{ fontSize: 14, color: '#6b7280' }}>Loading...</p>
          ) : (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {activeTab === 'News' && (
                      <><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Title</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Category</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Source</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: 120 }}>Actions</th></>
                    )}
                    {activeTab === 'Models' && (
                      <><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Company</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Pricing</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: 120 }}>Actions</th></>
                    )}
                    {activeTab === 'Companies' && (
                      <><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Country</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Year</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: 120 }}>Actions</th></>
                    )}
                    {activeTab === 'Glossary' && (
                      <><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Term</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Category</th><th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: 120 }}>Actions</th></>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      {activeTab === 'News' && (
                        <>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.title}</td>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.category}</td>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.source_name}</td>
                        </>
                      )}
                      {activeTab === 'Models' && (
                        <>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.name}</td>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.companies?.name || 'Unknown'}</td>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.pricing_type}</td>
                        </>
                      )}
                      {activeTab === 'Companies' && (
                        <>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.name}</td>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.country}</td>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.founded_year}</td>
                        </>
                      )}
                      {activeTab === 'Glossary' && (
                        <>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.term}</td>
                          <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>{item.category}</td>
                        </>
                      )}
                      <td style={{ padding: 12, borderBottom: '1px solid #e5e7eb' }}>
                        <button onClick={() => handleEdit(item)} style={{ fontSize: 12, marginRight: 8, padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(item.id)} style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid #e5e7eb', background: '#fff', color: '#dc2626', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 && (
                <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', padding: '24px 0' }}>No items found.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
