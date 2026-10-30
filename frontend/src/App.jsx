import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import {
  apiRequest,
  buffWalletBalance,
  downloadProduct,
  getApiBaseUrl,
  getWallet,
  purchaseProduct,
} from './api'
import {
  Search, Box, Upload, Users, ShoppingBag, Globe,
  Layers, RefreshCw, Sun, ChevronDown, Sparkles, CheckCircle2,
  Maximize2, Download, Folder, Bot, Eye, EyeOff, ShoppingCart, Sliders,
  Handshake, Tag, BookOpen, X, Heart, Menu, Lock, Mail, User,
  ArrowRight, ShieldCheck, Minimize2, Grid, Filter, Star, MessageSquare,
  Share2, FileText, Check, LayoutDashboard, Plus, ExternalLink,
  TrendingUp, Compass, Settings, AlertCircle, Wallet as WalletIcon,
  Zap, QrCode
} from 'lucide-react'
import './styles.css'

const imageUrl = (path) => {
  if (!path) return ''
  try {
    return new URL(path, `${getApiBaseUrl()}/`).href
  } catch {
    return ''
  }
}

const normalizeProduct = (product, index) => ({
  ...product,
  author: product.artist_name || product.artist || product.creator || '3D Creator',
  category: product.category_name || 'Other',
  priceAmount: Number(product.price || 0),
  modelUrl: imageUrl(product.model_url || product.preview_file),
  views: Number(product.views || 0).toLocaleString(),
  likes: Number(product.likes || 0),
  polygons: Number(product.polygon_count || 0).toLocaleString(),
  vertices: '—',
  formats: (product.file_format || '3D').split(',').map((format) => format.trim()),
  textures: '—',
  badge: Number(product.price) === 0 ? 'Free' : 'Marketplace',
  price: Number(product.price) === 0 ? 'Free' : `$${Number(product.price).toFixed(2)}`,
  rating: 0,
  color: ['#1caad9', '#e91e63', '#9c27b0', '#4caf50', '#ff9800'][index % 5],
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
  thumbnailUrl: imageUrl(product.thumbnail_url || product.image),
})

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

function AdminBuffModal({ currentUsername, token, onClose, onBalance, showToast }) {
  const [username, setUsername] = useState(currentUsername)
  const [amount, setAmount] = useState('50')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = await buffWalletBalance({ username: username.trim(), amount }, token)
      if (result.username === currentUsername) onBalance(result.balance)
      showToast(`Đã cộng $${Number(result.amount_added).toFixed(2)} vào ví ${result.username}.`)
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop wallet-modal-backdrop" onClick={onClose}>
      <section className="wallet-dialog admin-buff-dialog" role="dialog" aria-modal="true" aria-labelledby="buff-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="wallet-dialog-header">
          <div><Zap size={19} /><h3 id="buff-modal-title">Buff tiền ảo (Admin)</h3></div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng"><X size={18} /></button>
        </div>
        <form className="wallet-modal-content" onSubmit={handleSubmit}>
          <label htmlFor="buff-username">Tên tài khoản</label>
          <input id="buff-username" value={username} onChange={(event) => setUsername(event.target.value)} required />
          <label htmlFor="buff-amount">Số tiền cộng (USD)</label>
          <div className="wallet-quick-amounts">
            {[50, 100, 500].map((value) => (
              <button key={value} type="button" className={Number(amount) === value ? 'active' : ''} onClick={() => setAmount(String(value))}>+${value}</button>
            ))}
          </div>
          <input id="buff-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn-submit-primary" type="submit" disabled={submitting}>
            {submitting ? 'ĐANG CẬP NHẬT...' : 'CỘNG TIỀN VÀO VÍ'}
          </button>
        </form>
      </section>
    </div>
  )
}

function WalletTopUpModal({
  payment,
  username,
  token,
  onBalance,
  onClose,
}) {
  const [checking, setChecking] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const rate = Number(payment.exchangeRate || 25000)
  const topUpVnd = Math.ceil(Number(payment.shortfall || 0) * rate)
  const transferContent = `NAPTIEN ${username} ${topUpVnd}`
  const bank = payment.bank
  const qrUrl = bank
    ? `https://vietqr.app/img?acc=68618102007&bank=MBBank&holder=NGUYEN HUU HOANG NAM&store=3dstore&template=compact&showinfo=true${encodeURIComponent(bank.bin)}-${encodeURIComponent(bank.account)}-compact2.png?amount=${topUpVnd}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bank.account_name)}`
    : `https://vietqr.app/img?acc=68618102007&bank=MBBank&holder=NGUYEN HUU HOANG NAM&store=3dstore&template=compact&showinfo=true=${encodeURIComponent(transferContent)}`

  const checkBalance = async () => {
    setChecking(true)
    setStatusMessage('')
    try {
      const wallet = await getWallet(token)
      onBalance(wallet.balance)
      if (Number(wallet.balance) >= Number(payment.required_amount)) {
        setStatusMessage('Số dư đã đủ. Đóng cửa sổ này và bấm MUA NGAY để hoàn tất thanh toán.')
      } else {
        setStatusMessage('Chưa ghi nhận tiền vào ví. Việc nạp tiền cần được Admin xác nhận.')
      }
    } catch (error) {
      setStatusMessage(`Không kiểm tra được số dư: ${error.message}`)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="modal-backdrop wallet-modal-backdrop" onClick={onClose}>
      <section className="wallet-dialog topup-dialog" role="dialog" aria-modal="true" aria-labelledby="topup-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="wallet-dialog-header">
          <div><QrCode size={19} /><h3 id="topup-modal-title">Nạp tiền vào ví</h3></div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng"><X size={18} /></button>
        </div>
        <div className="topup-content">
          <p className="topup-insufficient">
            Số dư ví không đủ (Hiện có: <strong>${Number(payment.current_balance).toFixed(2)}</strong>,
            {' '}Cần: <strong>${Number(payment.required_amount).toFixed(2)}</strong>)
          </p>
          <div className="topup-qr-wrap"><img src={qrUrl} alt="Mã QR chuyển khoản nạp tiền ví" /></div>
          <div className="topup-transfer-details">
            <h4>Thông tin chuyển khoản</h4>
            {bank ? (
              <>
                <p>Ngân hàng: <strong>{bank.bin}</strong></p>
                <p>Số tài khoản: <strong>{bank.account}</strong></p>
                <p>Chủ tài khoản: <strong>{bank.account_name}</strong></p>
              </>
            ) : (
              <p className="form-error">Chưa cấu hình tài khoản nhận tiền. Mã QR hiện chỉ chứa nội dung chuyển khoản, chưa phải QR ngân hàng.</p>
            )}
            <p>Số tiền nạp: <strong>{topUpVnd.toLocaleString()} VND</strong> (quy đổi ${Number(payment.shortfall).toFixed(2)} × {rate.toLocaleString()} VND/USD)</p>
            <p>Nội dung: <strong>{transferContent}</strong></p>
          </div>
          <p className="topup-note">Ví chỉ được cộng sau khi giao dịch được Admin xác nhận; quét QR không tự động xác nhận thanh toán.</p>
          {statusMessage && <p className="topup-status" role="status">{statusMessage}</p>}
          <div className="topup-actions">
            <button type="button" className="btn-favorite-secondary" onClick={onClose}>ĐÓNG</button>
            <button type="button" className="btn-submit-primary" onClick={checkBalance} disabled={checking}>
              {checking ? 'ĐANG KIỂM TRA...' : 'KIỂM TRA GIAO DỊCH'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------------------------------------------------------
// THREE.JS VIEWPORT & INSPECTOR COMPONENT
// ---------------------------------------------------------
function applyObjectWireframe(object, enabled) {
  object.traverse((node) => {
    if (!node.isMesh || !node.material) return
    const materials = Array.isArray(node.material) ? node.material : [node.material]
    materials.forEach((material) => {
      if ('wireframe' in material) material.wireframe = enabled
    })
  })
}

function Advanced3DViewer({
  height = '450px',
  envLight = 'studio',
  showGrid = true,
  modelUrl = '',
  onModelStats,
}) {
  const mountRef = useRef(null)
  const [wireframe, setWireframe] = useState(false)
  const [rotating, setRotating] = useState(true)
  const [gridVisible, setGridVisible] = useState(showGrid)
  const [loadError, setLoadError] = useState('')

  const wireRef = useRef(wireframe)
  const loadedModelRef = useRef(null)
  const rotRef = useRef(rotating)
  const envRef = useRef(envLight)

  useEffect(() => { wireRef.current = wireframe }, [wireframe])
  useEffect(() => {
    if (loadedModelRef.current) applyObjectWireframe(loadedModelRef.current, wireframe)
  }, [wireframe])
  useEffect(() => { rotRef.current = rotating }, [rotating])
  useEffect(() => { envRef.current = envLight }, [envLight])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f1015)

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000)
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

    // The wrapper remains the rotation pivot for both loaded models and the fallback.
    const group = new THREE.Group()
    const modelGroup = new THREE.Group()
    group.add(modelGroup)

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1caad9, metalness: 0.8, roughness: 0.2 })
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x30363d, metalness: 0.9, roughness: 0.3 })
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })

    let ring1
    let ring2
    const addFallbackModel = () => {
      const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 24), bodyMat)
      modelGroup.add(coreMesh)
      ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 16, 100), metalMat)
      ring1.rotation.x = Math.PI / 3
      modelGroup.add(ring1)
      ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.02, 16, 100), glowMat)
      ring2.rotation.y = Math.PI / 4
      modelGroup.add(ring2)
    }

    let supportedModelUrl = false
    let loader
    if (modelUrl) {
      try {
        const extension = new URL(modelUrl, window.location.href).pathname.split('.').pop().toLowerCase()
        if (extension === 'glb' || extension === 'gltf') loader = new GLTFLoader()
        else if (extension === 'fbx') loader = new FBXLoader()
        else if (extension === 'obj') loader = new OBJLoader()
        supportedModelUrl = Boolean(loader)
      } catch {
        supportedModelUrl = false
      }
    }

    if (!supportedModelUrl) addFallbackModel()

    scene.add(group)
    let loadedModel
    let disposed = false
    setLoadError('')
    if (supportedModelUrl) {
      loader.load(
        modelUrl,
        (result) => {
          if (disposed) return
          loadedModel = result.scene || result
          loadedModelRef.current = loadedModel
          loadedModel.updateMatrixWorld(true)
          const bounds = new THREE.Box3().setFromObject(loadedModel)
          const center = bounds.getCenter(new THREE.Vector3())
          const size = bounds.getSize(new THREE.Vector3())
          const largestDimension = Math.max(size.x, size.y, size.z)
          if (!Number.isFinite(largestDimension) || largestDimension <= 0) {
            setLoadError('Không thể xác định kích thước của mô hình 3D.')
            return
          }
          const scale = 2.4 / largestDimension
          loadedModel.scale.setScalar(scale)
          loadedModel.position.sub(center.multiplyScalar(scale))
          modelGroup.add(loadedModel)
          applyObjectWireframe(loadedModel, wireRef.current)

          let polygonCount = 0
          let vertexCount = 0
          let meshCount = 0
          loadedModel.traverse((node) => {
            if (!node.isMesh || !node.geometry) return
            const geometry = node.geometry
            const position = geometry.getAttribute('position')
            const index = geometry.getIndex()
            polygonCount += Math.floor((index ? index.count : position?.count || 0) / 3)
            vertexCount += position?.count || 0
            meshCount += 1
          })
          onModelStats?.({ polygonCount, vertexCount, meshCount })
        },
        undefined,
        (error) => {
          if (!disposed) setLoadError(`Không tải được mô hình 3D: ${error.message || 'Lỗi tải file.'}`)
        },
      )
    }

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
        if (ring1) ring1.rotation.z += 0.01
        if (ring2) ring2.rotation.x += 0.008
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
      disposed = true
      loadedModelRef.current = null
      scene.traverse((node) => {
        if (node.geometry) node.geometry.dispose()
        if (node.material) {
          const materials = Array.isArray(node.material) ? node.material : [node.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer.dispose()
    }
  }, [gridVisible, modelUrl, onModelStats])

  return (
    <div className="viewer-container" style={{ height }}>
      <div className="viewer-canvas" ref={mountRef} />
      {loadError && <p className="form-error" role="alert">{loadError}</p>}
      
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
function AuthModal({ isOpen, mode, onClose, onAuthenticated, showToast }) {
  const [currentMode, setCurrentMode] = useState(mode)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setCurrentMode(mode) }, [mode])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (currentMode === 'signup') {
        await apiRequest('/auth/register/', {
          method: 'POST',
          body: JSON.stringify({ username: fullName, email, password }),
        })
      }
      const tokens = await apiRequest('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username: fullName, password }),
      })
      await onAuthenticated(tokens)
      showToast(currentMode === 'login' ? 'Đăng nhập thành công!' : 'Tạo tài khoản thành công!')
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
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
        
            
          </div>

          <div className="divider"><span>HOẶC EMAIL</span></div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label><User size={13} /> Tên đăng nhập</label>
              <input
                type="text"
                placeholder="Tên đăng nhập"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {currentMode === 'signup' && (
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
            )}

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

            {error && <p className="form-error" role="alert">{error}</p>}
            <button type="submit" className="btn-submit-primary" disabled={submitting}>
              {submitting ? 'ĐANG XỬ LÝ...' : currentMode === 'login' ? 'ĐĂNG NHẬP NGAY' : 'TẠO TÀI KHOẢN MIỄN PHÍ'}
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
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('All')

  // Catalog and account data
  const [models, setModels] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'))
  const [myProducts, setMyProducts] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [downloadHistory, setDownloadHistory] = useState([])
  const [walletBalance, setWalletBalance] = useState('0.00')
  const [adminBuffOpen, setAdminBuffOpen] = useState(false)
  const [topUpPayment, setTopUpPayment] = useState(null)

  // Liked & selected models
  const [likedModels, setLikedModels] = useState({})
  const [selectedModel, setSelectedModel] = useState(null)
  const [sourceFile, setSourceFile] = useState(null)
  const [processingPurchase, setProcessingPurchase] = useState(false)

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    title: '',
    category: '',
    price: 'Free',
    description: '',
  })

  // Toast System
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const updateWalletBalance = useCallback((balance) => {
    setWalletBalance(balance)
    setCurrentUser((user) => user ? { ...user, wallet_balance: balance } : user)
  }, [])

  const refreshWallet = useCallback(async (token = accessToken) => {
    const wallet = await getWallet(token)
    updateWalletBalance(wallet.balance)
    return wallet
  }, [accessToken, updateWalletBalance])

  const toggleLike = (id, e) => {
    e?.stopPropagation()
    setLikedModels(prev => {
      const isLiked = !prev[id]
      showToast(isLiked ? 'Đã thêm vào Danh sách Yêu thích!' : 'Đã xóa khỏi Danh sách Yêu thích.')
      return { ...prev, [id]: isLiked }
    })
  }

  useEffect(() => {
    apiRequest('/categories/')
      .then((response) => {
        const loadedCategories = response.results || response
        setCategories(loadedCategories)
        setUploadData((current) => ({
          ...current,
          category: loadedCategories.some((category) => String(category.id) === current.category)
            ? current.category
            : String(loadedCategories[0]?.id || ''),
        }))
      })
      .catch((error) => showToast(`Không tải được danh mục: ${error.message}`, 'error'))
  }, [showToast])

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.set('search', searchQuery.trim())
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (selectedPriceFilter !== 'All') {
        params.set('price', selectedPriceFilter === 'Free' ? 'free' : 'paid')
      }
      const query = params.toString()
      setLoadingModels(true)
      apiRequest(`/models/${query ? `?${query}` : ''}`)
        .then((response) => {
          setModels((response.results || response).map(normalizeProduct))
        })
        .catch((error) => showToast(`Không tải được mô hình: ${error.message}`, 'error'))
        .finally(() => setLoadingModels(false))
    }, 250)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory, selectedPriceFilter, showToast])

  useEffect(() => {
    if (!accessToken) return
    apiRequest('/auth/me/', { token: accessToken })
      .then(setCurrentUser)
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setAccessToken(null)
        setCurrentUser(null)
      })
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) {
      setMyOrders([])
      setWalletBalance('0.00')
      return
    }
    apiRequest('/payments/my-orders/', { token: accessToken })
      .then((response) => setMyOrders(response.results || response))
      .catch((error) => showToast(`Không tải được lịch sử mua hàng: ${error.message}`, 'error'))
  }, [accessToken, showToast])

  useEffect(() => {
    if (!accessToken) return
    refreshWallet().catch((error) => showToast(`Không tải được ví tiền: ${error.message}`, 'error'))
  }, [accessToken, refreshWallet, showToast])

  useEffect(() => {
    if (currentTab !== 'dashboard' || !accessToken) return
    Promise.all([
      apiRequest('/models/my/', { token: accessToken }),
      apiRequest('/downloads/history/', { token: accessToken }),
    ])
      .then(([products, downloads]) => {
        setMyProducts((products.results || products).map(normalizeProduct))
        setDownloadHistory(downloads.results || downloads)
      })
      .catch((error) => showToast(`Không tải được dữ liệu dashboard: ${error.message}`, 'error'))
  }, [currentTab, accessToken, showToast])

  const filteredModels = models

  const handleAuthenticated = async (tokens) => {
    localStorage.setItem('accessToken', tokens.access)
    if (tokens.refresh) localStorage.setItem('refreshToken', tokens.refresh)
    setAccessToken(tokens.access)
    const user = await apiRequest('/auth/me/', { token: tokens.access })
    setCurrentUser(user)
    setWalletBalance(user.wallet_balance || '0.00')
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setAccessToken(null)
    setCurrentUser(null)
    setWalletBalance('0.00')
    setCurrentTab('explore')
    showToast('Đã đăng xuất.')
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!accessToken) {
      showToast('Vui lòng đăng nhập để đăng tải mô hình.', 'error')
      setAuthModal({ open: true, mode: 'login' })
      return
    }
    const categoryId = Number(uploadData.category)
    const categoryExists = categories.some((item) => item.id === categoryId)
    if (!sourceFile || !categoryExists) {
      showToast('Vui lòng chọn danh mục hợp lệ và file nguồn.', 'error')
      return
    }
    if (sourceFile.size > 200 * 1024 * 1024) {
      showToast('File vượt quá giới hạn 200 MB.', 'error')
      return
    }
    if (!/\.(zip|glb|gltf|fbx|obj|blend)$/i.test(sourceFile.name)) {
      showToast('Định dạng file chưa được hỗ trợ.', 'error')
      return
    }

    const formData = new FormData()
    formData.set('title', uploadData.title.trim())
    formData.set('category', String(categoryId))
    formData.set('description', uploadData.description)
    formData.set('price', uploadData.price === 'Free' ? '0' : uploadData.price.replace('$', ''))
    formData.set('source_file', sourceFile)

    try {
      const product = await apiRequest('/models/', {
        method: 'POST',
        token: accessToken,
        body: formData,
      })
      setModels((items) => [normalizeProduct(product, items.length), ...items])
      setUploadData({ title: '', category: '', price: 'Free', description: '' })
      setSourceFile(null)
      showToast('Đăng tải mô hình thành công.')
      setCurrentTab('dashboard')
    } catch (error) {
      showToast(`Không thể đăng tải mô hình: ${error.message}`, 'error')
    }
  }

  const handlePurchase = async () => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập để mua mô hình.', 'error')
      setAuthModal({ open: true, mode: 'login' })
      return
    }
    if (!selectedModel || processingPurchase) return
    setProcessingPurchase(true)
    try {
      const order = await purchaseProduct(selectedModel.id, accessToken)
      setMyOrders((orders) => [order, ...orders.filter((item) => item.id !== order.id)])
      updateWalletBalance(order.wallet_balance)
      showToast('Thanh toán bằng ví thành công!')
    } catch (error) {
      if (error.status === 402 && error.data?.code === 'insufficient_balance') {
        try {
          const wallet = await refreshWallet(accessToken)
          setTopUpPayment({
            ...error.data,
            current_balance: wallet.balance,
            bank: wallet.bank,
            exchangeRate: wallet.exchange_rate,
          })
        } catch (walletError) {
          showToast(`Không tải được thông tin nạp ví: ${walletError.message}`, 'error')
        }
        return
      }
      showToast(`Không thể mua mô hình: ${error.message}`, 'error')
    } finally {
      setProcessingPurchase(false)
    }
  }

  const handleDownload = async () => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập để tải mô hình.', 'error')
      setAuthModal({ open: true, mode: 'login' })
      return
    }
    if (!selectedModel) return
    const downloadTab = window.open('about:blank', '_blank')
    try {
      const response = await downloadProduct(selectedModel.id, accessToken)
      if (downloadTab) downloadTab.location.href = response.download_url
      else window.location.assign(response.download_url)
      showToast('Đang mở file tải xuống.')
    } catch (error) {
      downloadTab?.close()
      showToast(`Không thể tải mô hình: ${error.message}`, 'error')
    }
  }

  const handleViewerStats = useCallback((stats) => {
    setSelectedModel((model) => model ? {
      ...model,
      polygons: `${stats.polygonCount.toLocaleString()} (${stats.meshCount.toLocaleString()} Meshes)`,
      vertices: stats.vertexCount.toLocaleString(),
    } : model)
  }, [])

  const selectedIsPurchased = Boolean(selectedModel && myOrders.some((order) =>
    order.status === 'completed' &&
    order.items?.some((item) => Number(item.product) === Number(selectedModel.id))
  ))
  const selectedCanDownload = Boolean(selectedModel && (
    selectedModel.priceAmount <= 0 ||
    selectedIsPurchased ||
    currentUser?.username === selectedModel.author
  ))
  const isAdmin = Boolean(
    currentUser?.is_staff ||
    currentUser?.is_superuser ||
    currentUser?.username === 'admin'
  )

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
            {currentUser ? (
              <>
                <span className="wallet-balance"><WalletIcon size={15} /> Số dư: ${Number(walletBalance).toFixed(2)}</span>
                {isAdmin && (
                  <button className="btn-admin-buff" onClick={() => setAdminBuffOpen(true)}>
                    <Zap size={14} /> Buff Tiền (Admin)
                  </button>
                )}
                <button className="btn-text" onClick={handleLogout}>
                  {currentUser.username} · Đăng xuất
                </button>
              </>
            ) : (
              <button className="btn-text" onClick={() => setAuthModal({ open: true, mode: 'login' })}>
                Đăng Nhập
              </button>
            )}
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
                {[{ name: 'All', slug: 'all' }, ...categories].map(cat => (
                  <button
                    key={cat.slug}
                    className={`cat-pill ${selectedCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    {cat.name}
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

              {loadingModels ? <p>Đang tải mô hình...</p> : filteredModels.length === 0 ? (
                <p>Chưa có mô hình phù hợp với bộ lọc.</p>
              ) : <div className="asset-grid">
                {filteredModels.map(item => (
                  <div
                    key={item.id}
                    className="asset-card"
                    onClick={() => setSelectedModel(item)}
                  >
                    <div className="card-thumb" style={{ background: `radial-gradient(circle, ${item.color}22 0%, #15161b 100%)`, ...(item.thumbnailUrl ? { backgroundImage: `url("${item.thumbnailUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
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
                      <p className="desc-short">{item.category}</p>
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
              </div>}
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
                  <option value="all">Tất cả Danh mục</option>
                  {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
                </select>

                <select value={selectedPriceFilter} onChange={(e) => setSelectedPriceFilter(e.target.value)}>
                  <option value="All">Tất cả Giá</option>
                  <option value="Free">Miễn phí</option>
                  <option value="Paid">Trả phí</option>
                </select>
              </div>

              <div className="results-count">
                Hiển thị {filteredModels.length} kết quả
              </div>
            </div>

            {/* MARKETPLACE ASSET GRID */}
            {loadingModels ? <p>Đang tải mô hình...</p> : filteredModels.length === 0 ? (
              <p>Chưa có mô hình phù hợp với bộ lọc.</p>
            ) : <div className="asset-grid">
              {filteredModels.map(item => (
                <div key={item.id} className="asset-card" onClick={() => setSelectedModel(item)}>
                  <div className="card-thumb" style={{ background: `radial-gradient(circle, ${item.color}25 0%, #15161b 100%)`, ...(item.thumbnailUrl ? { backgroundImage: `url("${item.thumbnailUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
                    <span className="tag-badge">{item.badge}</span>
                    <div className="rating-pill"><Star size={12} fill="#ffb400" color="#ffb400" /> {item.rating}</div>
                  </div>
                  <div className="card-info">
                    <h4 className="title">{item.title}</h4>
                    <p className="desc-short">{item.description}</p>
                    <div className="tech-tags">
                      <span>{item.category}</span>
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
            </div>}
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
                <label className={`dropzone ${sourceFile ? 'uploaded' : ''}`}>
                  <Upload size={40} color="var(--accent)" />
                  <input
                    type="file"
                    accept=".zip,.glb,.gltf,.fbx,.obj,.blend"
                    style={{ display: 'none' }}
                    onChange={(event) => setSourceFile(event.target.files?.[0] || null)}
                  />
                  {sourceFile ? (
                    <div className="uploaded-file-info">
                      <CheckCircle2 size={24} color="#4caf50" />
                      <h4>{sourceFile.name}</h4>
                      <p>{(sourceFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                      <span className="change-link">Bấm để thay đổi File</span>
                    </div>
                  ) : (
                    <>
                      <h3>Kéo & thả File 3D vào đây</h3>
                      <p>Hỗ trợ định dạng .GLTF, .GLB, .FBX, .OBJ, .ZIP (Tối đa 200MB)</p>
                      <span className="btn-browse">CHỌN FILE TỪ MÁY TÍNH</span>
                    </>
                  )}
                </label>

                {/* Metadata Form */}
                <form className="upload-form" onSubmit={handleUpload}>
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
                        required
                        disabled={categories.length === 0}
                      >
                        {categories.length === 0 && <option value="">Chưa có danh mục</option>}
                        {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
                      </select>
                     
                    </div>

                    <div className="form-group">
                      <label>Thiết lập Giá</label>
                      <select
                        value={uploadData.price}
                        onChange={(e) => setUploadData({ ...uploadData, price: e.target.value })}
                      >
                        <option value="Free">Miễn phí (Free)</option>
                        <option value="$9.00">$9.00</option>
                        <option value="$19.00">$19.00</option>
                        <option value="$49.00">$49.00</option>
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
                <img src={imageUrl(currentUser?.avatar) || SAMPLE_MODELS[0].avatar} alt="Avatar" />
                <div>
                  <h2>{currentUser?.username || 'Dashboard'} {currentUser && <span className="pro-badge">{currentUser.role}</span>}</h2>
                  <p>{currentUser?.bio || 'Quản lý mô hình, đơn hàng và lượt tải của bạn.'}</p>
                </div>
              </div>
              <button className="btn-secondary-large" onClick={() => setCurrentTab('upload')}>
                <Plus size={15} /> ĐĂNG MÔ HÌNH MỚI
              </button>
            </div>

            {/* ANALYTICS STATS */}
            <div className="analytics-grid">
              <div className="stat-card">
                <div className="stat-title">MÔ HÌNH ĐÃ ĐĂNG</div>
                <div className="stat-value">{myProducts.length}</div>
                <div className="stat-trend positive">Sản phẩm của bạn</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">LƯỢT TẢI VỀ</div>
                <div className="stat-value">{downloadHistory.length}</div>
                <div className="stat-trend positive">Lịch sử tải xuống</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">ĐƠN HÀNG</div>
                <div className="stat-value">{myOrders.length}</div>
                <div className="stat-trend positive">Đơn hàng của bạn</div>
              </div>
            </div>

            {/* DASHBOARD TABBED LIST */}
            <div className="dashboard-models-section">
              <h3>Mô hình đã đăng ({myProducts.length})</h3>
              <div className="dashboard-table">
                <div className="table-row header">
                  <span>Mô hình</span>
                  <span>Danh mục</span>
                  <span>Giá</span>
                  <span>Lượt xem</span>
                  <span>Thao tác</span>
                </div>

                {myProducts.map(item => (
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
                    </div>
                  </div>
                ))}
                {myProducts.length === 0 && (
                  <p className="empty-state">Bạn chưa đăng mô hình nào.</p>
                )}
              </div>
            </div>

            <div className="dashboard-models-section">
              <h3>Lịch sử tải xuống</h3>
              {downloadHistory.length ? downloadHistory.map((download) => (
                <p key={download.id}>{download.product_title} · {new Date(download.downloaded_at).toLocaleString()}</p>
              )) : <p className="empty-state">Chưa có lượt tải xuống.</p>}
            </div>

            <div className="dashboard-models-section">
              <h3>Đơn hàng</h3>
              {myOrders.length ? myOrders.map((order) => (
                <p key={order.id}>#{order.id} · ${Number(order.total_amount).toFixed(2)} · {order.status}</p>
              )) : <p className="empty-state">Chưa có đơn hàng.</p>}
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
                <p className="sub-author">Đăng bởi <strong>{selectedModel.author}</strong> &bull; Danh mục: {selectedModel.category || 'Other'}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedModel(null)}><X size={20} /></button>
            </div>

            <div className="detail-body-grid">
              {/* 3D Interactive Viewport */}
              <div className="detail-viewport-col">
                <Advanced3DViewer
                  height="100%"
                  modelUrl={selectedModel.modelUrl}
                  onModelStats={handleViewerStats}
                />
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
                    onClick={selectedCanDownload ? handleDownload : handlePurchase}
                    disabled={processingPurchase}
                  >
                    {!selectedCanDownload
                      ? <><ShoppingCart size={16} /> {processingPurchase ? 'ĐANG THANH TOÁN...' : `MUA NGAY (${selectedModel.price})`}</>
                      : <><Download size={16} /> TẢI MẪU 3D NGAY</>}
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
        onAuthenticated={handleAuthenticated}
        showToast={showToast}
      />

      {adminBuffOpen && (
        <AdminBuffModal
          currentUsername={currentUser?.username || ''}
          token={accessToken}
          onClose={() => setAdminBuffOpen(false)}
          onBalance={updateWalletBalance}
          showToast={showToast}
        />
      )}
      {topUpPayment && currentUser && (
        <WalletTopUpModal
          payment={topUpPayment}
          username={currentUser.username}
          token={accessToken}
          onBalance={updateWalletBalance}
          onClose={() => setTopUpPayment(null)}
        />
      )}

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