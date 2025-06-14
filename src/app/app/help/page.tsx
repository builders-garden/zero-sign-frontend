import { Shield, Users, Key, CheckCircle, Zap, X } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-full">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  ZeroSig Multisig
                </h1>
                <p className="text-neutral-400 text-sm">How it works</p>
              </div>
            </div>
            <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-8">
          {/* Introduction */}
          <div className="text-center mb-8">
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Privacy-first multisignature wallet powered by zero-knowledge
              proofs. Secure your assets while maintaining complete transaction
              privacy.
            </p>
          </div>

          {/* Steps - All Aligned Left */}
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center text-black font-bold text-lg">
                  1
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Create Your Safe
                  </h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Deploy a new Safe multisig wallet with your desired threshold
                  (e.g., 2-of-3, 3-of-5). Configure your ZK owner addresses -
                  these are the signers who can create zero-knowledge proofs
                  without revealing their identity or transaction details
                  onchain.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex items-center justify-center text-black font-bold text-lg">
                  2
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-3">
                  <Key className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Propose Transaction
                  </h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Any authorized member can propose a transaction by submitting
                  the target address, calldata, and value. The proposal is
                  stored with a unique nonce and includes your Safe address and
                  ZK owner configuration for validation.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full flex items-center justify-center text-black font-bold text-lg">
                  3
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Generate ZK Proofs
                  </h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Signers use the Noir proving system to generate zero-knowledge
                  proofs of their approval. These proofs cryptographically
                  verify their consent without revealing private keys,
                  signatures, or any sensitive information on the blockchain.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full flex items-center justify-center text-black font-bold text-lg">
                  4
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-orange-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Collect Signatures
                  </h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  As signers approve the proposal, their ZK proofs are securely
                  stored in our database. The system tracks progress toward
                  meeting the required threshold (e.g., 2 out of 3 signatures)
                  while maintaining complete privacy of the signing process.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center text-black font-bold text-lg">
                  5
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Execute Transaction
                  </h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  Once the threshold is met, anyone can execute the transaction
                  using the collected ZK proofs. The Safe validates all proofs
                  using EIP-1271 signature verification, ensuring security while
                  maintaining privacy. Your transaction executes without
                  revealing signer identities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
