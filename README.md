# Figma to TSX AI Builder

> **Educational Project**: Learn how to integrate web applications with HuggingFace APIs

## 📌 Project Status

**🚧 This repository is currently under active development.**

This is an **educational project** designed to help developers learn how to integrate web applications with HuggingFace APIs. The project demonstrates real-world patterns for working with external APIs and AI services.

**We welcome contributions!** If you'd like to contribute, please check out the [Future Improvements](#-future-improvements) section below to see what I'm working on. Whether you're fixing bugs, adding features from the roadmap, improving documentation, or sharing educational examples, your contributions are valuable.

---

A Next.js application that converts Figma designs into React TypeScript components using AI. This project demonstrates real-world integration patterns with external APIs (Figma API) and AI services (HuggingFace Router API).

## 🎯 Project Goals

This project is designed for **educational purposes** to learn:

- **API Integration**: How to integrate with third-party APIs (Figma REST API)
- **AI Integration**: How to use HuggingFace Router API to leverage multiple AI models
- **Modern Web Development**: Next.js App Router, React hooks, TypeScript
- **State Management**: Custom hooks for complex application state
- **Component Architecture**: Modular, reusable React components

## ✨ Features

- 🔗 **Figma URL Parser**: Automatically extracts file keys and node IDs from Figma URLs
- 🖼️ **Component Gallery**: Visual selection of Figma frames/components with thumbnails
- 🤖 **Multi-Model AI**: Select from various AI models via HuggingFace Router API
- 📦 **Batch Generation**: Generate multiple components at once
- 💾 **Export Options**: Download individual files or ZIP archive
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS

## 🏗️ Architecture Overview

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks (Custom `useFigmaBuilder` hook)
- **File Handling**: `file-saver`, `jszip`
- **Linting**: Biome

### Key Integrations

1. **Figma API** (`/api/figma`, `/api/figma-images`)
   - Fetches design file data
   - Retrieves component thumbnails
   - Extracts node information

2. **HuggingFace Router API** (`/api/generate-code`)
   - Unified interface to multiple AI providers
   - Supports OpenAI, Anthropic, Google, Meta, Mistral, and more
   - Model selection via `/api/models`

## 📚 How It Works

### 1. Figma Integration

```typescript
// Parse Figma URL to extract file key
const parsed = parseFigmaUrl(url); // { fileKey: "...", nodeId: "..." }

// Fetch Figma file data
const data = await fetch("/api/figma", {
  method: "POST",
  body: JSON.stringify({ fileKey: parsed.fileKey }),
});

// Extract components from Figma document tree
collectComponents(page, components);
```

**Learning Point**: Understanding REST API integration, URL parsing, and tree traversal.

### 2. HuggingFace Router API Integration

```typescript
// Select AI model
const selectedModel = "openai/gpt-4o";

// Generate code using AI
const response = await fetch("/api/generate-code", {
  method: "POST",
  body: JSON.stringify({
    figmaJson: nodeData,
    componentName: "MyComponent",
    model: selectedModel,
  }),
});
```

**Learning Point**: Understanding AI API integration, prompt engineering, and model selection.

### 3. HuggingFace Router API

The Router API (`https://router.huggingface.co/v1/chat/completions`) provides:

- **Unified Interface**: Single endpoint for multiple AI providers
- **Model Selection**: Choose from OpenAI, Anthropic, Google, Meta, etc.
- **Automatic Routing**: Router selects the best provider for each model

**Key Concepts**:
- Provider/Model format: `provider/model-name` (e.g., `openai/gpt-4o`)
- Chat completions API compatible with OpenAI format
- Bearer token authentication

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Figma Personal Access Token
- HuggingFace API Token

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/m0bar3z/figma-to-tsx-ai.git
cd figma-to-tsx-ai
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:

```env
# Figma API Token
# Get from: https://www.figma.com/developers/api#access-tokens
FIGMA_TOKEN=your_figma_token_here

# HuggingFace API Token
# Get from: https://huggingface.co/settings/tokens
HF_TOKEN=your_huggingface_token_here
```

4. **Run the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:3010`

## 📖 API Endpoints

### `/api/figma` (POST)

Fetches Figma file data or specific nodes.

**Request**:
```json
{
  "fileKey": "abc123...",
  "nodeIds": ["node-id-1", "node-id-2"] // optional
}
```

**Response**: Figma API response with document structure

### `/api/figma-images` (POST)

Fetches thumbnail images for Figma components.

**Request**:
```json
{
  "fileKey": "abc123...",
  "nodeIds": ["node-id-1", "node-id-2"]
}
```

**Response**: Object mapping node IDs to image URLs

### `/api/generate-code` (POST)

Generates React TypeScript code from Figma JSON using AI.

**Request**:
```json
{
  "figmaJson": { /* Figma node data */ },
  "componentName": "MyComponent",
  "model": "openai/gpt-4o" // optional, defaults to gpt-4o
}
```

**Response**:
```json
{
  "code": "export function MyComponent() { ... }"
}
```

### `/api/models` (GET)

Fetches available AI models from HuggingFace Hub API.

**Response**:
```json
{
  "models": [
    {
      "id": "openai/gpt-4o",
      "name": "GPT-4o",
      "providers": ["OpenAI"]
    }
  ]
}
```

## 🧩 Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── figma/        # Figma API integration
│   │   ├── figma-images/ # Figma image fetching
│   │   ├── generate-code/# HuggingFace AI integration
│   │   └── models/       # Model listing
│   ├── page.tsx          # Main application page
│   └── layout.tsx        # App layout
├── components/
│   ├── ComponentGallery.tsx  # Component selection UI
│   ├── GeneratedOutput.tsx   # Code display and download
│   └── ModelSelector.tsx     # AI model selector
└── hooks/
    └── useFigmaBuilder.ts    # Main application logic hook
```

## 🎓 Key Learning Points

### 1. API Integration Patterns

- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Loading States**: Proper loading indicators during async operations
- **Caching**: Using Next.js `revalidate` for API response caching

### 2. State Management with Custom Hooks

The `useFigmaBuilder` hook demonstrates:

- Complex state management (multiple related state variables)
- Derived state (parsed URL from raw input)
- Side effects (resetting state on URL change)
- Memoized callbacks for performance

### 3. Component Architecture

- **Separation of Concerns**: UI components vs. logic hooks
- **Reusability**: Gallery and Output components are reusable
- **Props Interface**: Clear TypeScript interfaces for component contracts

### 4. HuggingFace Router API

- **Model Selection**: Understanding provider/model naming convention
- **API Compatibility**: OpenAI-compatible chat completions format
- **Error Handling**: Handling rate limits and API failures

### 5. Figma API Integration

- **REST API Usage**: Making authenticated requests
- **Tree Traversal**: Recursive component collection
- **Image Fetching**: Generating and caching thumbnails

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. Configuration is in `biome.json`.

## 🚧 Future Improvements

- [ ] Support for Figma component variants
- [ ] Real-time preview of generated components
- [ ] Custom prompt templates
- [ ] Model performance comparison
- [ ] Batch processing with progress tracking
- [ ] Export to different frameworks (Vue, Svelte)
- [ ] Generate Storybook file for each component
- [ ] Generate unit testing for each component

## 📝 License

This project is for educational purposes. Feel free to use it as a learning resource.

## 🤝 Contributing

Contributions are welcome! This is an educational project, and we appreciate any help you can provide.

### Getting Started

1. **Fork the repository** and clone it to your local machine
2. **Install dependencies**: `npm install`
3. **Set up environment variables**: Create a `.env.local` file with your API tokens (see [Getting Started](#-getting-started))
4. **Create a branch**: `git checkout -b feature/your-feature-name` or `git checkout -b fix/your-bug-fix`

### Development Workflow

1. **Make your changes** following the code style guidelines below
2. **Test your changes**: Run `npm run dev` and test locally
3. **Lint your code**: Run `npm run lint` to check for issues
4. **Format your code**: Run `npm run format` to auto-format
5. **Commit your changes**: Write clear, descriptive commit messages
6. **Push to your fork**: `git push origin your-branch-name`
7. **Open a Pull Request**: Provide a clear description of your changes

### Code Standards

- **TypeScript**: Use TypeScript for all new code
- **Linting**: Code must pass Biome linting (`npm run lint`)
- **Formatting**: Code must be formatted with Biome (`npm run format`)
- **Naming**: Use descriptive names for variables, functions, and components
- **Comments**: Add comments for complex logic, especially educational examples
- **Components**: Keep components modular and reusable
- **Hooks**: Extract complex logic into custom hooks

### What to Contribute

We welcome contributions in these areas:

- **🐛 Bug Fixes**: Fix issues you encounter or find
- **✨ Features**: Implement items from the [Future Improvements](#-future-improvements) list
- **📚 Documentation**: Improve README, add code comments, write tutorials
- **🎨 UI/UX**: Enhance the user interface and user experience
- **🧪 Testing**: Add unit tests or improve test coverage
- **🔧 Refactoring**: Improve code structure and organization
- **🌐 Internationalization**: Add support for multiple languages
- **📖 Examples**: Add educational examples or use cases

### Pull Request Guidelines

When submitting a PR, please:

- **Describe your changes**: What did you change and why?
- **Reference issues**: Link to any related issues
- **Test locally**: Ensure your changes work as expected
- **Keep it focused**: One feature or fix per PR when possible
- **Update documentation**: If you add features, update the README

### Areas That Need Help

Check the [Future Improvements](#-future-improvements) section for specific features we're looking to implement. Some areas that could use help:

- Adding support for more AI models
- Improving error handling and user feedback
- Enhancing the component generation quality
- Adding tests for components and hooks
- Creating Storybook stories
- Improving accessibility

### Questions?

If you have questions or need help getting started, feel free to:
- Open an issue for discussion
- Check existing issues for similar questions
- Review the codebase to understand the patterns used

Thank you for contributing! 🎉


## 📚 Resources

### APIs Used

- [Figma REST API](https://www.figma.com/developers/api)
- [HuggingFace Router API](https://huggingface.co/docs/api-inference/router)
- [HuggingFace Hub API](https://huggingface.co/docs/hub/api)

### Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🙏 Acknowledgments

Built as an educational project to demonstrate modern web development practices and AI integration patterns.

