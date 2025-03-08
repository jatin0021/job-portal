import { useEffect, useState } from "react";
import { db } from "../firebase/Firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAppliedJobs = async () => {
      try {
        const q = query(collection(db, "applications"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const jobsWithDetails = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const application = docSnap.data();
            const jobRef = doc(db, "jobs", application.jobId);
            const jobSnap = await getDoc(jobRef);

            // If job exists, return details, otherwise filter it out
            if (jobSnap.exists()) {
              return { id: docSnap.id, ...application, ...jobSnap.data() };
            }
            return null; // Return null for deleted jobs
          })
        );

        // Remove deleted jobs (null values)
        setAppliedJobs(jobsWithDetails.filter(job => job !== null));
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      }
      setLoading(false);
    };

    fetchAppliedJobs();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Your Applied Jobs</h1>

      {loading ? (
        <p className="text-center">Loading applied jobs...</p>
      ) : appliedJobs.length === 0 ? (
        <p className="text-center">You have not applied for any jobs yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">Job Title</th>
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Job Type</th>
                <th className="p-3 text-left">Salary</th>
                <th className="p-3 text-left">Applied Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {appliedJobs.map((job) => (
                <tr key={job.id} className="border-b">
                  <td className="p-3">{job.title}</td>
                  <td className="p-3">{job.company}</td>
                  <td className="p-3">{job.location}</td>
                  <td className="p-3">{job.jobType}</td>
                  <td className="p-3 text-green-600 font-bold">
                    {job.salaryMin && job.salaryMax ? `₹${job.salaryMin} - ₹${job.salaryMax}` : "N/A"}
                  </td>
                  <td className="p-3">{new Date(job.appliedAt?.seconds * 1000).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={
                      job.status === "Approved" ? "text-green-500" :
                      job.status === "Rejected" ? "text-red-500" :
                      "text-yellow-500"
                    }>
                      {job.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/job/${job.jobId}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      View Job
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
