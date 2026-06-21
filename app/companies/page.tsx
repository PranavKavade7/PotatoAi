import { supabase } from '@/lib/supabase';
import Link from 'next/link';

async function getCompanies() {
  const { data: companies } = await supabase.from('companies').select('*').order('name');
  const { data: models } = await supabase.from('models').select('id, company_id');

  const modelCount: Record<string, number> = {};
  models?.forEach((m) => {
    if (m.company_id) {
      modelCount[m.company_id] = (modelCount[m.company_id] || 0) + 1;
    }
  });

  return (companies || []).map((c) => ({ ...c, model_count: modelCount[c.id] || 0 }));
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '32px 0 24px' }}>AI Companies</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/companies/${company.id}`}
            style={{
              display: 'block',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 16,
              background: '#fff',
              textDecoration: 'none',
              color: '#1a1a1a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#1877F2' }}>
                {company.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{company.name}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{company.country} · {company.founded_year}</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#4b5563', margin: '0 0 8px', lineHeight: 1.5 }}>{company.description}</p>
            <div style={{ fontSize: 13, color: '#1877F2', fontWeight: 600 }}>
              {company.model_count} model{company.model_count !== 1 ? 's' : ''}
            </div>
          </Link>
        ))}
      </div>

      {companies.length === 0 && (
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', padding: '48px 0' }}>No companies found.</p>
      )}
    </div>
  );
}
