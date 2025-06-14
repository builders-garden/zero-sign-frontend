export default function ProposalDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="max-w-xl mx-auto mt-16">
      <h2 className="text-2xl font-bold mb-4">Proposal Details</h2>
      <div className="bg-neutral-800 rounded-xl p-8 text-neutral-300">
        Proposal details for ID:{" "}
        <span className="font-mono text-green-400">{params.id}</span> will be
        shown here.
      </div>
    </div>
  );
}
