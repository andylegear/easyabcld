# ABC LD - Arena Blended Connected Learning Design Tool

A client-side web application for creating ABC Learning Design module plans based on Professor Diana Laurillard's Conversational Framework.

![ABC LD Tool](https://img.shields.io/badge/ABC-Learning%20Design-4a90a4)
![License](https://img.shields.io/badge/license-MIT-green)
![Pure JS](https://img.shields.io/badge/javascript-vanilla-yellow)

## Overview

ABC LD (Arena Blended Connected Learning Design) is a visual planning tool that helps educators design and map out their module delivery across weeks. It uses a Kanban-style board with swim lanes for each week, allowing you to create, organize, and visualize learning activities.

This tool runs entirely in the browser with no server required - just open `index.html` and start designing!

## Features

### 📋 Board Management
- **Flexible swim lanes** - Add as many weeks as needed (8, 13, or any number)
- **Customizable week titles** - Name each week and set start dates
- **Drag and drop** - Move activities between weeks easily
- **Auto-save** - Your work is automatically saved to browser localStorage

### 📝 Learning Activity Cards
Each activity card captures comprehensive information:
- **Title** - Name of the learning activity
- **Delivery date** - When the activity takes place
- **Duration** - How long the activity lasts
- **Delivered by** - Instructor/facilitator name
- **Description** - Detailed description of the activity
- **Additional notes** - UDL considerations, resources needed, etc.

### 🎨 Learning Types (Laurillard's Conversational Framework)
Tag activities with one or more learning types:
- 🔵 **Acquisition** - Reading, watching, listening
- 🟢 **Collaboration** - Working together on projects
- 🟠 **Discussion** - Exchanging ideas and perspectives
- 🟣 **Investigation** - Exploring and researching
- 🔴 **Practice** - Applying learning through exercises
- 🩵 **Production** - Creating artifacts and outputs

### 🏫 Delivery Styles
Specify the environment/mode of delivery:
- **Lecture** - Traditional lecture format
- **Tutorial** - Small group tutorials
- **Lab** - Practical lab sessions
- **Remote** - Online/distance learning
- **Blended** - Mix of in-person and online
- **Assessment** - Assessment activities

### 📊 Assessment Types
Mark assessment activities as:
- **Formative** - Ongoing feedback and development
- **Summative** - Final graded assessments

### 💾 Export & Save Options
- **Save to JSON** - Download your design as a JSON file for backup
- **Load from JSON** - Restore a previously saved design
- **Export to Image** - Generate a PNG screenshot of your board
- **Export to PDF** - Create a PDF document of your design

## Getting Started

### Quick Start
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start adding activities to your weeks!

### No Installation Required
This is a pure client-side application using:
- HTML5
- CSS3
- Vanilla JavaScript
- [html2canvas](https://html2canvas.hertzen.com/) (for image export)
- [jsPDF](https://github.com/parallax/jsPDF) (for PDF export)
- [Font Awesome](https://fontawesome.com/) (for icons)

## Usage Guide

### Creating a New Activity
1. Click **"+ Add Activity"** in any week column
2. Fill in the activity details
3. Select one or more learning types
4. Choose the delivery style and assessment type (if applicable)
5. Click **"Save Activity"**

### Editing an Activity
- Click on any activity card to open the edit modal
- Make your changes and click **"Save Activity"**
- Or click **"Delete"** to remove the activity

### Managing Weeks
- Click on a week header to edit its title and start date
- Use the arrow buttons to reorder weeks
- Click **"+ Add Week"** in the toolbar to add new weeks
- Delete weeks from the week settings modal

### Moving Activities
- Drag and drop cards between week columns
- Activities will automatically reorder within their new week

### Saving Your Work
- Your design auto-saves to browser localStorage every 30 seconds
- Click **"Save"** to download a JSON backup file
- Use **"Load"** to restore from a JSON file

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save to JSON file |
| `Ctrl + O` | Load from JSON file |
| `Ctrl + E` | Export to Image |
| `Escape` | Close any open modal |

## File Structure

```
easyabcld/
├── index.html    # Main HTML structure
├── styles.css    # Dark theme styling
├── app.js        # Application logic
├── README.md     # This file
└── LICENSE       # MIT License
```

## Browser Compatibility

Tested and working on:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## Credits

- **Conversational Framework** by Professor Diana Laurillard, UCL
- **ABC Learning Design** methodology from UCL Arena Centre

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ for educators everywhere
