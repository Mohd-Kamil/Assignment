import { Router, Request, Response } from 'express';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { supabase } from '../utils/supabase';

const router = Router();

// Get all notes for the authenticated user
router.get('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    return res.status(500).json({ error: 'Failed to fetch notes' });
  }
  res.json(notes);
});

// Create a new note
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required.' });
  }
  const { data: note, error } = await supabase
    .from('notes')
    .insert([{ user_id: userId, content }])
    .select()
    .single();
  if (error) {
    return res.status(500).json({ error: 'Failed to create note' });
  }
  res.status(201).json(note);
});

// Delete a note
router.delete('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const noteId = req.params.id;
  // Only delete if the note belongs to the user
  const { data: note, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error || !note) {
    return res.status(404).json({ error: 'Note not found.' });
  }
  res.json({ message: 'Note deleted.' });
});

export default router; 