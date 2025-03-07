import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/Firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      const jobRef = doc(db, "jobs", id);
      const jobSnap = await getDoc(jobRef);

      if (jobSnap.exists()) {
        setJob(jobSnap.data());
      } else {
        setJob(null);
      }
      setLoading(false);
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    console.log("Current user:", user); // Debugging: Check if user is null

    if (!user) {
      setError("You must be logged in to apply for a job.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      await addDoc(collection(db, "applications"), {
        jobId: id,
        userId: user.uid,
        username: userData.username || "Anonymous",
        email: userData.email || "No Email",
        appliedAt: serverTimestamp(),
      });

      setSuccess(true);
      setError("");
    } catch (err) {
      setError("Failed to apply for the job.");
      console.error("Error applying:", err);
    }
  };

  if (loading) return <p className="text-center">Loading job details...</p>;
  if (!job) return <p className="text-center text-red-500">Job not found.</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <p className="text-gray-700">{job.company}</p>
        <p className="text-gray-500">{job.location}</p>
        <p className="text-green-600 font-bold">₹{job.salary}</p>
        <p className="mt-4">{job.description}</p>

        {success && <p className="text-green-500 mt-4">Application submitted successfully!</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        <button
          onClick={handleApply}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          disabled={success}
        >
          {success ? "Applied" : "Apply Now"}
        </button>
      </div>
    </div>
  );
};

export default JobDetails;
