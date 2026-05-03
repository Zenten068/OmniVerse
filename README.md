# OmniVerse 🌌

OmniVerse is a modern, responsive media discovery and tracking web application. It allows users to explore trending movies, popular TV shows, and new animations. Powered by the TMDB API, OmniVerse provides a seamless experience for discovering your next favorite watch and managing your personalized watchlist.

![screenshot](https://github.com/Zenten068/OmniVerse/blob/main/Output.png)

## 🌟 Key Features

- **Media Discovery**: Browse through trending, top-rated, and popular movies and TV shows.
- **Search Engine**: Fast and responsive debounced search to find exactly what you're looking for.
- **Detailed Information**: View comprehensive details about movies and TV shows, including cast, ratings, and related media.
- **Personalized Watchlist**: Add your favorite movies and shows to your custom watchlist using Redux state management.
- **Streaming Availability**: Instantly see which streaming platforms (Netflix, Hulu, Prime, etc.) have the movie or TV show available to watch.
- **Dark Mode Support**: Beautiful and sleek UI with built-in dark mode for comfortable nighttime viewing.
- **Infinite Scrolling**: Explore endless content with smooth infinite scrolling on the discovery pages.

## 💻 Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Icons**: Lucide React
- **API**: TMDB (The Movie Database) API

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zenten068/OmniVerse.git
   cd Omniverse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory or `src/api/.env` and add your TMDB API key:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
   *(Note: The project might currently have the key hardcoded in `src/api/tmdb.js` for testing, but using `.env` is recommended for production)*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Open your browser and navigate to `http://localhost:5173/` to see OmniVerse in action.

## 👨‍💻 Made By

**Aman Saklani** 

