import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex justify-between items-center pb-8 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <i className="fas fa-film text-5xl text-purple-500"></i>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Titanio Studio
            </h1>
          </div>
          <nav>
            <ul className="flex gap-8">
              <li><a href="#features" className="hover:text-purple-400 transition">Recursos</a></li>
              <li><a href="#pricing" className="hover:text-purple-400 transition">Preços</a></li>
              <li><Link to="/login" className="hover:text-purple-400 transition">Login</Link></li>
              <li><Link to="/register" className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-full hover:shadow-lg transition">Começar</Link></li>
            </ul>
          </nav>
        </header>

        {/* Hero */}
        <section className="text-center py-20 my-12 bg-gray-800/30 rounded-3xl backdrop-blur-sm border border-gray-700">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Produza Videoclipes Profissionais com IA
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Crie videoclipes musicais impressionantes usando inteligência artificial. 
            Gere música original, produza vídeos em HD/4K e publique automaticamente em todas as plataformas.
          </p>
          <Link 
            to="/register"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 px-10 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            Criar Meu Primeiro Videoclipe
          </Link>
        </section>

        {/* Features */}
        <section id="features" className="grid md:grid-cols-3 gap-8 my-20">
          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 hover:-translate-y-2 transition-all">
            <i className="fas fa-music text-5xl text-purple-500 mb-6"></i>
            <h3 className="text-2xl font-bold mb-4">Música com IA</h3>
            <p className="text-gray-400">
              Gere músicas originais usando Suno AI e MusicGPT. Escolha gênero, mood e até letras personalizadas.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 hover:-translate-y-2 transition-all">
            <i className="fas fa-video text-5xl text-purple-500 mb-6"></i>
            <h3 className="text-2xl font-bold mb-4">Vídeos com IA</h3>
            <p className="text-gray-400">
              Crie vídeos impressionantes com Kling, Runway e InVideo AI. Qualidade HD e 4K com lip-sync perfeito.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 hover:-translate-y-2 transition-all">
            <i className="fas fa-balance-scale text-5xl text-purple-500 mb-6"></i>
            <h3 className="text-2xl font-bold mb-4">Agente Legal de IA</h3>
            <p className="text-gray-400">
              Tire dúvidas sobre direitos autorais, licenciamento e uso comercial de conteúdo gerado por IA.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 hover:-translate-y-2 transition-all">
            <i className="fas fa-upload text-5xl text-purple-500 mb-6"></i>
            <h3 className="text-2xl font-bold mb-4">Publicação Automática</h3>
            <p className="text-gray-400">
              Publique automaticamente no YouTube, TikTok, Instagram, Spotify, Apple Music e Deezer.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 hover:-translate-y-2 transition-all">
            <i className="fas fa-ad text-5xl text-purple-500 mb-6"></i>
            <h3 className="text-2xl font-bold mb-4">Google Ads Integrado</h3>
            <p className="text-gray-400">
              Crie e gerencie campanhas publicitárias no Google Ads diretamente da plataforma.
            </p>
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 hover:-translate-y-2 transition-all">
            <i className="fas fa-cash-register text-5xl text-purple-500 mb-6"></i>
            <h3 className="text-2xl font-bold mb-4">Pagamentos Integrados</h3>
            <p className="text-gray-400">
              Sistema de cobrança com Stripe para facilitar a monetização do seu conteúdo.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="grid md:grid-cols-3 gap-8 my-20">
          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 text-center">
            <h3 className="text-2xl font-bold mb-4">Básico</h3>
            <div className="text-5xl font-bold text-purple-500 my-6">$1,250</div>
            <p className="text-gray-400 mb-6">Por projeto</p>
            <ul className="text-left space-y-3 mb-8">
              <li><i className="fas fa-check text-green-500 mr-2"></i> 1 vídeo (3 min)</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> HD 1080p</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> 2 revisões</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Agente Legal</li>
              <li><i className="fas fa-plus text-purple-500 mr-2"></i> Música IA: +$75</li>
            </ul>
            <Link to="/register" className="block bg-gray-700 hover:bg-purple-600 px-6 py-3 rounded-full transition">
              Selecionar
            </Link>
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-8 border-2 border-purple-500 text-center transform scale-105">
            <h3 className="text-2xl font-bold mb-4">Standard</h3>
            <div className="text-5xl font-bold text-purple-500 my-6">$2,000</div>
            <p className="text-gray-400 mb-6">Por projeto</p>
            <ul className="text-left space-y-3 mb-8">
              <li><i className="fas fa-check text-green-500 mr-2"></i> 1 vídeo (4 min)</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Full HD + 4K</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> 3 revisões</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Agente Legal</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Color grading</li>
              <li><i className="fas fa-plus text-purple-500 mr-2"></i> Música IA: +$75</li>
            </ul>
            <Link to="/register" className="block bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-full hover:shadow-lg transition">
              Selecionar
            </Link>
          </div>

          <div className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700 text-center">
            <h3 className="text-2xl font-bold mb-4">Premium</h3>
            <div className="text-5xl font-bold text-purple-500 my-6">$3,000</div>
            <p className="text-gray-400 mb-6">Por projeto</p>
            <ul className="text-left space-y-3 mb-8">
              <li><i className="fas fa-check text-green-500 mr-2"></i> 1 vídeo (5 min)</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> 4K</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Revisões ilimitadas</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Música IA inclusa</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Efeitos avançados</li>
              <li><i className="fas fa-check text-green-500 mr-2"></i> Lip-sync</li>
            </ul>
            <Link to="/register" className="block bg-gray-700 hover:bg-purple-600 px-6 py-3 rounded-full transition">
              Selecionar
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-gray-700 mt-20">
          <p className="text-gray-400">© 2025 Titanio Studio - Todos os direitos reservados</p>
          <p className="text-gray-500 mt-2">Plataforma SaaS para produção de videoclipes musicais com IA</p>
        </footer>
      </div>
    </div>
  );
}

