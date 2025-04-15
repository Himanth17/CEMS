const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_KEY);
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Student Login
app.post('/student-login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || data.user.user_metadata.role !== 'student') {
    return res.status(401).json({ error: 'Invalid credentials or role' });
  }
  res.json({ redirect: '/dashboard.html' });
});

// Faculty Login
app.post('/faculty-login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || data.user.user_metadata.role !== 'faculty') {
    return res.status(401).json({ error: 'Invalid credentials or role' });
  }
  res.json({ redirect: '/dashboard.html' });
});

// Get Today's Event
app.get('/api/today-event', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('date', today)
    .eq('status', 'booked')
    .limit(1);
  if (error) return res.status(500).json({ error });
  res.json(data[0] || { name: 'No event today', chief_guest: '' });
});

// Check Slot Availability
app.post('/api/check-slot', async (req, res) => {
  const { date, time, venue } = req.body;
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('date', date)
    .eq('time', time)
    .eq('venue', venue)
    .eq('status', 'booked');
  if (error) return res.status(500).json({ error });
  res.json({ status: data.length > 0 ? 'booked' : 'available' });
});

// Create Event (after payment)
app.post('/api/create-event', async (req, res) => {
  const { name, date, time, venue, chief_guest, audience_limit, user_id } = req.body;
  const { data, error } = await supabase
    .from('events')
    .insert([
      { name, date, time, venue, chief_guest, audience_limit, status: 'booked' },
    ])
    .select();
  if (error) return res.status(500).json({ error });

  const event_id = data[0].id;
  await supabase
    .from('bookings')
    .insert([{ user_id, event_id, payment_status: 'completed' }]);
  res.json({ message: 'Event booked successfully' });
});

// Stripe Payment
app.post('/api/create-payment', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: 'price_123', quantity: 1 }], // Replace with your Stripe price ID
    mode: 'payment',
    success_url: 'http://localhost:3000/success.html',
    cancel_url: 'http://localhost:3000/event-form.html',
  });
  res.json({ id: session.id });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});