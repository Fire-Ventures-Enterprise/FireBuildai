import { useQuery } from "@tanstack/react-query";
import { type Estimate } from "@shared/schema";

export default function EstimatesSimple() {
  const { data: estimates = [], isLoading, error } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  console.log("Estimates component rendering", { estimates, isLoading, error });

  if (isLoading) {
    return <div className="p-8">Loading estimates...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {String(error)}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Estimates</h1>
      <p>Total estimates: {estimates.length}</p>
      {estimates.length === 0 ? (
        <div className="mt-4 p-4 border rounded">
          <p>No estimates found. Click Create Estimate to get started.</p>
        </div>
      ) : (
        <div className="mt-4">
          {estimates.map((estimate) => (
            <div key={estimate.id} className="p-4 border rounded mb-2">
              <p>Number: {estimate.documentNumber}</p>
              <p>Job: {estimate.jobTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}