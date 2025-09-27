
# Leul Dev Portfolio

This is a modern developer portfolio built with React, TypeScript, Vite, and Tailwind CSS. It features a clean UI, modular components, and integrations with Supabase for backend functionality.

## Features

- **React + TypeScript**: Strongly typed, component-based architecture
- **Vite**: Fast development and build tooling
- **Tailwind CSS**: Utility-first CSS for rapid UI development
- **Supabase Integration**: Backend services for authentication and data
- **Modular Components**: Reusable UI components in `src/components`
- **Context Providers**: Theme and Auth context for global state management
- **Pages**: About, Admin, Auth, Blog, BlogPost, Contact, Home, Projects, Skills, NotFound
- **Responsive Design**: Mobile-friendly layouts

## Project Structure

```
├── public/                # Static assets
├── src/
│   ├── components/        # UI and layout components
│   ├── contexts/          # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── integrations/      # Supabase integration
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── tailwind.config.ts     # Tailwind CSS config
├── vite.config.ts         # Vite config
├── package.json           # Project metadata and scripts
└── README.md              # Project documentation
```

## Getting Started

1. **Install dependencies**
	```bash
	npm install
	```
2. **Run the development server**
	```bash
	npm run dev
	```
3. **Build for production**
	```bash
	npm run build
	```
4. **Preview production build**
	```bash
	npm run preview
	```

## Deployment

This project is ready for deployment on platforms like Vercel. See `vercel.json` for configuration.

## Customization

- Update content in `src/pages` for your own information.
- Add or modify components in `src/components` as needed.
- Configure Supabase in `src/integrations/supabase`.

## License

MIT

