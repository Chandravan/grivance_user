import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "firebase/firestore";
import "./GrievanceTracker.css";

const GrievanceTracker = () => {
  const [grievanceId, setGrievanceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [grievance, setGrievance] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); 

  

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!grievanceId.trim()) {
      setError("Please enter a valid Grievance ID");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const grievanceRef = doc(db, "grievances", grievanceId);
      const grievanceSnap = await getDoc(grievanceRef);
      
      if (!grievanceSnap.exists()) {
        setError("No grievance found with this ID. Please check and try again.");
        setGrievance(null);
        setComments([]);
        setLoading(false);
        return;
      }
      
      setGrievance({ id: grievanceSnap.id, ...grievanceSnap.data() });
      
      // Fetch comments
      const commentsQuery = query(
        collection(db, "grievanceComments"),
        where("grievanceId", "==", grievanceId),
        orderBy("timestamp", "asc")
      );
      
      const commentsSnap = await getDocs(commentsQuery);
      const commentsData = commentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setComments(commentsData);
      
    } catch (error) {
      console.error("Error fetching grievance:", error);
      setError("Failed to fetch grievance details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!grievance) return;
    
    setLoading(true);
    try {
      const grievanceRef = doc(db, "grievances", grievanceId);
      await updateDoc(grievanceRef, {
        status: newStatus,
        lastUpdated: serverTimestamp()
      });
      
      // Update local state
      setGrievance({
        ...grievance,
        status: newStatus,
        lastUpdated: new Date()
      });
      
      // Add a comment about the status change
      await addComment(`Status updated to: ${newStatus}`, true);
      
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (message, isStatusUpdate = false) => {
    if (!message.trim() || !grievanceId) return;
    
    try {
      const commentData = {
        grievanceId,
        message,
        isAdmin,
        isStatusUpdate,
        timestamp: serverTimestamp(),
        author: isAdmin ? "Admin" : "You"
      };
      
      const docRef = await addDoc(collection(db, "grievanceComments"), commentData);
      
      // Update local state
      setComments([
        ...comments,
        {
          id: docRef.id,
          ...commentData,
          timestamp: new Date()
        }
      ]);
      
      // Clear input
      setNewComment("");
      
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    await addComment(newComment);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "status-pending";
      case "In Progress": return "status-progress";
      case "Resolved": return "status-resolved";
      case "Closed": return "status-closed";
      case "Rejected": return "status-rejected";
      default: return "";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
    return date.toLocaleString();
  };

  return (
    <div className="grievance-tracker-container">
      <div className="tracker-header">
        <h2>Grievance Status Tracker</h2>
      
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-box">
          <input
            type="text"
            value={grievanceId}
            onChange={(e) => setGrievanceId(e.target.value)}
            placeholder="Enter Grievance ID"
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>

      {grievance && (
        <div className="grievance-details">
          <div className="grievance-header">
            <h3>Grievance #{grievance.id.substring(0, 8)}</h3>
            <div className={`status-badge ${getStatusClass(grievance.status)}`}>
              {grievance.status}
            </div>
          </div>
          
          <div className="grievance-info">
            <div className="info-group">
              <span className="info-label">Category:</span>
              <span className="info-value">{grievance.category}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Submitted:</span>
              <span className="info-value">{formatDate(grievance.timestamp)}</span>
            </div>
            <div className="info-group">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">{formatDate(grievance.lastUpdated)}</span>
            </div>
          </div>
          
          <div className="grievance-description">
            <h4>Description</h4>
            <p>{grievance.description}</p>
          </div>
          
          {isAdmin && (
            <div className="admin-actions">
              <h4>Update Status</h4>
              <div className="status-buttons">
                <button 
                  onClick={() => handleStatusChange("Pending")}
                  className={`status-btn ${grievance.status === "Pending" ? 'active' : ''}`}
                  disabled={grievance.status === "Pending"}
                >
                  Pending
                </button>
                <button 
                  onClick={() => handleStatusChange("In Progress")}
                  className={`status-btn ${grievance.status === "In Progress" ? 'active' : ''}`}
                  disabled={grievance.status === "In Progress"}
                >
                  In Progress
                </button>
                <button 
                  onClick={() => handleStatusChange("Resolved")}
                  className={`status-btn ${grievance.status === "Resolved" ? 'active' : ''}`}
                  disabled={grievance.status === "Resolved"}
                >
                  Resolved
                </button>
                <button 
                  onClick={() => handleStatusChange("Closed")}
                  className={`status-btn ${grievance.status === "Closed" ? 'active' : ''}`}
                  disabled={grievance.status === "Closed"}
                >
                  Closed
                </button>
                <button 
                  onClick={() => handleStatusChange("Rejected")}
                  className={`status-btn ${grievance.status === "Rejected" ? 'active' : ''}`}
                  disabled={grievance.status === "Rejected"}
                >
                  Rejected
                </button>
              </div>
            </div>
          )}
          
          <div className="grievance-communication">
            
            <div className="grievance-communication">
  <h4>Communication</h4>

  <div className="communication-section">
    {grievance?.autoReply ? (
      <div className="comment auto-reply">
        <div className="comment-header">
          <span className="comment-author">Reply:-</span>
          <span className="comment-time">{formatDate(grievance?.timestamp)}</span>
        </div>
        <div className="comment-body">
          {grievance.autoReply}
        </div>
      </div>
    ) : (
      <p className="no-comments">No communication yet.</p>
    )}
  </div>
</div>
 
           
            
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={isAdmin ? "Reply to this grievance..." : "Add additional information..."}
                className="comment-input"
                rows="3"
              />
              <button type="submit" className="comment-submit" disabled={!newComment.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrievanceTracker;