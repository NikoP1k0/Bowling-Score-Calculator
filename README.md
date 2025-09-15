# Bowling Score Calculator

An interactive web app for keeping track of bowling scores for up to 6 players. Built with React (frontend) and Node.js/Express (backend), this project demonstrates a dynamic state management and real-time bowling score calculation—including official scoring rules for strikes and spares.

## Features
* Multi-player: Track up to 6 players’ scores simultaneously.
* Intuitive UI: Enter rolls by clicking pin buttons—no typing required.
* Official scoring: Handles strikes, spares, and 10th-frame rules just like a real bowling alley.
* Live totals: See running and per-frame scores as you play.
* Max possible: Shows the maximum possible score you can still achieve.
* Rename & delete: Rename scorecards or remove them at any time.
* Dynamic: Players can fill out their scorecards in any order.

## Getting Started
Prerequisites
* [Node.js](https://nodejs.org/en) (v16 or newer recomended)
* [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. Clone the repository:
   `git clone https://github.com/yourusername/bowling-score-calculator.git
    cd bowling-score-calculator`

2. Install backend dependencies:
   `cd backend
    npm install`

3. Install frontend dependencies:
   `cd ../frontend
    npm install`

### Running the App

**Start the backend:**
    `cd backend
    npm start`

The backend will run on [http://localhost:3001](http://localhost:3001).

**Start the frontend:**
    `cd ../frontend
    npm start`

The frontend will run on [http://localhost:3000](http://localhost:3000).

**Note:** The frontend expects the backend to be running on port 3001.

**Technologies Used**
* Frontend: React, JavaScript, CSS
* Backend: Node.js, Express
