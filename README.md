# Connected World of Crime, Politics, and Intelligence

An interactive network visualization application that explores the intricate connections between organized crime figures, intelligence operatives, and political figures spanning nearly a century. Built from data extracted from "The World Beneath" podcast series.

![Character Network Visualization](https://img.shields.io/badge/React-18+-blue.svg)
![D3.js](https://img.shields.io/badge/D3.js-7.9.0-orange.svg)
![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🌟 Features

### 🕸️ Interactive Network Visualization
- **Full Network View**: Explore the complete web of connections between all characters
- **Individual Character Networks**: Generate focused networks showing all connections for any specific character
- **Multi-dimensional Relationships**: Visualize upstream (bosses), downstream (subordinates), and horizontal (peers/associates/family) connections
- **Second-degree Connections**: See not just direct connections, but connections of connections

### 🎯 Advanced Filtering
- **Category-based Filtering**: Browse by Organized Crime, Intelligence & Law Enforcement, Political Figures, or Other
- **149+ Characters**: Comprehensive database covering nearly a century of interconnected figures
- **Smart Character Matching**: Flexible search handles name variations and aliases

### 📚 Rich Character Profiles
- **Wikipedia Integration**: Complete biographical information with professional photos
- **Detailed Summaries**: Full character backgrounds without truncation
- **Historical Context**: Era-specific information and organizational affiliations
- **Role Classifications**: Clear categorization of each character's primary role and influence

### 🎨 Professional Design
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Interactive Elements**: Drag-and-drop network nodes, hover effects, and detailed tooltips
- **Color-coded Relationships**: Visual distinction between different types of connections
- **Clean UI**: Professional styling with intuitive navigation

## 🚀 Live Demo

Visit the live application: [Connected World Network](https://ajbardxv.manus.space)

## 🛠️ Technology Stack

- **Frontend**: React 19+ with modern hooks
- **Visualization**: D3.js for interactive network graphs
- **Styling**: Tailwind CSS with custom components
- **Build Tool**: Vite for fast development and optimized builds
- **Deployment**: GitHub Pages ready

## 📊 Data Highlights

- **149 Characters** from organized crime, intelligence, and political spheres
- **41 Documented Relationships** with detailed annotations
- **4 Major Categories**: Organized Crime, Intelligence, Politics, Other
- **Multi-era Coverage**: From 1900s prohibition era to modern times
- **Cross-domain Connections**: Revealing surprising links between different worlds

### Key Network Insights
- **Meyer Lansky** emerges as the most central figure, connecting multiple eras and organizations
- **Intelligence-Crime Intersections**: Documented connections between FBI/OSS operatives and organized crime
- **Political Connections**: Relationships spanning from local politics to presidential administrations
- **Modern Relevance**: Connections extending to contemporary political figures

## 🏗️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/character-network-app.git
   cd character-network-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
# or
yarn build
```

## 🚀 Deployment

### GitHub Pages Deployment

1. **Configure repository settings**
   - Go to repository Settings → Pages
   - Set source to "GitHub Actions"

2. **Deploy using npm script**
   ```bash
   npm run deploy
   ```

3. **Access your deployed app**
   Your app will be available at: `https://yourusername.github.io/character-network-app/`

### Alternative Deployment Options

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **Surge**: `npm install -g surge && surge dist/`

## 📁 Project Structure

```
character-network-app/
├── public/
│   ├── enhanced_character_network.json      # Network data
│   ├── final_comprehensive_character_database.json  # Character profiles
│   └── index.html
├── src/
│   ├── CompletelyFixedApp.jsx              # Main application component
│   ├── App.jsx                             # App wrapper
│   ├── App.css                             # Styles
│   └── main.jsx                            # Entry point
├── package.json
├── vite.config.js                          # Vite configuration
└── README.md
```

## 🎯 Usage Guide

### Exploring the Network

1. **Full Network View**: Start with the complete network to see all connections
2. **Category Filtering**: Select a category from the dropdown to focus on specific types of characters
3. **Individual Networks**: Click any character to generate their personal network showing all connections
4. **Interactive Exploration**: 
   - Drag nodes to rearrange the visualization
   - Hover over nodes for quick information
   - Click nodes to switch focus to that character

### Understanding Relationships

- **Red nodes**: Organized Crime figures
- **Blue nodes**: Intelligence & Law Enforcement
- **Green nodes**: Political figures  
- **Yellow nodes**: Other figures
- **Connection lines**: Represent documented relationships with annotations

## 📖 Data Sources

This application is built from data extracted from **"The World Beneath"** podcast series, which provides in-depth investigation into the connections between organized crime, intelligence agencies, and political figures throughout American history.

**Podcast Credits**: "The World Beneath" - [Listen on Apple Podcasts](https://podcasts.apple.com/us/podcast/the-world-beneath/id1234567890)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **"The World Beneath" Podcast** - Primary data source
- **D3.js Community** - For excellent visualization tools
- **React Team** - For the robust frontend framework
- **Wikipedia** - For character photos and biographical information

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/character-network-app/issues) page
2. Create a new issue with detailed description
3. Include browser information and steps to reproduce

---

**Made with ♥ by [Your Name]**

*Exploring the hidden connections that shape our world*

