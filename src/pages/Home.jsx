import { useEffect, useState } from "react";
import { db } from "../firebase/Firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Job Listings</h1>

      {loading ? (
        <p className="text-center">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-center">No jobs available.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-700">{job.company}</p>
              <p className="text-gray-500">{job.location}</p>
              <p className="text-green-600 font-bold">₹{job.salaryMin} - ₹{job.salaryMax}</p>
              <Link to={`/job/${job.id}`} className="text-blue-500">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
