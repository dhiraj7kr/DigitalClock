

# Digital Clock Website

This repository contains the source code for a simple digital clock website that displays the current day, date, and time. The website also features a toggle button to switch between day mode and night mode, each with its respective background image. Additionally, users can toggle fullscreen mode for a more immersive experience.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Day/Night Mode Toggle:** Switch between day and night modes with a button click. Each mode has a unique background image and color scheme.
- **Fullscreen Mode:** Toggle fullscreen mode to view the clock without any distractions.
- **Current Day, Date, and Time:** The clock updates in real-time to show the current day of the week, date, and time.
- **Responsive Design:** The website is designed to be responsive and works well on both desktop and mobile devices.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

You will need a web browser to view the website. There are no other specific prerequisites as this is a simple HTML, CSS, and JavaScript project.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/dhiraj7kr/DigitalClock.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd DigitalClock
   ```

3. **Open the `index.html` file in your preferred web browser:**

   ```bash
   open index.html
   ```

   Or, you can open the file manually by navigating to the project directory and double-clicking `index.html`.

## Usage

Once you have the project running, you can use the following features:

- **Toggle Day/Night Mode:** Click the button labeled "Day Mode" or "Night Mode" at the top right to switch between modes.
- **Toggle Fullscreen Mode:** Click the "Full Screen" button to enter fullscreen mode. Click "Exit Full Screen" to exit fullscreen mode.
- **View Date and Time:** The current day, date, and time are displayed and updated every second.

## Customization

You can customize various aspects of the website by modifying the source code:

- **Background Images:** Replace the background images for day and night modes by updating the image paths in `styles.css`.
- **Styles:** Modify `styles.css` to change the appearance of the website, including colors, fonts, and layout.
- **Scripts:** Update `script.js` to change the functionality, such as the format of the date and time.

### Background Image Paths

In `styles.css`, update these lines with the paths to your preferred background images:

```css
body.dark-mode {
  background-image: url('./Assets/night-background.jpg');
}

body.light-mode {
  background-image: url('./Assets/day-background.jpg');
}
```

## Contributing

Contributions are welcome! If you have suggestions for improvements, feel free to fork the repository and create a pull request. You can also open issues for any bugs or feature requests.

### Steps to Contribute

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your forked repository.
5. Create a pull request to the main repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This project was inspired by the need for a simple and elegant digital clock website.
- Special thanks to all contributors and users who have provided feedback and suggestions.

---

Replace the placeholders (e.g., `dhiraj7kr`) with your actual GitHub username or relevant details. This README provides a comprehensive guide for users and contributors, covering all essential aspects of the project.
