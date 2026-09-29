import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown, ArrowRight, Bell, Box, Check, ChevronDown, Compass, Eye, Heart,
  Layers3, Menu, Plus, Search, SlidersHorizontal, Sparkles, Upload, X,
} from 'lucide-react'

const demoModels = [
  { id: 1, title: 'Mossy Guardian', creator: 'Mina K.', category: 'Characters', likes: '2.4k', views: '18.2k', image: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1000&q=85', color: '#4c6054', badge: 'Staff pick', initials: 'MK' },
  { id: 2, title: 'The Quiet Between', creator: 'Noah Rivera', category: 'Architecture', likes: '1.8k', views: '12.6k', image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85', color: '#524e49', initials: 'NR' },
  { id: 3, title: 'Orbital Study 04', creator: 'Studio Nami', category: 'Abstract', likes: '986', views: '8.1k', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=85', color: '#424d68', initials: 'SN' },
  { id: 4, title: 'Solstice — 1987', creator: 'Theo Park', category: 'Vehicles', likes: '3.1k', views: '24.8k', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85', color: '#665349', initials: 'TP' },
  { id: 5, title: 'Ritual of Bloom', creator: 'Ada Okafor', category: 'Characters', likes: '742', views: '6.4k', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85', color: '#65534f', initials: 'AO' },
  { id: 6, title: 'After the Rain', creator: 'Ivo Martins', category: 'Architecture', likes: '1.2k', views: '10.3k', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85', color: '#4e5865', initials: 'IM' },
  { id: 7, title: 'Soft Machinery', creator: 'Luca D.', category: 'Abstract', likes: '563', views: '4.7k', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=85', color: '#61566c', initials: 'LD' },
  { id: 8, title: 'Little Red Runner', creator: 'Marta S.', category: 'Vehicles', likes: '2k', views: '16.9k', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=85', color: '#74564e', initials: 'MS' },
]
const categories = ['All models', 'Characters', 'Architecture', 'Abstract', 'Vehicles', 'Nature']

function Brand() {
  return <a className="brand" href="#top" aria-label="3DLibrary home"><span className="brand-mark"><Box size={21} strokeWidth={2.2} /></span><span>3D<span className="brand-light">Library</span></span></a>
}

function Header({ search, setSearch, onUpload }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return <header className="site-header" id="top">
    <div className="header-inner">
      <Brand />
      <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`}>
        <a className="nav-link active" href="#explore" onClick={() => setMenuOpen(false)}>Explore</a>
        <a className="nav-link" href="#collections" onClick={() => setMenuOpen(false)}>Collections</a>
        <a className="nav-link" href="#community" onClick={() => setMenuOpen(false)}>Community</a>
      </nav>
      <label className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search 3D models..." /><kbd>⌘ K</kbd></label>
      <div className="header-actions"><button className="icon-btn bell-btn" aria-label="Notifications"><Bell size={18} /><i /></button><button className="upload-btn" onClick={onUpload}><Plus size={17} /> Upload</button><button className="profile-avatar" aria-label="Your profile">J</button><button className="mobile-menu icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X size={21} /> : <Menu size={21} />}</button></div>
    </div>
  </header>
}

function Hero({ onExplore }) {
  return <section className="hero-wrap"><div className="hero-copy"><div className="eyebrow"><span className="pulse-dot" /> THE 3D CREATOR COMMUNITY</div><h1>Find your next<br /><span>dimension.</span></h1><p>Discover, collect, and share an ever-growing universe of 3D creativity — made by artists, for everyone.</p><div className="hero-buttons"><button className="button-primary" onClick={onExplore}>Explore models <ArrowRight size={17} /></button><a className="text-link" href="#community">Meet the community <ArrowDown size={15} /></a></div><div className="hero-proof"><div className="avatar-stack"><span>J</span><span>A</span><span>M</span><span>+</span></div><span><b>180k+</b> artists creating together</span></div></div><div className="hero-art"><div className="hero-art-image" /><div className="hero-glow" /><div className="hero-art-grid" /><div className="floating-chip chip-top"><Sparkles size={14} /> Featured collection</div><div className="floating-chip chip-bottom"><span className="online-dot" /><span><b>Digital daydreams</b><small>by studio.cirrus · 12 models</small></span><ArrowRight size={16} /></div><div className="hero-caption">01 / 08 <span /> A world of form & feeling</div></div></section>
}

function ModelCard({ model, liked, onLike }) {
  return <article className="model-card"><a className="model-image" href="#model" style={{ '--card-color': model.color, backgroundImage: `url(${model.image})` }} aria-label={`Open ${model.title}`}><span className="image-shade" />{model.badge && <span className="card-badge"><Sparkles size={12} /> {model.badge}</span>}<span className="view-model"><Box size={15} /> View model</span><span className="image-count"><Layers3 size={13} /> 3D</span></a><div className="model-info"><div className="model-title-row"><div><a className="model-title" href="#model">{model.title}</a><span className="model-category">{model.category}</span></div><button className={`like-btn ${liked ? 'liked' : ''}`} onClick={() => onLike(model.id)} aria-label={liked ? 'Unlike model' : 'Like model'}><Heart size={17} fill={liked ? 'currentColor' : 'none'} /><span>{model.likes}</span></button></div><div className="creator-row"><span className="creator-avatar" style={{ background: model.color }}>{model.initials}</span><span>{model.creator}</span><span className="creator-spacer" /><Eye size={14} /><span>{model.views}</span></div></div></article>
}

function CategoryPills({ selected, onSelect }) {
  return <div className="category-scroller">{categories.map((item) => <button key={item} className={`category-pill ${selected === item ? 'selected' : ''}`} onClick={() => onSelect(item)}>{item}</button>)}</div>
}

function Collections() {
  const items = [
    { name: 'Worlds to get lost in', by: 'Curated by 3DLibrary', count: '24 models', image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=950&q=85', tone: 'violet' },
    { name: 'Objects with a past', by: 'Curated by Jules M.', count: '18 models', image: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=950&q=85', tone: 'amber' },
    { name: 'A softer kind of future', by: 'Curated by 3DLibrary', count: '32 models', image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=950&q=85', tone: 'blue' },
  ]
  return <section className="collections-section" id="collections"><div className="section-heading"><div><div className="eyebrow muted-eyebrow">HAND-PICKED WORLDS</div><h2>Collections to wander through</h2><p>Thoughtful little corners of the 3D universe.</p></div><a className="view-all-link" href="#collections">All collections <ArrowRight size={16} /></a></div><div className="collection-grid">{items.map((item) => <a className={`collection-card ${item.tone}`} href="#collection" key={item.name} style={{ backgroundImage: `linear-gradient(180deg, transparent 5%, rgba(12,12,17,.1) 35%, rgba(12,12,17,.88) 100%), url(${item.image})` }}><span className="collection-count">{item.count}</span><span className="collection-detail"><small>{item.by}</small><strong>{item.name}</strong><span>Explore collection <ArrowRight size={14} /></span></span></a>)}</div></section>
}

function UploadModal({ onClose }) {
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><section className="upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-title" onClick={(e) => e.stopPropagation()}><button className="modal-close icon-btn" onClick={onClose} aria-label="Close"><X size={19} /></button><div className="modal-icon"><Upload size={23} /></div><div className="eyebrow muted-eyebrow">YOUR NEXT CREATION</div><h2 id="upload-title">Bring it into the world.</h2><p>Share a model with the 3DLibrary community. Uploading will be available once your creator account is set up.</p><div className="dropzone"><Upload size={22} /><strong>Drop your 3D file here</strong><span>GLB, GLTF, OBJ or FBX · up to 100 MB</span><button className="button-primary" onClick={onClose}>Got it <Check size={16} /></button></div><span className="modal-note">By uploading, you confirm that you have the rights to share this work.</span></section></div>
}

function App() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All models')
  const [liked, setLiked] = useState([])
  const [models, setModels] = useState(demoModels)
  const [showUpload, setShowUpload] = useState(false)
  const [sortMenu, setSortMenu] = useState(false)
  const [sortBy, setSortBy] = useState('Trending')
  const [loadCount, setLoadCount] = useState(8)
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/models/'
    fetch(apiUrl).then((response) => response.ok ? response.json() : null).then((data) => {
      const list = Array.isArray(data) ? data : data?.results
      if (list?.length) setModels(list.map((item, index) => ({ ...item, id: item.id ?? index, creator: item.creator || '3DLibrary artist', likes: item.likes ?? '0', views: item.views ?? '0', image: item.thumbnail_url || item.image || demoModels[index % demoModels.length].image, category: item.category_name || item.category || '3D Art', initials: (item.creator || '3D').slice(0, 2).toUpperCase() })))
    }).catch(() => {})
  }, [])
  const filteredModels = useMemo(() => {
    let result = models.filter((model) => (selectedCategory === 'All models' || model.category === selectedCategory) && `${model.title} ${model.creator} ${model.category}`.toLowerCase().includes(search.toLowerCase()))
    if (sortBy === 'Most liked') result = [...result].reverse()
    return result
  }, [models, selectedCategory, search, sortBy])
  const toggleLike = (id) => setLiked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const scrollToExplore = () => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })
  return <><Header search={search} setSearch={setSearch} onUpload={() => setShowUpload(true)} /><main><div className="page-shell"><Hero onExplore={scrollToExplore} /><section className="discover-section" id="explore"><div className="section-heading discover-heading"><div><div className="eyebrow muted-eyebrow">A LITTLE INSPIRATION</div><h2>Made to be discovered<span className="heading-period">.</span></h2><p>Fresh perspectives, just added to the library.</p></div><button className="filters-button" onClick={() => setSortMenu(!sortMenu)}><SlidersHorizontal size={15} /> <span>{sortBy}</span><ChevronDown size={14} /></button>{sortMenu && <div className="sort-menu">{['Trending', 'Most liked'].map((sort) => <button key={sort} onClick={() => { setSortBy(sort); setSortMenu(false) }}>{sort}{sortBy === sort && <Check size={14} />}</button>)}</div>}</div><CategoryPills selected={selectedCategory} onSelect={setSelectedCategory} />{filteredModels.length ? <div className="model-grid">{filteredModels.slice(0, loadCount).map((model) => <ModelCard key={model.id} model={model} liked={liked.includes(model.id)} onLike={toggleLike} />)}</div> : <div className="empty-state"><Compass size={28} /><strong>No models found</strong><span>Try a different search or category.</span></div>}<div className="load-more-wrap"><button className="load-more" onClick={() => setLoadCount(loadCount + 8)}>Load more models <ArrowDown size={15} /></button></div></section><Collections /><section className="creator-cta" id="community"><div className="cta-orb orb-one" /><div className="cta-orb orb-two" /><div className="cta-copy"><span className="eyebrow">MADE BY YOU, FOR EVERYONE</span><h2>Your imagination<br />has a place here.</h2><p>Join a community of curious makers sharing work, ideas, and the occasional happy accident.</p><button className="button-light" onClick={() => setShowUpload(true)}>Start creating <ArrowRight size={16} /></button></div><div className="cta-graphic"><div className="graphic-ring ring-a" /><div className="graphic-ring ring-b" /><div className="graphic-core"><Box size={56} strokeWidth={1.15} /></div><span className="graphic-star star-a">✳</span><span className="graphic-star star-b">✦</span><span className="graphic-label">YOUR NEXT IDEA<br />IS WAITING</span></div></section><footer className="footer"><Brand /><span>Made for the love of making things.</span><div className="footer-links"><a href="#explore">Explore</a><a href="#collections">Collections</a><a href="#community">About us</a></div><span className="copyright">© 2026 3DLibrary</span></footer></div></main>{showUpload && <UploadModal onClose={() => setShowUpload(false)} />}</>
}

export default App
