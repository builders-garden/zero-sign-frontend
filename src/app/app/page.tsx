import { Shield, Users, Zap, Plus, FileText, HelpCircle } from "lucide-react";

export default function AppHome() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-green-500/20 rounded-full">
            <Shield className="w-16 h-16 text-green-400" />
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-4">
          Welcome to ZeroSig
        </h1>
        <p className="text-xl text-neutral-300 max-w-3xl mx-auto mb-8">
          A Safe multisig with privacy embedded through ZK proofs.
        </p>
      </div>

      {/* Features Section */}
      <div className="bg-neutral-900/30 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Privacy-Enhanced Multisig
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-green-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Signer Privacy</h3>
            <p className="text-neutral-400 text-sm">
              Choose your threshold but hide onchain who your signers are and how many you have.
            </p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-blue-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Transaction Privacy</h3>
            <p className="text-neutral-400 text-sm">
              Hide who is signing specific transactions but be publicly sure that the signers are allowed to.
            </p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-purple-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Noir ZK Proofs</h3>
            <p className="text-neutral-400 text-sm">
              Powered by Noir client-side ZK proofs. Maintain the
              security of Safe multisig while adding cryptographic privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Protection Benefits */}
      <div className="mt-12 bg-neutral-900/20 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Protection Against
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div>
                <h4 className="font-medium text-white">
                🧠 Social Engineering & Coercion
                </h4>
                <p className="text-sm text-neutral-400">
                Shield signers from being personally targeted through phishing, impersonation, or coercive tactics by eliminating public signer visibility.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div>
                <h4 className="font-medium text-white">
                ⚖️ Sensitive Transaction Attribution
                </h4>
                <p className="text-sm text-neutral-400">
                Enable anonymous signing for high-impact or politically sensitive transactions (e.g., donations, whistleblower support, activist funding) without compromising operational security.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div>
                <h4 className="font-medium text-white"> 🕵️‍♂️ Deanonymization Risks</h4>
                <p className="text-sm text-neutral-400">
                Prevent adversaries from mapping onchain activity to specific individuals or organizations, reducing surveillance and correlation attacks across wallets or DAOs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div>
                <h4 className="font-medium text-white"> 🔍 Unwanted Public Attention</h4>
                <p className="text-sm text-neutral-400">
                Maintain low profile for organizations or contributors handling large funds, avoiding headlines, scrutiny, or reputational exposure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold mb-4">Ready for Private Multisig?</h2>
        <p className="text-neutral-400 mb-6">
          Deploy your privacy-enhanced Safe multisig and start protecting your
          signers' identities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-xl transition-colors">
            Create Private Safe
          </button>
          <button className="border border-green-500 text-green-400 hover:bg-green-500/10 font-bold py-3 px-6 rounded-xl transition-colors">
            Learn How It Works
          </button>
        </div>
      </div>
    </div>
  );
}
