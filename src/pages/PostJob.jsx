import { useState } from "react";
import { db } from "../firebase/Firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    salaryMin: "",
    salaryMax: "",
    experienceLevel: "Entry Level",
    description: "",
    companyWebsite: "",
  });

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      setJobData({ ...jobData, description: editor.getHTML() });
    },
  });

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!jobData.title || !jobData.company || !jobData.location || !jobData.description) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "jobs"), {
        ...jobData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      alert("Job posted successfully!");
      navigate("/");
    } catch (err) {
      alert("Failed to post job.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Post a Job</h1>

        <form onSubmit={handlePostJob} className="space-y-4">
          <input type="text" name="title" placeholder="Job Title *" className="w-full p-2 border rounded"
            value={jobData.title} onChange={handleChange} required />

          <input type="text" name="company" placeholder="Company Name *" className="w-full p-2 border rounded"
            value={jobData.company} onChange={handleChange} required />

          <input type="text" name="location" placeholder="Location (City, Country) *" className="w-full p-2 border rounded"
            value={jobData.location} onChange={handleChange} required />

          {/* Job Type */}
          <select name="jobType" className="w-full p-2 border rounded" value={jobData.jobType} onChange={handleChange}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Remote</option>
            <option>Contract</option>
          </select>

          {/* Salary Range */}
          <div className="flex space-x-2">
            <input type="number" name="salaryMin" placeholder="Min Salary (₹)" className="w-1/2 p-2 border rounded"
              value={jobData.salaryMin} onChange={handleChange} />
            <input type="number" name="salaryMax" placeholder="Max Salary (₹)" className="w-1/2 p-2 border rounded"
              value={jobData.salaryMax} onChange={handleChange} />
          </div>

          {/* Experience Level */}
          <select name="experienceLevel" className="w-full p-2 border rounded"
            value={jobData.experienceLevel} onChange={handleChange}>
            <option>Entry Level</option>
            <option>Mid Level</option>
            <option>Senior Level</option>
          </select>

          {/* Job Description (Tiptap Editor) */}
          <div className="w-full p-2 border rounded bg-white">
            <EditorContent editor={editor} />
          </div>

          {/* Company Website */}
          <input type="url" name="companyWebsite" placeholder="Company Website (Optional)" className="w-full p-2 border rounded"
            value={jobData.companyWebsite} onChange={handleChange} />

          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Post Job
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
