"use client";
import { useState } from "react";
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
  const [safeAddress, setSafeAddress] = useState("");
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showProofs, setShowProofs] = useState<{ [key: number]: boolean }>({});
  const [hasSearched, setHasSearched] = useState(false);

  const searchProposalsBySafe = async () => {
    if (!safeAddress.trim()) {
      setSearchError("Please enter a Safe address");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setFilteredProposals([]);

    try {
      const response = await fetch(
        `/api/proposals/safe/${encodeURIComponent(safeAddress)}`
      );
      const data = await response.json();

      if (data.success) {
        setFilteredProposals(data.proposals);
        setHasSearched(true);
        if (data.proposals.length === 0) {
          setSearchError("No proposals found for this Safe address");
        }
      } else {
        setSearchError(data.error || "Failed to fetch proposals for this Safe");
      }
    } catch (error) {
      console.error("Error searching proposals:", error);
      setSearchError("Failed to search proposals");
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
    setSafeAddress("");
    setFilteredProposals([]);
    setSearchError("");
    setShowProofs({});
    setHasSearched(false);
  };

  const toggleProofs = (proposalId: number) => {
    setShowProofs((prev) => ({
      ...prev,
      [proposalId]: !prev[proposalId],
    }));
  };

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
        <h3 className="text-lg font-semibold mb-4">
          Search Proposals by Safe Address
        </h3>
        <p className="text-sm text-neutral-400 mb-4">
          Enter a Safe address to view all proposals for that specific Safe.
        </p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Safe Address (0x...)"
              value={safeAddress}
              onChange={(e) => setSafeAddress(e.target.value)}
              className="w-full rounded-lg px-3 py-2 bg-neutral-900 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyPress={(e) => e.key === "Enter" && searchProposalsBySafe()}
            />
          </div>
          <Button
            onClick={searchProposalsBySafe}
            disabled={isSearching}
            className="bg-green-500 hover:bg-green-400 text-black font-bold"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
          {hasSearched && (
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

      {/* Proposals List - Only show after search */}
      {hasSearched ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Proposals for Safe: {safeAddress.slice(0, 10)}...
              {safeAddress.slice(-8)}
            </h3>
            <span className="text-sm text-neutral-400">
              {filteredProposals.length} proposal
              {filteredProposals.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {filteredProposals.length === 0 ? (
            <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 text-center">
              <p>No proposals found for this Safe address.</p>
              <Link
                href="/app/proposal/new"
                className="text-green-400 hover:text-green-300 underline mt-2 inline-block"
              >
                Create the first proposal for this Safe
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => {
                const { committed, missing, isComplete } =
                  getProofStatus(proposal);
                const showProofDetails = showProofs[proposal.id] || false;

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
                          <span className="text-green-400">
                            Ready to Execute
                          </span>
                        ) : (
                          <span className="text-yellow-400">
                            Needs {missing} more proof{missing !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-neutral-500 mb-4">
                      <span className="text-neutral-500">Calldata:</span>{" "}
                      {proposal.calldata.slice(0, 50)}...
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-neutral-400">
                        Threshold: {proposal.threshold} signatures required
                      </div>
                      <Button
                        onClick={() => toggleProofs(proposal.id)}
                        variant="outline"
                        className="border-neutral-600 text-black bg-gray-200 hover:bg-gray-300"
                      >
                        {showProofDetails ? "Hide" : "Show"} Proofs (
                        {proposal.proofs.length})
                      </Button>
                    </div>

                    {showProofDetails && (
                      <div className="mt-6 pt-6 border-t border-neutral-700">
                        <h4 className="text-lg font-semibold mb-4">Proofs</h4>
                        {proposal.proofs.length === 0 ? (
                          <div className="text-neutral-400 text-center py-4">
                            No proofs submitted yet
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {proposal.proofs.map((proof, index) => (
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
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Welcome message when no search has been performed
        <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">Welcome to Proposals</h3>
            <p className="text-neutral-400 mb-6">
              Enter a Safe address above to view all proposals for that specific
              Safe, or create a new proposal to get started.
            </p>
            <Link
              href="/app/proposal/new"
              className="inline-flex items-center bg-green-500 hover:bg-green-400 text-black font-bold rounded-lg px-6 py-3 transition-colors"
            >
              Create New Proposal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
