import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./GrievanceForm.css";

const GrievanceForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  //  Step 1: Function to assign priority based on keywords
  const assignPriority = (description) => {
    const desc = description.toLowerCase();

    const highKeywords = ["urgent" , "electricity gone", "danger", "leak", "flood", "water issue", "water leak"];
    const mediumKeywords = ["not working", "slow", "broken", "damaged", "dirty"];

    for (let word of highKeywords) {
      if (desc.includes(word)) return "high";
    }

    for (let word of mediumKeywords) {
      if (desc.includes(word)) return "medium";
    }

    return "low";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      //  Step 2: Call Cloud Function for duplicate check
      const response = await fetch(
        "https://us-central1-grievance-sys-2025.cloudfunctions.net/checkDuplicateGrievance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: form.description }),
        }
      );

      if (!response.ok) {
        throw new Error("Duplicate check failed");
      }

      const { isDuplicate, match, autoReply, originalId } = await response.json();

      //  Step 3: Assign priority before saving
      const priority = assignPriority(form.description);

      const grievanceData = {
        ...form,
        isDuplicate,
        priority, //  Saving auto-assigned priority
        status: isDuplicate ? "Duplicate" : "Pending",
        timestamp: serverTimestamp(),
        ...(isDuplicate && {
          originalText: match || "",
          autoReply: autoReply || "",
          originalId: originalId || "",
        }),
        ...(!isDuplicate && {
          originalId: "",
          autoReply: "",
          originalText: "",
        }),
      };

      const docRef = await addDoc(collection(db, "grievances"), grievanceData);
      setSuccessId(docRef.id);
      setForm({ name: "", email: "", category: "", description: "" });
    } catch (error) {
      setError("Failed to submit grievance. Please try again later.");
      console.error("Grievance submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grievance-container">
      <div className="grievance-header">
        <div className="grievance-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <h2 className="grievance-title">Submit Grievance</h2>
        <p className="grievance-subtitle">Please fill in the details of your concern</p>
      </div>

      {successId ? (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <p>Your grievance has been successfully submitted!</p>
            <p>Reference ID: <span className="reference-id">{successId}</span></p>
            <button onClick={() => setSuccessId("")} className="submit-another-btn">
              Submit another grievance
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grievance-form">
          {error && <div className="error-message"><p>{error}</p></div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              onChange={handleChange}
              value={form.name}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              onChange={handleChange}
              value={form.email}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              onChange={handleChange}
              value={form.category}
              required
            >
              <option value="">Select Category</option>
              <option value="Garbage">Garbage</option>
              <option value="Drain">Drain</option>
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
              <option value="Traffic">Traffic</option>
              <option value="Enquiries">Enquiries</option>
              <option value="Cyber Fraud">Cyber Fraud</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Please provide details about your issue..."
              onChange={handleChange}
              value={form.description}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`submit-btn ${isSubmitting ? "submitting" : ""}`}
          >
            {isSubmitting ? "Submitting..." : "Submit Grievance"}
          </button>
        </form>
      )}
    </div>
  );
};

export default GrievanceForm;
