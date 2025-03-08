import { useEffect, useState } from "react";
import { db } from "../firebase/Firebase";
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
    setLoading(false);
  }, [user]);

  const fetchApplications = async (jobId) => {
    if (applications[jobId]) return; // Skip if already fetched

    try {
      const q = query(collection(db, "applications"), where("jobId", "==", jobId));
      const querySnapshot = await getDocs(q);
      const applicationsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setApplications(prevState => ({
        ...prevState,
        [jobId]: applicationsList,
      }));
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, { status: newStatus });

      setApplications(prevState => {
        const updatedApps = prevState;
        Object.keys(updatedApps).forEach(jobId => {
          updatedApps[jobId] = updatedApps[jobId].map(app =>
            app.id === appId ? { ...app, status: newStatus } : app
          );
        });
        return { ...updatedApps };
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  if (!user || user.role !== "admin") {
    return <p className="text-center text-red-500">Access Denied: Admins Only</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>

      {loading ? (
        <p className="text-center">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-center">No jobs posted yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-700">{job.company}</p>
              <p className="text-gray-500">{job.location}</p>
              <p className="text-blue-500 font-semibold">Job Type: {job.jobType}</p>
              <p className="text-green-600 font-bold">₹{job.salaryMin} - ₹{job.salaryMax}</p>
              
              <button onClick={() => fetchApplications(job.id)}
                className="mt-2 bg-blue-500 text-white px-3 py-2 rounded">
                View Applications
              </button>
              <button onClick={() => handleDeleteJob(job.id)}
                className="mt-2 ml-2 bg-red-500 text-white px-3 py-2 rounded">
                Delete Job
              </button>

              {applications[job.id] && (
                <div className="mt-4">
                  <h3 className="font-bold">Applicants:</h3>
                  {applications[job.id].length === 0 ? (
                    <p>No applications yet.</p>
                  ) : (
                    applications[job.id].map((app, index) => (
                      <div key={index} className="border p-2 mt-2 rounded">
                        <p><strong>Name:</strong> {app.username}</p>
                        <p><strong>Email:</strong> {app.email}</p>
                        <p>
                          <strong>Status:</strong> 
                          <span className={
                            app.status === "Approved" ? "text-green-500" :
                            app.status === "Rejected" ? "text-red-500" :
                            "text-yellow-500"
                          }>
                            {app.status || "Pending"}
                          </span>
                        </p>

                        {app.resumeUrl && (
                          <p>
                            <a href={app.resumeUrl} target="_blank" className="text-blue-500 underline">
                              View Resume
                            </a>
                          </p>
                        )}

                        <button onClick={() => updateApplicationStatus(app.id, "Approved")}
                          className="bg-green-500 text-white px-2 py-1 rounded m-1">Approve</button>
                        <button onClick={() => updateApplicationStatus(app.id, "Rejected")}
                          className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
