const express = require(‘express’);
const mongoose = require(‘mongoose’);
const cors = require(‘cors’);
const dotenv = require(‘dotenv’);
const path = require(‘path’);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(‘public’));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI || ‘mongodb://localhost:27017/raushan-apps’;

mongoose.connect(mongoUri, {
useNewUrlParser: true,
useUnifiedTopology: true,
})
.then(() => console.log(‘MongoDB connected’))
.catch(err => console.log(‘MongoDB connection error:’, err));

// Schemas and Models

// Contact Message Schema
const contactSchema = new mongoose.Schema({
name: {
type: String,
required: true,
},
email: {
type: String,
required: true,
},
subject: {
type: String,
required: true,
},
message: {
type: String,
required: true,
},
createdAt: {
type: Date,
default: Date.now,
},
status: {
type: String,
enum: [‘new’, ‘read’, ‘replied’],
default: ‘new’,
}
});

const Contact = mongoose.model(‘Contact’, contactSchema);

// Blog Post Schema
const blogSchema = new mongoose.Schema({
title: {
type: String,
required: true,
},
excerpt: {
type: String,
required: true,
},
content: {
type: String,
required: true,
},
author: {
type: String,
default: ‘Raushan Kumar’,
},
category: {
type: String,
enum: [‘blog’, ‘opinions’, ‘motivation’],
default: ‘blog’,
},
createdAt: {
type: Date,
default: Date.now,
},
updatedAt: {
type: Date,
default: Date.now,
},
featured: {
type: Boolean,
default: false,
}
});

const Blog = mongoose.model(‘Blog’, blogSchema);

// Gallery Schema
const gallerySchema = new mongoose.Schema({
title: String,
imageUrl: String,
description: String,
category: {
type: String,
enum: [‘gallery’, ‘family’, ‘places’, ‘other’],
default: ‘gallery’,
},
createdAt: {
type: Date,
default: Date.now,
}
});

const Gallery = mongoose.model(‘Gallery’, gallerySchema);

// Admin/User Schema
const adminSchema = new mongoose.Schema({
username: {
type: String,
required: true,
unique: true,
},
password: {
type: String,
required: true,
},
email: String,
role: {
type: String,
enum: [‘admin’, ‘moderator’],
default: ‘admin’,
},
createdAt: {
type: Date,
default: Date.now,
}
});

const Admin = mongoose.model(‘Admin’, adminSchema);

// Routes

// Contact Routes
app.post(’/api/contacts’, async (req, res) => {
try {
const { name, email, subject, message } = req.body;

```
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = new Contact({
        name,
        email,
        subject,
        message,
    });

    await contact.save();

    res.status(201).json({
        success: true,
        message: 'Message received! Thank you for contacting us.',
        contact,
    });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
}
```

});

// Get all contacts (Admin only)
app.get(’/api/contacts’, async (req, res) => {
try {
const contacts = await Contact.find().sort({ createdAt: -1 });
res.json(contacts);
} catch (error) {
res.status(500).json({ error: ‘Server error’ });
}
});

// Get single contact
app.get(’/api/contacts/:id’, async (req, res) => {
try {
const contact = await Contact.findById(req.params.id);
if (!contact) {
return res.status(404).json({ error: ‘Contact not found’ });
}
res.json(contact);
} catch (error) {
res.status(500).json({ error: ‘Server error’ });
}
});

// Update contact status
app.put(’/api/contacts/:id’, async (req, res) => {
try {
const { status } = req.body;
const contact = await Contact.findByIdAndUpdate(
req.params.id,
{ status },
{ new: true }
);
res.json(contact);
} catch (error) {
res.status(500).json({ error: ‘Server error’ });
}
});

// Blog Routes
app.get(’/api/blogs’, async (req, res) => {
try {
const { category } = req.query;
let query = {};
if (category) query.category = category;

```
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    res.json(blogs);
} catch (error) {
    res.status(500).json({ error: 'Server error' });
}
```

});

app.get(’/api/blogs/:id’, async (req, res) => {
try {
const blog = await Blog.findById(req.params.id);
if (!blog) {
return res.status(404).json({ error: ‘Blog not found’ });
}
res.json(blog);
} catch (error) {
res.status(500).json({ error: ‘Server error’ });
}
});

app.post(’/api/blogs’, async (req, res) => {
try {
const { title, excerpt, content, category, featured } = req.body;

```
    const blog = new Blog({
        title,
        excerpt,
        content,
        category,
        featured,
    });

    await blog.save();
    res.status(201).json(blog);
} catch (error) {
    res.status(500).json({ error: 'Server error' });
}
```

});

app.put(’/api/blogs/:id’, async (req, res) => {
try {
const blog = await Blog.findByIdAndUpdate(
req.params.id,
{ …req.body, updatedAt: Date.now() },
{ new: true }
);
res.json(blog);
} catch (error) {
res.status(500).json({ error: ‘Server error’ });
}
});

app.delete(’/api/blogs/:id’, async (req, res) => {
try {
await Blog.findByIdAndDelete(req.params.id);
res.json({ message: ‘Blog deleted’ });
} catch (error) {
res.status(500).json({ error: ‘Server error’ });
}
});

// Gallery Routes
app.get(’/api/gallery’, async (req, res) => {
try {
const { category } = req.query;
let query = {};
if (category) query.category = category;

```
    const gallery = await Gallery.find(query).sort({ createdAt: -1 });
    res.json(gallery);
} catch (error) {
    res.status(500).json({ error: 'Server error' });
}
```

});

app.post(’/api/gallery’, async (req, res) => {
try {
const { title, imageUrl, description, category } = req.body;

```
    const galleryItem = new Gallery({
        title,
        imageUrl,
        description,
        category,
    });

    await galleryItem.save();
    res.status(201).json(galleryItem);
} catch (error) {
    res.status(500).json({ error: 'Server error' });
}
```

});

app.delete(’/api/gallery/:id’, async (req, res) => {
try {
await Gallery.findByIdAndDelete(req.params.id);
res.json({ message: ‘Gallery item deleted’ });
} catch (error) {
res.status(500).json({ error: ‘Server error’ });
}
});

// Health Check
app.get(’/api/health’, (req, res) => {
res.json({ status: ‘Server is running’ });
});

// Home route
app.get(’/’, (req, res) => {
res.sendFile(path.join(__dirname, ‘public’, ‘index.html’));
});

// 404 Handler
app.use((req, res) => {
res.status(404).json({ error: ‘Route not found’ });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});