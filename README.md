# Miro Notes App

Miro Notes is a simple note-taking application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication:** Secure signup and login functionality.
- **Note Management:** Create, read, update, and delete notes.
- **Sharing:** Share notes with other users.
- **Search:** Full-text search to find notes quickly.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [API Documentation](#api-documentation)
4. [Contributing](#contributing)
5. [License](#license)

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.
- [MongoDB](https://www.mongodb.com/) installed and running.

### Clone the Repository

```bash
git clone https://github.com/kr-001/NotesApp.git
cd NotesApp
```
##API Documentation
-The API provides the following endpoints:

- /api/auth/signup - User registration.
- /api/auth/login - User login.
- /api/notes - CRUD operations for notes.
- /api/notes/:id/share - Share a note with another user.
- /api/notes/search - Full-text search for notes.
- /api/notes/searchById/:id - Searchany note By ID.
- /api/notes/:id - DELETE method to delete a note by ID.
