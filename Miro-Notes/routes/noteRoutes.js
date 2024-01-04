const express = require('express');
const { ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");


const router = express.Router();


// Middleware to check if the request is authenticated
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }


    jwt.verify(token, 'miroToDoApp', (err, decoded) => {
        if (err || !decoded || !ObjectId.isValid(decoded.userId)) {
            return res.status(401).json({ message: 'Invalid token or userId' });
        }
        console.log("Decoded Payload: " , decoded);
        req.userId = decoded.userId;
        next();
    });
};

router.get('/', authenticate, async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.userId;

    const notes = await db.collection('notes').find({ userId }).toArray();
    res.json(notes);
});

router.get('/searchById/:id', authenticate, async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.userId;
    const noteId = req.params.id;

    if (!ObjectId.isValid(noteId)) {
        return res.status(400).json({ message: 'Invalid noteId format' });
    }

    const note = await db.collection('notes').findOne({ _id: new ObjectId(noteId), userId });

    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
});
router.post('/', authenticate, async (req, res) => {
    try {
        const db = req.app.locals.db;
        const userId = req.userId;
        const { title, content } = req.body;

      console.log("Request Body: ",req.body)

        // Save the note to the database
        await db.collection('notes').insertOne({
            title,
            content,
            userId,
        });

        res.json({ message: 'Note created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.put('/:id', authenticate, async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.userId;
    const noteId = req.params.id;
    const { title, content } = req.body;

    // Update the note in the database
    const result = await db.collection('notes').updateOne(
        { _id: new ObjectId(noteId), userId },
        { $set: { title, content } }
    );

    if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note updated successfully' });
});

router.delete('/:id', authenticate, async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.userId;
    const noteId = req.params.id;

    // Delete the note from the database
    const result = await db.collection('notes').deleteOne({ _id: ObjectId(noteId), userId });

    if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
});

router.post('/:id/share', authenticate, async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.userId;
    const noteId = req.params.id;
    const { recipientEmail } = req.body;

    // Check if reciever is there or not
    const recipient = await db.collection('users').findOne({ email: recipientEmail });
    if (!recipient) {
        return res.status(404).json({ message: 'Recipient user not found' });
    }

    // check for user and notes authenticity
    const note = await db.collection('notes').findOne({ _id: ObjectId(noteId), userId });
    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }

    const isShared = note.sharedWith && note.sharedWith.includes(recipient._id.toString());
    if (isShared) {
        return res.status(400).json({ message: 'Note already shared with the recipient' });
    }

   
    await db.collection('notes').updateOne(
        { _id: ObjectId(noteId) },
        { $addToSet: { sharedWith: recipient._id.toString() } }
    );

    res.json({ message: 'Note shared successfully' });
});


router.get('/search', authenticate, async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.userId;
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ message: 'Invalid or missing query parameter' });
    }

    // SEARCH based on the title of the note
    const searchResults = await db.collection('notes').find({
        $text: { $search: query },
        userId,
    }).project({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).toArray();

    return res.json(searchResults);
});




module.exports = router;
