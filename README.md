# Frontend - Next.js Application

A modern Next.js application, featuring Firebase authentication, real-time chat capabilities, and a beautiful UI with Tailwind CSS and Radix UI components.

## 🚀 Features

- **Modern UI/UX**: Built with Tailwind CSS and Radix UI components
- **Authentication**: Firebase Authentication integration
- **Real-time Features**: Firebase Firestore for real-time data
- **AI Integration**: Chat interface with AI capabilities
- **Responsive Design**: Mobile-first responsive design
- **Type Safety**: TypeScript support
- **Performance**: Optimized with Next.js 14
- **Styling**: Tailwind CSS with custom animations

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: JavaScript/TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Icons**: [Lucide React](https://lucide.dev/), [Heroicons](https://heroicons.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Markdown**: [React Markdown](https://github.com/remarkjs/react-markdown)
- **Syntax Highlighting**: [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)

## 📋 Prerequisites

- Node.js 18.0 or later
- npm, yarn, or pnpm
- Firebase project with Firestore and Authentication enabled

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication pages
│   ├── chat/             # Chat interface
│   ├── dashboard/        # User dashboard
│   └── globals.css       # Global styles
├── components/           # Reusable UI components
│   ├── ui/               # Base UI components (Radix UI)
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat-related components
│   └── dashboard/        # Dashboard components
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── providers/            # App providers
├── services/             # API services
├── styles/               # Additional styles
├── firebase/             # Firebase configuration
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Optional: Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 🔗 Backend Integration

This frontend application communicates with a Go backend API. Make sure to:

1. Start the backend server (see backend README)
2. Configure the correct API URL in your environment variables
3. Ensure CORS is properly configured on the backend

## 🎨 Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theming
- **Radix UI** for accessible components
- **Framer Motion** for animations

### Custom Theme
The app supports light/dark mode switching. Theme configuration is in:
- `tailwind.config.js` - Tailwind configuration
- `app/globals.css` - CSS variables and global styles

## 🔒 Authentication

Firebase Authentication is used for user management:
- Email/password authentication
- Protected routes with middleware
- User context management
- Automatic token refresh

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
1. Build the application: `npm run build`
2. Deploy the `out` folder to your hosting provider
3. Configure environment variables on your platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Provide steps to reproduce the problem

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Firebase](https://firebase.google.com/) for backend services
