import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Note {
  _id: string;
  content: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Parse JWT to get user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ name: payload.name, email: payload.email });
    } catch {
      localStorage.removeItem('token');
      navigate('/signin');
    }
  }, [navigate]);

  // Fetch notes
  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch (err: any) {
      setError('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  // Create note
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!noteContent.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/notes',
        { content: noteContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNoteContent('');
      fetchNotes();
    } catch (err: any) {
      setError('Failed to create note');
    }
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotes();
    } catch (err: any) {
      setError('Failed to delete note');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <button onClick={handleLogout} className="text-sm text-blue-600">Logout</button>
        </div>
        {user && (
          <div className="mb-4">
            <div className="font-semibold">Welcome, {user.name}!</div>
            <div className="text-gray-500 text-sm">{user.email}</div>
          </div>
        )}
        <form onSubmit={handleCreateNote} className="flex mb-4">
          <input
            type="text"
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            className="flex-1 border rounded-l px-3 py-2"
            placeholder="Enter a note..."
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r">Create</button>
        </form>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div>
          {loading ? (
            <div>Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="text-gray-500">No notes yet.</div>
          ) : (
            <ul>
              {notes.map(note => (
                <li key={note._id} className="flex justify-between items-center border-b py-2">
                  <span>{note.content}</span>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="text-red-500 text-sm ml-2"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 