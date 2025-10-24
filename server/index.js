const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const validateRoutes = require('./routes/validate');
const mergeRoutes = require('./routes/merge');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/validate', validateRoutes);
app.use('/api/merge', mergeRoutes);

// Serve built client (optional)
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
