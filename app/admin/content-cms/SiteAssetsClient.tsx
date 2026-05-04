'use client';

import { useState } from 'react';
import { Topbar, Icon } from '../AdminShell';

// Faithful port of design admin/site.jsx — brand-level media controls
// (Logos, Homepage hero, OG default, Video assets, Favicon, Brand
// tokens) for the public site. Persists each section as a JSON value
// under a `site_assets_*` key in site_content via the existing
// /api/admin/content endpoint. Real Supabase Storage uploads + a media
// picker drawer are TODO_API_PICKER — sections accept storage paths
// or URLs typed in for now.

export type SiteAssets = {
  logos: { light: { storage_path: string; alt: string } | null; dark: { storage_path: string; alt: string } | null };
  hero: {
    mode: 'kenburns' | 'video' | 'static';
    headline: string;
    subhead: string;
    images: Array<{ storage_path: string; alt: string }>;
    video: { storage_path: string; name: string } | null;
  };
  og: { image: { storage_path: string } | null; title: string; description: string };
  favicon: { storage_path: string } | null;
  brand_tokens: Array<{ name: string; hex: string; desc: string }>;
};

const DEFAULT_ASSETS: SiteAssets = {
  logos: { light: null, dark: null },
  hero: {
    mode: 'kenburns',
    headline: 'Curated investment-grade properties in San Miguel de Allende',
    subhead: 'Underwriting-first. Vacation rental optimized. Held to a 9% net yield bar.',
    images: [],
    video: null,
  },
  og: {
    image: null,
    title: 'InvestSMA — Curated SMA investment properties',
    description: 'Investment-grade homes in San Miguel de Allende. Underwriting-first. Vacation rental optimized.',
  },
  favicon: null,
  brand_tokens: [
    { name: 'Charcoal',    hex: '#14130f', desc: 'Body, headings' },
    { name: 'Ivory',       hex: '#f8f5ee', desc: 'Background' },
    { name: 'Sand',        hex: '#e8e0cf', desc: 'Surfaces' },
    { name: 'Deep green',  hex: '#2d4a3e', desc: 'Accent' },
    { name: 'Muted gold',  hex: '#a88f4f', desc: 'Highlights' },
    { name: 'Burgundy',    hex: '#5e2a2a', desc: 'CTAs' },
  ],
};

export default function SiteAssetsClient({ initialAssets }: { initialAssets: Partial<SiteAssets> | null }) {
  const merged: SiteAssets = { ...DEFAULT_ASSETS, ...(initialAssets ?? {}), logos: { ...DEFAULT_ASSETS.logos, ...(initialAssets?.logos ?? {}) }, hero: { ...DEFAULT_ASSETS.hero, ...(initialAssets?.hero ?? {}) }, og: { ...DEFAULT_ASSETS.og, ...(initialAssets?.og ?? {}) } };
  const [assets, setAssets] = useState<SiteAssets>(merged);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ tone: 'ok' | 'err'; msg: string } | null>(null);

  const update = <K extends keyof SiteAssets>(k: K, v: SiteAssets[K]) => {
    setAssets(a => ({ ...a, [k]: v }));
    setDirty(true);
  };

  const publish = async () => {
    setBusy(true); setToast(null);
    try {
      const r = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'site_assets', value: assets, status: 'published' }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error('Save failed');
      setDirty(false);
      setToast({ tone: 'ok', msg: 'Site assets published.' });
    } catch (e) {
      setToast({ tone: 'err', msg: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const discard = () => {
    setAssets(merged);
    setDirty(false);
    setToast(null);
  };

  return (
    <div className='main'>
      <Topbar crumbs={['Site assets']}>
        <a href='/' target='_blank' rel='noopener noreferrer' className='btn btn-sm btn-ghost'>
          <Icon name='external' /> View public site
        </a>
        <button className='btn btn-sm btn-primary' disabled={!dirty || busy} onClick={publish}>
          <Icon name='save' /> {busy ? 'Publishing…' : 'Publish changes'}
        </button>
      </Topbar>

      <div className='page'>
        <div className='page-head'>
          <div>
            <h1 className='page-title'>Site assets</h1>
            <p className='page-subtitle'>Brand-level media that appears across the public site. Changes go live on publish.</p>
          </div>
        </div>

        <LogosCard
          logos={assets.logos}
          onChange={v => update('logos', v)}
        />

        <HeroCard
          hero={assets.hero}
          onChange={v => update('hero', v)}
        />

        <OgCard
          og={assets.og}
          onChange={v => update('og', v)}
        />

        <VideosCard hero={assets.hero} />

        <FaviconCard
          favicon={assets.favicon}
          onChange={v => update('favicon', v)}
        />

        <BrandTokensCard tokens={assets.brand_tokens} />

        {toast && (
          <div className={`badge badge-${toast.tone === 'ok' ? 'success' : 'danger'}`} style={{ marginTop: 12, padding: '8px 12px', display: 'inline-block' }}>
            {toast.msg}
          </div>
        )}
      </div>

      <div className='save-bar'>
        <div className={`status ${dirty ? '' : 'saved'}`}>
          <span className='dot' />
          <span>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
        </div>
        <div className='actions'>
          <button className='btn btn-sm' onClick={discard} disabled={!dirty || busy}>Discard</button>
          <button className='btn btn-sm btn-primary' onClick={publish} disabled={!dirty || busy}>
            <Icon name='save' /> {busy ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function LogosCard({
  logos, onChange,
}: {
  logos: SiteAssets['logos'];
  onChange: (v: SiteAssets['logos']) => void;
}) {
  return (
    <div className='card' style={{ marginBottom: 16 }}>
      <div className='card-head'>
        <div>
          <h3 className='card-title'>Logos</h3>
          <p className='card-subtitle'>SVG recommended · used in nav, footer, emails, OG cards</p>
        </div>
      </div>
      <div className='card-body'>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className='logos-grid'>
          <LogoSlot
            label='Primary · light backgrounds'
            asset={logos.light}
            bg='#fff'
            onChange={(v) => onChange({ ...logos, light: v })}
          />
          <LogoSlot
            label='Inverse · dark backgrounds'
            asset={logos.dark}
            bg='#14130f'
            onChange={(v) => onChange({ ...logos, dark: v })}
          />
        </div>
      </div>
    </div>
  );
}

function LogoSlot({
  label, asset, bg, onChange,
}: {
  label: string;
  asset: { storage_path: string; alt: string } | null;
  bg: string;
  onChange: (v: { storage_path: string; alt: string } | null) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ background: bg, borderRadius: 8, padding: '40px 24px', display: 'grid', placeItems: 'center', minHeight: 160, border: '1px solid var(--border)', marginBottom: 8 }}>
        <div style={{ maxWidth: 220, color: bg === '#fff' ? '#14130f' : '#fff', fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 500, letterSpacing: '0.02em' }}>
          InvestSMA
        </div>
      </div>
      <div className='field'>
        <label className='label'>Storage path <span className='help'>e.g. site/logo-light.svg</span></label>
        <input
          className='input'
          value={asset?.storage_path ?? ''}
          onChange={e => onChange(e.target.value ? { storage_path: e.target.value, alt: asset?.alt ?? '' } : null)}
          placeholder='site/logo.svg'
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function HeroCard({
  hero, onChange,
}: {
  hero: SiteAssets['hero'];
  onChange: (v: SiteAssets['hero']) => void;
}) {
  const addImage = () => {
    onChange({ ...hero, images: [...hero.images, { storage_path: '', alt: '' }] });
  };
  const setImageAt = (i: number, v: { storage_path: string; alt: string }) => {
    onChange({ ...hero, images: hero.images.map((img, idx) => idx === i ? v : img) });
  };
  const removeImageAt = (i: number) => {
    onChange({ ...hero, images: hero.images.filter((_, idx) => idx !== i) });
  };

  return (
    <div className='card' style={{ marginBottom: 16 }}>
      <div className='card-head'>
        <div>
          <h3 className='card-title'>Homepage hero</h3>
          <p className='card-subtitle'>Cinematic Ken Burns sequence or background video · first impression</p>
        </div>
        <select
          className='select'
          value={hero.mode}
          onChange={e => onChange({ ...hero, mode: e.target.value as SiteAssets['hero']['mode'] })}
          style={{ width: 200 }}
        >
          <option value='kenburns'>Ken Burns image sequence</option>
          <option value='video'>Background video</option>
          <option value='static'>Single static image</option>
        </select>
      </div>
      <div className='card-body'>
        <div style={{ position: 'relative', aspectRatio: '21/9', borderRadius: 8, overflow: 'hidden', marginBottom: 20, background: '#14130f' }}>
          <div style={{ position: 'absolute', inset: 0, padding: '8% 10%', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
            <div className='mono' style={{ fontSize: 11, letterSpacing: '0.18em', opacity: 0.7, marginBottom: 14 }}>SAN MIGUEL DE ALLENDE · ESTABLISHED Q1 2026</div>
            <div style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontFamily: 'Cormorant Garamond, serif', fontWeight: 400, lineHeight: 1.05, maxWidth: '70%', marginBottom: 14 }}>{hero.headline}</div>
            <div style={{ fontSize: 14, opacity: 0.85, maxWidth: '50%' }}>{hero.subhead}</div>
          </div>
          <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, padding: '4px 8px', background: 'rgba(255,255,255,0.95)', color: '#000', borderRadius: 3, fontFamily: 'var(--f-mono)', letterSpacing: '0.05em' }}>LIVE PREVIEW</span>
        </div>

        <div className='grid-2' style={{ gap: 14, marginBottom: 16 }}>
          <div className='field'>
            <label className='label'>Headline</label>
            <textarea className='textarea' rows={2} value={hero.headline} onChange={e => onChange({ ...hero, headline: e.target.value })} />
          </div>
          <div className='field'>
            <label className='label'>Subhead</label>
            <textarea className='textarea' rows={2} value={hero.subhead} onChange={e => onChange({ ...hero, subhead: e.target.value })} />
          </div>
        </div>

        {(hero.mode === 'kenburns' || hero.mode === 'static') && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{hero.mode === 'kenburns' ? 'Image sequence' : 'Static image'}</div>
                <div className='muted' style={{ fontSize: 11 }}>
                  {hero.mode === 'kenburns' ? 'Cycles every 6 seconds with Ken Burns motion · 3–5 images recommended' : 'One image only'}
                </div>
              </div>
              <button className='btn btn-sm' onClick={addImage}><Icon name='plus' /> Add image</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {hero.images.length === 0 && (
                <div className='muted' style={{ fontSize: 12, padding: 16, border: '1px dashed var(--border)', borderRadius: 6, textAlign: 'center' }}>
                  No hero images yet · add a storage path
                </div>
              )}
              {hero.images.map((img, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: 10, alignItems: 'center', padding: 10, border: '1px solid var(--border)', borderRadius: 6 }}>
                  <span className='mono' style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>#{i + 1}</span>
                  <input className='input' placeholder='storage path' value={img.storage_path} onChange={e => setImageAt(i, { ...img, storage_path: e.target.value })} />
                  <input className='input' placeholder='alt text' value={img.alt} onChange={e => setImageAt(i, { ...img, alt: e.target.value })} />
                  <button className='btn btn-icon btn-ghost btn-sm' onClick={() => removeImageAt(i)} title='Remove'><Icon name='trash' /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {hero.mode === 'video' && (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Background video</div>
            <div className='muted' style={{ fontSize: 11, marginBottom: 10 }}>Looping muted MP4 · 1080p+ · keep under 30s and 20MB compressed</div>
            <div className='grid-2' style={{ gap: 10 }}>
              <div className='field'>
                <label className='label'>Storage path</label>
                <input className='input' value={hero.video?.storage_path ?? ''} onChange={e => onChange({ ...hero, video: e.target.value ? { storage_path: e.target.value, name: hero.video?.name ?? '' } : null })} placeholder='site/hero.mp4' />
              </div>
              <div className='field'>
                <label className='label'>Display name</label>
                <input className='input' value={hero.video?.name ?? ''} onChange={e => onChange({ ...hero, video: { storage_path: hero.video?.storage_path ?? '', name: e.target.value } })} placeholder='Homepage hero loop' />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function OgCard({
  og, onChange,
}: {
  og: SiteAssets['og'];
  onChange: (v: SiteAssets['og']) => void;
}) {
  return (
    <div className='card' style={{ marginBottom: 16 }}>
      <div className='card-head'>
        <div>
          <h3 className='card-title'>Default social card (Open Graph)</h3>
          <p className='card-subtitle'>Used when a page doesn&apos;t override · 1200×630 recommended</p>
        </div>
      </div>
      <div className='card-body'>
        <div className='og-grid' style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'flex-start' }}>
          <div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ aspectRatio: '1.91', background: 'var(--bg-subtle)' }} />
              <div style={{ padding: 12, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div style={{ fontSize: 10, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>investsma.com</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 3, lineHeight: 1.35 }}>{og.title}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 3, lineHeight: 1.4 }}>{og.description}</div>
              </div>
            </div>
            <div className='muted' style={{ fontSize: 11, marginTop: 6, textAlign: 'center' }}>Preview · how this appears in iMessage, Slack, X, LinkedIn</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className='field'>
              <label className='label'>Default OG title <span className='help'>{og.title.length}/60</span></label>
              <input className='input' value={og.title} onChange={e => onChange({ ...og, title: e.target.value })} />
            </div>
            <div className='field'>
              <label className='label'>Default OG description <span className='help'>{og.description.length}/200</span></label>
              <textarea className='textarea' rows={3} value={og.description} onChange={e => onChange({ ...og, description: e.target.value })} />
            </div>
            <div className='field'>
              <label className='label'>OG image storage path</label>
              <input
                className='input'
                value={og.image?.storage_path ?? ''}
                onChange={e => onChange({ ...og, image: e.target.value ? { storage_path: e.target.value } : null })}
                placeholder='site/og.png'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function VideosCard({ hero }: { hero: SiteAssets['hero'] }) {
  const rows = hero.video
    ? [{ name: hero.video.name || 'Homepage hero loop', usage: '/ · hero section', path: hero.video.storage_path }]
    : [];

  return (
    <div className='card' style={{ marginBottom: 16 }}>
      <div className='card-head'>
        <div>
          <h3 className='card-title'>Video assets</h3>
          <p className='card-subtitle'>All video files used across the public site · derived from hero config</p>
        </div>
        <button className='btn btn-sm' disabled title='Direct video upload requires the storage endpoint · TODO'>
          <Icon name='upload' /> Upload video
        </button>
      </div>
      <div className='card-body'>
        {rows.length === 0 ? (
          <div className='muted' style={{ fontSize: 13 }}>No video assets configured. Switch the hero mode to "Background video" to add one.</div>
        ) : (
          <div className='table-scroll' style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Used in</th>
                  <th>Storage path</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v, i) => (
                  <tr key={i}>
                    <td>
                      <div className='row gap-12'>
                        <div style={{ width: 60, height: 34, background: '#000', borderRadius: 3, overflow: 'hidden', position: 'relative', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                          <span style={{ borderLeft: '8px solid #fff', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', marginLeft: 2 }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{v.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{v.usage}</td>
                    <td className='mono' style={{ fontSize: 11 }}>{v.path || '—'}</td>
                    <td><span className='badge badge-success'>Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function FaviconCard({
  favicon, onChange,
}: {
  favicon: SiteAssets['favicon'];
  onChange: (v: SiteAssets['favicon']) => void;
}) {
  return (
    <div className='card' style={{ marginBottom: 16 }}>
      <div className='card-head'>
        <div>
          <h3 className='card-title'>Favicon &amp; app icons</h3>
          <p className='card-subtitle'>Browser tab icon · iOS / Android home screen · 512×512 master file</p>
        </div>
      </div>
      <div className='card-body'>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {[16, 32, 64, 128].map(size => (
              <div key={size} style={{ textAlign: 'center' }}>
                <div style={{ width: size, height: size, background: 'var(--bg-subtle)', borderRadius: size > 32 ? 6 : 4, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 6, display: 'grid', placeItems: 'center' }}>
                  <Icon name='image' style={{ width: size * 0.4, height: size * 0.4, opacity: 0.4 }} />
                </div>
                <div className='mono' style={{ fontSize: 10, color: 'var(--fg-muted)' }}>{size}px</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 240, padding: 14, background: 'var(--bg-subtle)', borderRadius: 6, fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Auto-generated from master file</div>
            <div className='muted' style={{ lineHeight: 1.6 }}>
              We export favicon.ico (16/32/48), apple-touch-icon (180×180), Android (192/512), and OG fallback (1200×630). Upload a 512×512 PNG with transparent or solid background.
            </div>
          </div>
        </div>
        <div className='field' style={{ marginTop: 16 }}>
          <label className='label'>Favicon master path</label>
          <input
            className='input'
            value={favicon?.storage_path ?? ''}
            onChange={e => onChange(e.target.value ? { storage_path: e.target.value } : null)}
            placeholder='site/favicon-512.png'
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function BrandTokensCard({ tokens }: { tokens: SiteAssets['brand_tokens'] }) {
  // TODO_API_TOKENS: hook up to an `editor: tokens` interaction when the
  // schema for design tokens lands. Today this is read-only display.
  return (
    <div className='card' style={{ marginBottom: 16 }}>
      <div className='card-head'>
        <div>
          <h3 className='card-title'>Brand color tokens</h3>
          <p className='card-subtitle'>Used in CSS variables across all public pages · sync to <code className='mono'>globals.css</code> on save</p>
        </div>
        <button className='btn btn-sm btn-ghost' disabled title='Token editor TODO'><Icon name='edit' /> Edit tokens</button>
      </div>
      <div className='card-body'>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {tokens.map(c => (
            <div key={c.name} style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: 56, background: c.hex }} />
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div className='mono' style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{c.hex}</div>
                <div className='muted' style={{ fontSize: 11, marginTop: 2 }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
