import { useState } from "react";
import { db } from "../firebase/Firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user || user.role !== "admin") {
    navigate("/"); // Redirect non-admin users
    return null;
  }

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");

  const handlePostJob = async (e) => {
    e.preventDefault();

    await addDoc(collection(db, "jobs"), {
      title,
      company,
      location,
      salary,
      description,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
    });

    navigate("/");
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold">Post a Job</h2>
      <form onSubmit={handlePostJob}>
        <input type="text" placeholder="Job Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        <button type="submit">Post Job</button>
      </form>
    </div>
  );
};

export default PostJob;
