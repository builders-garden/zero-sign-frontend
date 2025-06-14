"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Proof {
  id: number;
  value: string;
  proposalId: number;
}

interface Proposal {
  id: number;
  calldata: string;
  to: string;
  value: string;
  nonce: number;
  threshold: number;
  zkOwnerAddress: string;
  safeAddress: string;
  proofs: Proof[];
}

export default function ProposalsListPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [searchedProposal, setSearchedProposal] = useState<Proposal | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showProofs, setShowProofs] = useState(false);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch("/api/proposals");
      const data = await response.json();

      if (data.success) {
        setProposals(data.proposals);
      } else {
        console.error("Failed to fetch proposals:", data.error);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchProposal = async () => {
    if (!searchId.trim()) {
      setSearchError("Please enter a proposal ID");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setSearchedProposal(null);

    try {
      const response = await fetch(`/api/proposals/${searchId}`);
      const data = await response.json();

      if (data.success) {
        setSearchedProposal(data.proposal);
      } else {
        setSearchError(data.error || "Proposal not found");
      }
    } catch (error) {
      console.error("Error searching proposal:", error);
      setSearchError("Failed to search proposal");
    } finally {
      setIsSearching(false);
    }
  };

  const getProofStatus = (proposal: Proposal) => {
    const committed = proposal.proofs.length;
    const missing = Math.max(0, proposal.threshold - committed);
    const isComplete = committed >= proposal.threshold;

    return { committed, missing, isComplete };
  };

  const clearSearch = () => {
    setSearchId("");
    setSearchedProposal(null);
    setSearchError("");
    setShowProofs(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-4">Proposals</h2>
        <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300">
          Loading proposals...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Proposals</h2>
        <Link
          href="/app/proposal/new"
          className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg px-4 py-2 transition-colors"
        >
          Create New Proposal
        </Link>
      </div>

      {/* Search Section */}
      <div className="bg-neutral-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Search Proposal by ID</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Enter Proposal ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === "Enter" && searchProposal()}
            />
          </div>
          <Button
            onClick={searchProposal}
            disabled={isSearching}
            className="bg-green-500 hover:bg-green-400 text-black font-bold"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
          {searchedProposal && (
            <Button
              onClick={clearSearch}
              variant="outline"
              className="border-neutral-600 text-black bg-gray-200 hover:bg-gray-300"
            >
              Clear
            </Button>
          )}
        </div>

        {searchError && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {searchError}
          </div>
        )}
      </div>

      {/* Searched Proposal Details */}
      {searchedProposal && (
        <div className="bg-neutral-800 rounded-xl p-6 mb-6 border-2 border-green-500/50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Proposal #{searchedProposal.id}
              </h3>
              <p className="text-sm text-neutral-400">
                Safe: {searchedProposal.safeAddress}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  getProofStatus(searchedProposal).isComplete
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {getProofStatus(searchedProposal).committed}/
                {searchedProposal.threshold} signatures
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-400">
                  To Address
                </label>
                <div className="mt-1 p-3 bg-neutral-900 rounded-lg text-white font-mono text-sm break-all">
                  {searchedProposal.to}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-400">
                  Value (ETH)
                </label>
                <div className="mt-1 p-3 bg-neutral-900 rounded-lg text-white font-mono">
                  {searchedProposal.value}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-400">
                  Nonce
                </label>
                <div className="mt-1 p-3 bg-neutral-900 rounded-lg text-white font-mono">
                  {searchedProposal.nonce}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-400">
                  Threshold
                </label>
                <div className="mt-1 p-3 bg-neutral-900 rounded-lg text-white font-mono">
                  {searchedProposal.threshold}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium text-neutral-400">
              Calldata
            </label>
            <div className="mt-1 p-3 bg-neutral-900 rounded-lg text-white font-mono text-sm break-all">
              {searchedProposal.calldata}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-neutral-400">
              Status:{" "}
              {getProofStatus(searchedProposal).isComplete ? (
                <span className="text-green-400 font-medium">
                  Ready to Execute
                </span>
              ) : (
                <span className="text-yellow-400 font-medium">
                  Needs {getProofStatus(searchedProposal).missing} more
                  signature
                  {getProofStatus(searchedProposal).missing !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <Button
              onClick={() => setShowProofs(!showProofs)}
              variant="outline"
              className="border-neutral-600 text-black bg-gray-200 hover:bg-gray-300"
            >
              {showProofs ? "Hide" : "Show"} Proofs (
              {searchedProposal.proofs.length})
            </Button>
          </div>

          {showProofs && (
            <div className="mt-6 pt-6 border-t border-neutral-700">
              <h4 className="text-lg font-semibold mb-4">Proofs</h4>
              {searchedProposal.proofs.length === 0 ? (
                <div className="text-neutral-400 text-center py-4">
                  No proofs submitted yet
                </div>
              ) : (
                <div className="space-y-3">
                  {searchedProposal.proofs.map((proof, index) => (
                    <div
                      key={proof.id}
                      className="bg-neutral-900 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-neutral-400">
                          Proof #{index + 1}
                        </span>
                        <span className="text-xs text-neutral-500">
                          ID: {proof.id}
                        </span>
                      </div>
                      <div className="text-white font-mono text-sm break-all">
                        {proof.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Proposals List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">All Proposals</h3>
        {proposals.length === 0 ? (
          <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 text-center">
            <p>No proposals found.</p>
            <Link
              href="/app/proposal/new"
              className="text-green-400 hover:text-green-300 underline mt-2 inline-block"
            >
              Create your first proposal
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const { committed, missing, isComplete } =
                getProofStatus(proposal);

              return (
                <div
                  key={proposal.id}
                  className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Proposal #{proposal.id}
                      </h3>
                      <p className="text-sm text-neutral-400">
                        Safe: {proposal.safeAddress.slice(0, 10)}...
                        {proposal.safeAddress.slice(-8)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isComplete
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {committed}/{proposal.threshold} proofs
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-neutral-300 mb-4">
                    <div>
                      <span className="text-neutral-500">To:</span>{" "}
                      {proposal.to.slice(0, 10)}...{proposal.to.slice(-8)}
                    </div>
                    <div>
                      <span className="text-neutral-500">Value:</span>{" "}
                      {proposal.value} ETH
                    </div>
                    <div>
                      <span className="text-neutral-500">Nonce:</span>{" "}
                      {proposal.nonce}
                    </div>
                    <div>
                      <span className="text-neutral-500">Status:</span>{" "}
                      {isComplete ? (
                        <span className="text-green-400">Ready to Execute</span>
                      ) : (
                        <span className="text-yellow-400">
                          Needs {missing} more proof{missing !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-neutral-500 mb-3">
                    <span className="text-neutral-500">Calldata:</span>{" "}
                    {proposal.calldata.slice(0, 50)}...
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSearchId(proposal.id.toString());
                        searchProposal();
                      }}
                      className="text-black hover:text-gray-800 text-sm font-medium bg-green-400 hover:bg-green-300 px-3 py-1 rounded-lg transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
