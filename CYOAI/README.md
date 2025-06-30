# Voice AI Platform - CYOAI

A modern, production-ready voice AI interface built with React, TypeScript, and Vite, designed to integrate seamlessly with the Frappe framework.

## 🚀 Features

- **Modern React 19** with TypeScript for type safety
- **Voice AI Interface** with real-time voice input capabilities
- **Frappe Integration** using frappe-react-sdk
- **Responsive Design** optimized for all devices
- **Production Optimized** with code splitting and minification
- **Comprehensive Testing** setup with Vitest
- **Code Quality** with ESLint and strict TypeScript rules

## 📋 Prerequisites

- Node.js 18+
- Yarn or npm
- Frappe Framework (for backend integration)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CYOAI
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn build:analyze` | Build with bundle analysis |
| `yarn preview` | Preview production build |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix ESLint issues |
| `yarn type-check` | Run TypeScript type checking |
| `yarn test` | Run tests |
| `yarn test:ui` | Run tests with UI |
| `yarn test:coverage` | Run tests with coverage |

## 🏗️ Project Structure

```
src/
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
├── App.css              # Application styles
├── index.css            # Global styles
├── vite-env.d.ts        # Vite type definitions
├── assets/              # Static assets
└── test/
    └── setup.ts         # Test configuration
```

## 🔧 Configuration

### Vite Configuration
- **Development**: Hot module replacement, proxy to Frappe backend
- **Production**: Code splitting, minification, source maps
- **Build Output**: Optimized for Frappe integration

### ESLint Configuration
- **TypeScript**: Strict type checking and linting
- **React**: Best practices and hooks rules
- **Code Quality**: Unused variables, prefer const, etc.

## 🧪 Testing

The project includes a comprehensive testing setup:

```bash
# Run all tests
yarn test

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage
```

## 🚀 Deployment

### Development
```bash
yarn dev
```
Access at: `http://localhost:8080`

### Production Build
```bash
yarn build
```
The build output is automatically copied to the Frappe public directory.

## 🔌 Frappe Integration

This application is designed to work within the Frappe ecosystem:

- **FrappeProvider**: Wraps the entire application
- **CSRF Token**: Automatically injected from Frappe session
- **API Proxy**: Configured to proxy requests to Frappe backend
- **Build Integration**: Outputs to Frappe's asset directory

## 📱 Voice AI Features

### Current Implementation
- Voice input detection
- Message history
- Real-time UI feedback
- Error handling

### Planned Features
- [ ] Speech-to-text integration
- [ ] Text-to-speech output
- [ ] AI response processing
- [ ] Voice command recognition
- [ ] Multi-language support

## 🛡️ Security

- **CSRF Protection**: Integrated with Frappe's CSRF system
- **Input Validation**: TypeScript ensures type safety
- **Secure Headers**: Configured for production deployment

## 📊 Performance

- **Code Splitting**: Vendor and Frappe SDK separated
- **Tree Shaking**: Unused code eliminated
- **Minification**: Production builds are optimized
- **Source Maps**: Available for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the Frappe documentation
- Review the code comments and types

## 🔄 Version History

- **v1.0.0**: Initial production release
  - Modern React + TypeScript setup
  - Voice AI interface foundation
  - Frappe integration
  - Production optimizations
