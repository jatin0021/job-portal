import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { db } from "../firebase/Firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };



const handleApply = async () => {
  if (!user) {
    setError("You must be logged in to apply for a job.");
    return;
  }

  if (!resume) {
    setError("Please upload your resume before applying.");
    return;
  }

  setUploading(true);

  try {
    // ✅ Use Correct Cloudinary Upload URL
    const formData = new FormData();
    formData.append("file", resume);
    formData.append("upload_preset", "job_portal_resumes"); // ✅ Replace with your Cloudinary upload preset

    const cloudinaryResponse = await axios.post(
      "https://api.cloudinary.com/v1_1/dg0lvfamx/upload", // ✅ Replace with your Cloudinary Cloud Name
      formData
    );

    const resumeUrl = cloudinaryResponse.data.secure_url; // ✅ Get the secure URL

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    await addDoc(collection(db, "applications"), {
      jobId: id,
      userId: user.uid,
      username: userData.username || "Anonymous",
      email: userData.email || "No Email",
      appliedAt: serverTimestamp(),
      resumeUrl: resumeUrl,
      status: "Pending",
    });

    setSuccess(true);
    setError("");
  } catch (err) {
    setError("Failed to upload resume. Please try again.");
    console.error("Upload Error:", err);
  }

  setUploading(false);
};

  
  if (loading) return <p className="text-center">Loading job details...</p>;
  if (!job) return <p className="text-center text-red-500">Job not found.</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <p className="text-gray-700">{job.company}</p>
        <p className="text-gray-500">{job.location}</p>
        <p className="text-green-600 font-bold">₹{job.salaryMin} - ₹{job.salaryMax}</p>
        <p className="text-blue-500 font-semibold">Job Type: {job.jobType}</p>
        <p className="text-purple-500 font-semibold">Experience Level: {job.experienceLevel}</p>

        {job.companyWebsite && (
          <p>
            <a href={job.companyWebsite} target="_blank" className="text-blue-500 underline">
              Visit Company Website
            </a>
          </p>
        )}

        <div className="mt-4 border-t pt-4">
          <h3 className="text-xl font-semibold">Job Description</h3>
          <div dangerouslySetInnerHTML={{ __html: job.description }} className="prose max-w-none mt-2" />
        </div>

        {success && <p className="text-green-500 mt-4">Application submitted successfully!</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="mt-4">
          <label className="block font-semibold">Upload Resume (PDF/DOCX):</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="mt-2 border p-2 w-full rounded" />
        </div>

        <button
          onClick={handleApply}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          disabled={uploading || success}
        >
          {uploading ? "Uploading..." : success ? "Applied" : "Apply Now"}
        </button>
      </div>
    </div>
  );
};

export default JobDetails;
