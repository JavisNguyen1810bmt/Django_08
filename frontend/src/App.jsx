import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  Search, Box, Upload, Users, ShoppingBag, Globe,
  Layers, RefreshCw, Sun, ChevronDown, Sparkles, CheckCircle2,
  Maximize2, Download, Folder, Bot, Eye, EyeOff, ShoppingCart, Sliders,
  Handshake, Tag, BookOpen, X, Heart, Menu, Lock, Mail, User,
  ArrowRight, ShieldCheck, Minimize2, Grid, Filter, Star, MessageSquare,
  Share2, FileText, Check, LayoutDashboard, Plus, Trash2, ExternalLink,
  TrendingUp, DollarSign, Compass, Settings, AlertCircle
} from 'lucide-react'
import './styles.css'

// ---------------------------------------------------------
// DATA MẪU MÔ HÌNH 3D CHUẨN MARKETPLACE
// ---------------------------------------------------------
const SAMPLE_MODELS = [
  {
    id: 1,
    title: 'Cyberpunk Mech Armor Unit X-1',
    author: 'Alex3D_Studio',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    category: 'Sci-Fi',
    views: '12.4k',
    likes: 842,
    polygons: '45,210',
    vertices: '28,100',
    formats: ['GLTF', 'FBX', 'OBJ'],
    textures: '4K PBR',
    badge: 'Staff Pick',
    price: 'Free',
    rating: 4.9,
    description: 'High-poly rigged cyberpunk mech warrior model with emissive PBR textures. Ready for games and CGI renders.',
    color: '#1caad9'
  },
  {
    id: 2,
    title: 'Vintage Mid-Century Armchair',
    author: 'InteriorLab',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    category: 'Architecture',
    views: '8.1k',
    likes: 512,
    polygons: '12,400',
    vertices: '8,900',
    formats: ['GLTF', 'OBJ'],
    textures: '2K PBR',
    badge: 'PBR Ready',
    price: '$15',
    rating: 4.8,
    description: 'Ultra-realistic modern leather armchair designed for architectural visualization and interior design.',
    color: '#e91e63'
  },
  {
    id: 3,
    title: 'Futuristic Hover Hypercar Concept',
    author: 'SpeedMaster',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&auto=format&fit=crop&q=80',
    category: 'Vehicles',
    views: '24.9k',
    likes: 1940,
    polygons: '88,500',
    vertices: '52,300',
    formats: ['GLTF', 'FBX'],
    textures: '4K PBR',
    badge: 'Trending',
    price: 'Free',
    rating: 5.0,
    description: 'Concept sci-fi hovering sports car featuring animated thrusters and detailed interior mesh.',
    color: '#9c27b0'
  },
  {
    id: 4,
    title: 'Stylized Fantasy Warrior Character',
    author: 'AnimeCrafter',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    category: 'Characters',
    views: '31.2k',
    likes: 2410,
    polygons: '24,150',
    vertices: '15,600',
    formats: ['GLTF', 'FBX', 'BLEND'],
    textures: '2K Hand-painted',
    badge: 'Rigged',
    price: '$29',
    rating: 4.9,
    description: 'Low-poly stylized fantasy female warrior fully rigged with Mixamo compatible skeleton.',
    color: '#4caf50'
  },
  {
    id: 5,
    title: 'Ancient Feudal Samurai Helmet',
    author: 'HistoryVault',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    category: 'Characters',
    views: '6.7k',
    likes: 420,
    polygons: '18,900',
    vertices: '11,200',
    formats: ['GLTF', 'OBJ'],
    textures: '4K Photogrammetry',
    badge: '3D Scan',
    price: 'Free',
    rating: 4.7,
    description: '3D photogrammetry scan of a historical Japanese Samurai Kabuto helmet with worn metallic shaders.',
    color: '#ff9800'
  },
  {
    id: 6,
    title: 'Modular Sci-Fi Facility Corridor',
    author: 'LevelArtisan',
    avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&auto=format&fit=crop&q=80',
    category: 'Sci-Fi',
    views: '15.8k',
    likes: 1120,
    polygons: '62,000',
    vertices: '39,400',
    formats: ['GLTF', 'FBX'],
    textures: '4K Modular',
    badge: 'Game Ready',
    price: '$19',
    rating: 4.8,
    description: 'Complete modular kit for building sci-fi space station environments with grid snapping alignment.',
    color: '#00bcd4'
  }
]

// ---------------------------------------------------------
// THREE.JS VIEWPORT & INSPECTOR COMPONENT
// ---------------------------------------------------------
function Advanced3DViewer({ height = '450px', envLight = 'studio', showGrid = true }) {
  const mountRef = useRef(null)
  const [wireframe, setWireframe] = useState(false)
  const [rotating, setRotating] = useState(true)
  const [gridVisible, setGridVisible] = useState(showGrid)

  const wireRef = useRef(wireframe)
  const rotRef = useRef(rotating)
  const envRef = useRef(envLight)

  useEffect(() => { wireRef.current = wireframe }, [wireframe])
  useEffect(() => { rotRef.current = rotating }, [rotating])
  useEffect(() => { envRef.current = envLight }, [envLight])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f1015)

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 1.2, 4.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    mount.appendChild(renderer.domElement)

    // Lights Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0x1caad9, 2.5)
    dirLight1.position.set(5, 5, 5)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0xff5500, 1.5)
    dirLight2.position.set(-5, -2, -3)
    scene.add(dirLight2)

    // Grid Floor
    const gridHelper = new THREE.GridHelper(10, 20, 0x1caad9, 0x2a2d35)
    gridHelper.position.y = -0.8
    scene.add(gridHelper)

    // 3D Model Group Placeholder
    const group = new THREE.Group()

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1caad9, metalness: 0.8, roughness: 0.2 })
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x30363d, metalness: 0.9, roughness: 0.3 })
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })

    const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 2), bodyMat)
    group.add(coreMesh)

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 16, 100), metalMat)
    ring1.rotation.x = Math.PI / 3
    group.add(ring1)

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.02, 16, 100), glowMat)
    ring2.rotation.y = Math.PI / 4
    group.add(ring2)

    scene.add(group)

    // Interactivity
    let isDragging = false
    let prevMouse = { x: 0, y: 0 }

    const onMouseDown = (e) => {
      isDragging = true
      prevMouse = { x: e.clientX, y: e.clientY }
    }

    const onMouseMove = (e) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouse.x
      const deltaY = e.clientY - prevMouse.y
      group.rotation.y += deltaX * 0.008
      group.rotation.x += deltaY * 0.008
      prevMouse = { x: e.clientX, y: e.clientY }
    }

    const onMouseUp = () => { isDragging = false }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    let reqId
    const animate = () => {
      reqId = requestAnimationFrame(animate)

      bodyMat.wireframe = wireRef.current
      metalMat.wireframe = wireRef.current
      gridHelper.visible = gridVisible

      if (rotRef.current && !isDragging) {
        group.rotation.y += 0.006
        ring1.rotation.z += 0.01
        ring2.rotation.x += 0.008
      }

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mount) return
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      dom.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('resize', handleResize)
      if (mount.contains(dom)) mount.removeChild(dom)
    }
  }, [gridVisible])

  return (
    <div className="viewer-container" style={{ height }}>
      <div className="viewer-canvas" ref={mountRef} />
      
      {/* Control Overlay */}
      <div className="viewer-toolbar">
        <button
          className={`toolbar-btn ${wireframe ? 'active' : ''}`}
          onClick={() => setWireframe(!wireframe)}
          title="Toggle Wireframe Shader"
        >
          <Layers size={14} /> Wireframe
        </button>
        <button
          className={`toolbar-btn ${rotating ? 'active' : ''}`}
          onClick={() => setRotating(!rotating)}
          title="Toggle Auto-Rotation"
        >
          <RefreshCw size={14} /> Auto-Rotate
        </button>
        <button
          className={`toolbar-btn ${gridVisible ? 'active' : ''}`}
          onClick={() => setGridVisible(!gridVisible)}
          title="Toggle Ground Grid"
        >
          <Grid size={14} /> Grid Sàn
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// AUTHENTICATION MODAL (LOGIN / SIGNUP)
// ---------------------------------------------------------
function AuthModal({ isOpen, mode, onClose, showToast }) {
  const [currentMode, setCurrentMode] = useState(mode)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  useEffect(() => { setCurrentMode(mode) }, [mode])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    showToast(currentMode === 'login' ? 'Đăng nhập thành công!' : 'Tạo tài khoản thành công! Tận hưởng 3DLibrary.')
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog auth-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{currentMode === 'login' ? 'Đăng nhập 3DLibrary' : 'Tạo tài khoản 3DLibrary'}</h3>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${currentMode === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentMode('login')}
          >
            ĐĂNG NHẬP
          </button>
          <button
            className={`auth-tab ${currentMode === 'signup' ? 'active' : ''}`}
            onClick={() => setCurrentMode('signup')}
          >
            ĐĂNG KÝ
          </button>
        </div>

        <div className="modal-body">
          <div className="social-login-group">
            <button className="btn-social btn-epic" onClick={() => { showToast('Đăng nhập bằng Epic Games thành công'); onClose(); }}>
              <span>⚡</span> EPIC GAMES ACCOUNT
            </button>
            <div className="social-grid">
              <button className="btn-social-sub" onClick={() => { showToast('Đăng nhập với Google'); onClose(); }}>Google</button>
              <button className="btn-social-sub" onClick={() => { showToast('Đăng nhập với Apple'); onClose(); }}>Apple ID</button>
            </div>
          </div>

          <div className="divider"><span>HOẶC EMAIL</span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            {currentMode === 'signup' && (
              <div className="form-group">
                <label><User size={13} /> Họ & Tên / Username</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Creator"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label><Mail size={13} /> Địa chỉ Email</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label><Lock size={13} /> Mật khẩu</label>
              <div className="input-pass-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="pass-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit-primary">
              {currentMode === 'login' ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN MIỄN PHÍ'}
            </button>
          </form>
        </div>

        <div className="modal-footer">
          <ShieldCheck size={14} color="var(--accent)" /> Bảo mật kết nối mã hóa SSL 256-bit
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------
// MAIN APPLICATION (FULL OFFICIAL WEB IMPLEMENTATION)
// ---------------------------------------------------------
export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState('explore') // 'explore', 'marketplace', 'upload', 'dashboard'
  const [exploreDropdown, setExploreDropdown] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auth Modal State
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('All')

  // Liked & Saved Models
  const [likedModels, setLikedModels] = useState({})
  const [selectedModel, setSelectedModel] = useState(null)

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'Sci-Fi',
    price: 'Free',
    description: '',
    fileUploaded: false
  })

  // Toast System
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const toggleLike = (id, e) => {
    e?.stopPropagation()
    setLikedModels(prev => {
      const isLiked = !prev[id]
      showToast(isLiked ? 'Đã thêm vào Danh sách Yêu thích!' : 'Đã xóa khỏi Danh sách Yêu thích.')
      return { ...prev, [id]: isLiked }
    })
  }

  // Filter Logic
  const filteredModels = SAMPLE_MODELS.filter(model => {
    const matchesSearch = model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          model.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || model.category === selectedCategory
    const matchesPrice = selectedPriceFilter === 'All' ||
                          (selectedPriceFilter === 'Free' && model.price === 'Free') ||
                          (selectedPriceFilter === 'Paid' && model.price !== 'Free')
    return matchesSearch && matchesCategory && matchesPrice
  })

  return (
    <div className="app-root">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`toast-box ${toast.type}`}>
          <CheckCircle2 size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER NAVBAR */}
      <header className="navbar">
        <div className="navbar-container">
          {/* LOGO BRAND */}
          <div className="brand-logo" onClick={() => setCurrentTab('explore')}>
            <span className="logo-icon"><Box size={20} strokeWidth={2.5} /></span>
            <div className="logo-text">
              <span className="title">3DLibrary</span>
              <span className="sub">ECOSYSTEM</span>
            </div>
          </div>

          {/* MAIN DESKTOP NAVIGATION */}
          <nav className="nav-links">
            <button
              className={`nav-item ${currentTab === 'explore' ? 'active' : ''}`}
              onClick={() => setCurrentTab('explore')}
            >
              <Compass size={15} /> KHÁM PHÁ
            </button>

            <button
              className={`nav-item ${currentTab === 'marketplace' ? 'active' : ''}`}
              onClick={() => setCurrentTab('marketplace')}
            >
              <ShoppingBag size={15} /> CHỢ MẪU 3D
            </button>

            <button
              className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentTab('dashboard')}
            >
              <LayoutDashboard size={15} /> DASHBOARD
            </button>
          </nav>

          {/* GLOBAL SEARCH BAR */}
          <div className="search-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm mô hình 3D, tác giả, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-btn" onClick={() => setSearchQuery('')}><X size={14} /></button>
            )}
          </div>

          {/* USER ACTIONS */}
          <div className="nav-actions">
            <button className="btn-text" onClick={() => setAuthModal({ open: true, mode: 'login' })}>
              Đăng Nhập
            </button>
            <button
              className="btn-upload"
              onClick={() => setCurrentTab('upload')}
            >
              <Upload size={14} /> TẢI LÊN
            </button>
            <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {mobileMenuOpen && (
          <div className="mobile-drawer">
            <button onClick={() => { setCurrentTab('explore'); setMobileMenuOpen(false); }}>Khám phá 3D Feed</button>
            <button onClick={() => { setCurrentTab('marketplace'); setMobileMenuOpen(false); }}>Chợ Mẫu 3D</button>
            <button onClick={() => { setCurrentTab('upload'); setMobileMenuOpen(false); }}>Tải Lên Mẫu 3D</button>
            <button onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}>Dashboard Cá Nhân</button>
            <hr />
            <button onClick={() => { setAuthModal({ open: true, mode: 'login' }); setMobileMenuOpen(false); }}>Đăng Nhập / Đăng Ký</button>
          </div>
        )}
      </header>

      {/* BODY CONTENT SWITCHER */}
      <main className="main-content">
        {/* =========================================================
            VIEW 1: EXPLORE / HOME FEED
            ========================================================= */}
        {currentTab === 'explore' && (
          <div className="view-explore">
            {/* HERO PROMO */}
            <section className="hero-banner">
              <div className="hero-text">
                <span className="badge-pill"><Sparkles size={13} /> WEBGL 2.0 REALTIME PBR ENGINE</span>
                <h1>Nền tảng chia sẻ & kinh doanh <span>Tài nguyên 3D hàng đầu</span></h1>
                <p>Khám phá hàng triệu mẫu 3D chất lượng cao, kiểm tra Shading trực tiếp trên trình duyệt và nhúng vào ứng dụng Web/AR dễ dàng.</p>
                <div className="hero-actions">
                  <button className="btn-primary-large" onClick={() => setCurrentTab('marketplace')}>
                    KHÁM PHÁ CHỢ MẪU 3D <ArrowRight size={16} />
                  </button>
                  <button className="btn-secondary-large" onClick={() => setCurrentTab('upload')}>
                    ĐĂNG TẢI TÁC PHẨM
                  </button>
                </div>
              </div>

              <div className="hero-viewport-card">
                <div className="card-header-bar">
                  <span className="dot active"></span>
                  <span>Interactive 3D Preview — Sci-Fi Reactor</span>
                </div>
                <Advanced3DViewer height="340px" />
              </div>
            </section>

            {/* CATEGORY SELECTOR */}
            <section className="category-bar">
              <div className="cat-scroll">
                {['All', 'Sci-Fi', 'Characters', 'Vehicles', 'Architecture'].map(cat => (
                  <button
                    key={cat}
                    className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            {/* ASSET GALLERY GRID */}
            <section className="gallery-section">
              <div className="gallery-header">
                <h3>Mô Hình 3D Nổi Bật</h3>
                <span className="count-badge">{filteredModels.length} Tác phẩm</span>
              </div>

              <div className="asset-grid">
                {filteredModels.map(item => (
                  <div
                    key={item.id}
                    className="asset-card"
                    onClick={() => setSelectedModel(item)}
                  >
                    <div className="card-thumb" style={{ background: `radial-gradient(circle, ${item.color}22 0%, #15161b 100%)` }}>
                      <span className="tag-badge">{item.badge}</span>
                      <button
                        className={`fav-btn ${likedModels[item.id] ? 'active' : ''}`}
                        onClick={(e) => toggleLike(item.id, e)}
                      >
                        <Heart size={15} fill={likedModels[item.id] ? '#e91e63' : 'none'} color={likedModels[item.id] ? '#e91e63' : '#fff'} />
                      </button>
                      <div className="hover-preview-btn">
                        <Eye size={14} /> Xem Mô Hình 3D
                      </div>
                    </div>

                    <div className="card-info">
                      <h4 className="title">{item.title}</h4>
                      <div className="author">
                        <img src={item.avatar} alt={item.author} />
                        <span>{item.author}</span>
                      </div>
                      <div className="meta-row">
                        <div className="stats">
                          <span><Eye size={12} /> {item.views}</span>
                          <span><Heart size={12} /> {item.likes + (likedModels[item.id] ? 1 : 0)}</span>
                        </div>
                        <span className={`price ${item.price === 'Free' ? 'free' : ''}`}>{item.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            VIEW 2: MARKETPLACE STORE
            ========================================================= */}
        {currentTab === 'marketplace' && (
          <div className="view-marketplace">
            <div className="marketplace-header">
              <h2>Chợ Tài Nguyên 3D Commercial</h2>
              <p>Mua bán các Mẫu 3D chất lượng cao sẵn sàng cho Game Engine, VR/AR và Visual Effects.</p>
            </div>

            {/* FILTER TOOLBAR */}
            <div className="marketplace-filter-bar">
              <div className="filter-group">
                <Filter size={15} />
                <span>Bộ lọc:</span>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="All">Tất cả Danh mục</option>
                  <option value="Sci-Fi">Sci-Fi & Cyberpunk</option>
                  <option value="Characters">Nhân vật & Creatures</option>
                  <option value="Vehicles">Phương tiện & Động cơ</option>
                  <option value="Architecture">Kiến trúc & Nội thất</option>
                </select>

                <select value={selectedPriceFilter} onChange={(e) => setSelectedPriceFilter(e.target.value)}>
                  <option value="All">Tất cả Giá</option>
                  <option value="Free">Miễn phí (Free)</option>
                  <option value="Paid">Trả phí (Commercial)</option>
                </select>
              </div>

              <div className="results-count">
                Hiển thị {filteredModels.length} kết quả
              </div>
            </div>

            {/* MARKETPLACE ASSET GRID */}
            <div className="asset-grid">
              {filteredModels.map(item => (
                <div key={item.id} className="asset-card" onClick={() => setSelectedModel(item)}>
                  <div className="card-thumb" style={{ background: `radial-gradient(circle, ${item.color}25 0%, #15161b 100%)` }}>
                    <span className="tag-badge">{item.badge}</span>
                    <div className="rating-pill"><Star size={12} fill="#ffb400" color="#ffb400" /> {item.rating}</div>
                  </div>
                  <div className="card-info">
                    <h4 className="title">{item.title}</h4>
                    <p className="desc-short">{item.description}</p>
                    <div className="tech-tags">
                      <span>{item.polygons} Polys</span>
                      <span>{item.textures}</span>
                    </div>
                    <div className="meta-row border-top">
                      <div className="author">
                        <img src={item.avatar} alt={item.author} />
                        <span>{item.author}</span>
                      </div>
                      <span className={`price ${item.price === 'Free' ? 'free' : ''}`}>{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 3: UPLOAD STUDIO PORTAL
            ========================================================= */}
        {currentTab === 'upload' && (
          <div className="view-upload">
            <div className="upload-container">
              <h2>Studio Đăng Tải Mô Hình 3D</h2>
              <p>Đăng tải mô hình 3D định dạng .GLTF, .GLB, .FBX hoặc .OBJ lên nền tảng.</p>

              <div className="upload-grid">
                {/* Drag and Drop Zone */}
                <div
                  className={`dropzone ${uploadData.fileUploaded ? 'uploaded' : ''}`}
                  onClick={() => {
                    setUploadData({ ...uploadData, fileUploaded: true })
                    showToast('Đã nhận diện File 3D: model_asset_v1.glb (24.8 MB)')
                  }}
                >
                  <Upload size={40} color="var(--accent)" />
                  {uploadData.fileUploaded ? (
                    <div className="uploaded-file-info">
                      <CheckCircle2 size={24} color="#4caf50" />
                      <h4>model_asset_v1.glb</h4>
                      <p>Kích thước: 24.8 MB &bull; Định dạng: WebGL Binary GLTF</p>
                      <span className="change-link">Bấm để thay đổi File</span>
                    </div>
                  ) : (
                    <>
                      <h3>Kéo & thả File 3D vào đây</h3>
                      <p>Hỗ trợ định dạng .GLTF, .GLB, .FBX, .OBJ, .ZIP (Tối đa 200MB)</p>
                      <button className="btn-browse">CHỌN FILE TỪ MÁY TÍNH</button>
                    </>
                  )}
                </div>

                {/* Metadata Form */}
                <form className="upload-form" onSubmit={(e) => {
                  e.preventDefault()
                  if (!uploadData.fileUploaded) {
                    showToast('Vui lòng chọn File 3D trước khi đăng!', 'error')
                    return
                  }
                  showToast('Đăng tải Mẫu 3D thành công! Đã thêm vào Dashboard của bạn.')
                  setCurrentTab('dashboard')
                }}>
                  <div className="form-group">
                    <label>Tên Mẫu 3D *</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Sci-Fi Drone Mech 3D"
                      value={uploadData.title}
                      onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Danh mục</label>
                      <select
                        value={uploadData.category}
                        onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                      >
                        <option>Sci-Fi</option>
                        <option>Characters</option>
                        <option>Vehicles</option>
                        <option>Architecture</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Thiết lập Giá</label>
                      <select
                        value={uploadData.price}
                        onChange={(e) => setUploadData({ ...uploadData, price: e.target.value })}
                      >
                        <option value="Free">Miễn phí (Free)</option>
                        <option value="$9.00">$9.00 Commercial</option>
                        <option value="$19.00">$19.00 Commercial</option>
                        <option value="$49.00">$49.00 Enterprise</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Mô tả Mô hình</label>
                    <textarea
                      rows="4"
                      placeholder="Mô tả số lượng Polygon, PBR Textures, UV Maps hoặc hướng dẫn sử dụng..."
                      value={uploadData.description}
                      onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-publish">
                    XÁC NHẬN ĐĂNG MẪU 3D
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 4: CREATOR DASHBOARD
            ========================================================= */}
        {currentTab === 'dashboard' && (
          <div className="view-dashboard">
            <div className="dashboard-header">
              <div className="user-profile-summary">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                <div>
                  <h2>Alex3D_Studio <span className="pro-badge">PRO CREATOR</span></h2>
                  <p>3D Generalist & Shader Artist &bull; Tham gia từ tháng 1/2025</p>
                </div>
              </div>
              <button className="btn-secondary-large" onClick={() => setCurrentTab('upload')}>
                <Plus size={15} /> ĐĂNG MÔ HÌNH MỚI
              </button>
            </div>

            {/* ANALYTICS STATS */}
            <div className="analytics-grid">
              <div className="stat-card">
                <div className="stat-title">TỔNG LƯỢT XEM</div>
                <div className="stat-value">148,290</div>
                <div className="stat-trend positive"><TrendingUp size={14} /> +12% tháng này</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">LƯỢT TẢI VỀ</div>
                <div className="stat-value">12,450</div>
                <div className="stat-trend positive"><TrendingUp size={14} /> +8% tháng này</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">DOANH THU THÁNG</div>
                <div className="stat-value">$1,240.00</div>
                <div className="stat-trend positive"><DollarSign size={14} /> Rut về Paypal</div>
              </div>
            </div>

            {/* DASHBOARD TABBED LIST */}
            <div className="dashboard-models-section">
              <h3>Mô hình đã đăng (4)</h3>
              <div className="dashboard-table">
                <div className="table-row header">
                  <span>Mô hình</span>
                  <span>Danh mục</span>
                  <span>Giá</span>
                  <span>Lượt xem</span>
                  <span>Thao tác</span>
                </div>

                {SAMPLE_MODELS.slice(0, 4).map(item => (
                  <div key={item.id} className="table-row">
                    <div className="model-col">
                      <div className="mini-thumb" style={{ background: item.color }}></div>
                      <span>{item.title}</span>
                    </div>
                    <span>{item.category}</span>
                    <span className="price">{item.price}</span>
                    <span>{item.views}</span>
                    <div className="action-btns">
                      <button className="icon-btn" title="Xem" onClick={() => setSelectedModel(item)}><Eye size={15} /></button>
                      <button className="icon-btn danger" title="Xóa" onClick={() => showToast('Đã xóa mô hình khỏi hệ thống.')}><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          LIGHTBOX MODAL: FULL ASSET DETAIL & DOWNLOAD
          ========================================================= */}
      {selectedModel && (
        <div className="modal-backdrop" onClick={() => setSelectedModel(null)}>
          <div className="asset-detail-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <div>
                <h3>{selectedModel.title}</h3>
                <p className="sub-author">Đăng bởi <strong>{selectedModel.author}</strong> &bull; Danh mục: {selectedModel.category}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedModel(null)}><X size={20} /></button>
            </div>

            <div className="detail-body-grid">
              {/* 3D Interactive Viewport */}
              <div className="detail-viewport-col">
                <Advanced3DViewer height="100%" />
              </div>

              {/* Specs and Download Side Panel */}
              <div className="detail-specs-col">
                <div className="price-box">
                  <span className="label">Giá sở hữu:</span>
                  <span className="amount">{selectedModel.price}</span>
                </div>

                <div className="specs-list">
                  <h4>THÔNG SỐ KỸ THUẬT</h4>
                  <div className="spec-item">
                    <span>Số Polygon (Mesh):</span>
                    <strong>{selectedModel.polygons}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Số Đỉnh (Vertices):</span>
                    <strong>{selectedModel.vertices}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Định dạng File:</span>
                    <strong>{selectedModel.formats.join(', ')}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Texture Resolution:</span>
                    <strong>{selectedModel.textures}</strong>
                  </div>
                  <div className="spec-item">
                    <span>Giấy phép (License):</span>
                    <strong>Standard Commercial</strong>
                  </div>
                </div>

                <div className="action-button-group">
                  <button
                    className="btn-download-primary"
                    onClick={() => {
                      showToast(`Đang khởi tạo tải xuống file ${selectedModel.title} (.GLTF)...`)
                    }}
                  >
                    <Download size={16} /> TẢI MẪU 3D NGAY
                  </button>

                  <button
                    className="btn-favorite-secondary"
                    onClick={(e) => toggleLike(selectedModel.id, e)}
                  >
                    <Heart size={16} fill={likedModels[selectedModel.id] ? '#e91e63' : 'none'} />
                    {likedModels[selectedModel.id] ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={authModal.open}
        mode={authModal.mode}
        onClose={() => setAuthModal({ ...authModal, open: false })}
        showToast={showToast}
      />

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col">
            <div className="brand-logo mb-12">
              <span className="logo-icon"><Box size={18} /></span>
              <span className="title">3DLibrary</span>
            </div>
            <p className="footer-desc">Nền tảng chia sẻ, hiển thị và thương mại hóa tài nguyên 3D WebGL thế hệ mới.</p>
          </div>

          <div className="footer-col">
            <h4>SẢN PHẨM</h4>
            <a href="#">WebGL 3D Viewer</a>
            <a href="#">3D Marketplace</a>
            <a href="#">AR Configurator</a>
            <a href="#">API cho Nhà phát triển</a>
          </div>

          <div className="footer-col">
            <h4>CỘNG ĐỒNG</h4>
            <a href="#">Diễn đàn 3D Artist</a>
            <a href="#">Hướng dẫn & Docs</a>
            <a href="#">Discord Community</a>
          </div>

          <div className="footer-col">
            <h4>PHÁP LÝ</h4>
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Bản quyền tác giả</a>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 3DLibrary, Inc. All rights reserved. Powered by WebGL 2.0 & Three.js.
        </div>
      </footer>
    </div>
  )
}