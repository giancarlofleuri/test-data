# Card Sorting Analysis Visualization

An interactive visualization tool for analyzing card sorting results from user experience research. Built with D3.js and modern web technologies.

![Card Sorting Heatmap](preview.png)

## Features

- Interactive co-occurrence heatmap
- Detailed statistics dashboard
- Expandable relationship analysis
- Participant grouping insights
- Print-friendly layout
- Responsive design
- MoniePoint brand styling

## Live Demo

You can view the live demo on CodePen: [Card Sorting Analysis Demo](#) *(Add your CodePen link)*

## Getting Started

### Prerequisites

- A modern web browser
- Basic understanding of HTML, CSS, and JavaScript
- Local development server (optional)

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/card-sorting-analysis.git
cd card-sorting-analysis
```

2. Start a local server:
```bash
python -m http.server 8000
# or
npx http-server
```

3. Open `http://localhost:8000` in your browser

### Using GitHub Codespaces

1. Click the "Code" button on this repository
2. Select "Open with Codespaces"
3. Click "New codespace"
4. Wait for the environment to build
5. The project will automatically start in development mode

## Project Structure

```
.
├── README.md
├── index.html              # Main HTML file
├── styles.css             # Styles and theming
├── visualization.js       # D3.js visualization logic
├── data/
│   └── card_cooccurrence_matrix.csv  # Sample data
└── .devcontainer/         # Codespace configuration
```

## Data Format

The visualization expects a CSV file with the following structure:

```csv
card,Card1,Card2,Card3
Card1,9,5,2
Card2,5,8,4
Card3,2,4,7
```

## Customization

### Colors

The visualization uses CSS variables for theming. You can modify the colors in `styles.css`:

```css
:root {
    --moniepoint-blue: #0066CC;
    --moniepoint-light-blue: #E5F0FF;
    /* ... other variables ... */
}
```

### Dimensions

Adjust the heatmap size in `visualization.js`:

```javascript
const margin = { top: 120, right: 50, bottom: 100, left: 250 };
const width = 1000 - margin.left - margin.right;
const height = 1000 - margin.top - margin.bottom;
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [D3.js](https://d3js.org/)
- Inspired by Apple's design system
- Created for MoniePoint's UX research team 