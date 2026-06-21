import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getCompany(id: string) {
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return data;
}

async function getCompanyModels(companyId: string) {
  const { data } = await supabase
    .from('models')
    .select('*')
    .eq('company_id', companyId)
    .order('name');
  return data || [];
}

function pricingBadgeColor(type: string) {
  switch (type) {
    case 'free': return { background: '#dcfce7', color: '#166534' };
    case 'freemium': return { background: '#fef9c3', color: '#854d0e' };
    case 'paid': return { background: '#f3f4f6', color: '#374151' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
}

export default async function CompanyDetail({ params }: { params: { id: string } }) {
  const company = await getCompany(params.id);
  if (!company) notFound();

  const models = await getCompanyModels(params.id);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ margin: '32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#1877F2' }}>
            {company.name.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 4px' }}>{company.name}</h1>
            <p style={{ fontSize: 16, color: '#6b7280', margin: 0 }}>{company.country} · Founded {company.founded_year}</p>
          </div>
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.6, margin: '0 0 16px' }}>{company.description}</p>
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 14, color: '#1877F2', textDecoration: 'none' }}
          >
            {company.website} →
          </a>
        )}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 16px' }}>AI Models ({models.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {models.map((model) => {
          const badge = pricingBadgeColor(model.pricing_type);
          return (
            <Link
              key={model.id}
              href={`/models/${model.id}`}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{model.name}</h3>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: badge.background, color: badge.color }}>
                  {model.pricing_type}
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#4b5563', margin: '0 0 8px', lineHeight: 1.5 }}>{model.description}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {model.use_cases?.map((uc: string) => (
                  <span key={uc} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f3f4f6', color: '#374151' }}>
                    {uc}
                  </span>
                ))}
              </div>
              {model.benchmark_score && (
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: '#1877F2' }}>
                  Score: {model.benchmark_score}/100
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {models.length === 0 && (
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', padding: '48px 0' }}>No models from this company yet.</p>
      )}
    </div>
  );
}
