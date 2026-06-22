# Formaker

**Formaker** is an intuitive, premium, drag-and-drop form builder built with Next.js, React, Tailwind CSS, and Lucide React icons. It is designed to allow developers and designers to visually compose forms and instantly generate production-ready React component code backed by **React Hook Form** and **Zod** schema validations, tailored specifically for **Shadcn UI** components.

---

## Features

- **Drag-and-Drop Canvas**: Effortlessly position, duplicate, reorder, or delete form fields inside a flexible canvas.
- **Responsive Grid Controls**: Configure field widths with precise layout choices (`Full`, `1/2`, `1/3`, or `1/4` width options).
- **Typography Support**: Embed stylized text blocks (H1-H4 headings and body paragraph blocks) directly in your form.
- **Rich Fields Library**: Choose from a comprehensive suite of inputs:
  - Input, Textarea, Select Dropdown
  - Switch Toggle, Checkbox, Radio Options
  - Interactive Date Picker (Calendar)
  - One-Time Password (OTP) Input (4 or 6 digits)
  - File Upload Zone (with size and type validation constraints)
  - Customizable Buttons
- **Advanced Validation Setup**: Configure field requirements, custom placeholder text, database field key naming, format validations (Email, Phone, URL, Numeric), or custom regex validation.
- **Live Interactive Preview**: Test form functionality, interactivity, and validation rules in real-time inside the preview modal.
- **Image Exports**: Download a PNG image of your designed form or copy it to your clipboard to share with team members.
- **JSON Schema Backup**: Import/Export the JSON schema of your form structure to restore states instantly.
- **Production-Ready Code Generation**: Instant React component source code generation copy-pasteable directly into your Shadcn UI project.
- **Sleek Glassmorphic Dark Design**: Highly polished visual theme with smooth transitions, animated glowing backdrops, and a handy shortcut toggle (press `d` on your keyboard to switch themes).

---

## Technical Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Styling**: Tailwind CSS & Framer Motion
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Package Manager**: [Bun](https://bun.sh) (sole package manager)

---

## Getting Started

### Prerequisites

You must have [Bun](https://bun.sh/) installed locally. If you do not have it, install it using:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

Clone the repository and install dependencies using Bun:

```bash
bun install
```

### Run Development Server

Start the fast Next.js development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

### Production Build

To compile a production build of the project:

```bash
bun run build
```

To run the production-optimized build locally:

```bash
bun start
```

---

## File Structure

```text
src/
├── app/                      # Next.js page routing and layout
├── components/
│   └── ui/                   # Shared UI primitives (Shadcn customized)
├── context/
│   └── form-builder-context  # Global state manager for form elements
└── features/
    └── shadcn-formbuilder/   # Formaker builder workspace components
        ├── components/       # Canvas, Sidebar Library, Inspector, Code Generator
        └── context/          # Context API hooks for the builder
```

---

## License

This project is open-source and available under the [MIT License](LICENSE).
# FormakerWeb
