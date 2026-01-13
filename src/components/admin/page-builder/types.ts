// Page Builder Types

export type ComponentType = 
  | 'text'
  | 'heading'
  | 'image'
  | 'gallery'
  | 'button'
  | 'video'
  | 'form'
  | 'slider'
  | 'accordion'
  | 'html'
  | 'divider'
  | 'spacer'
  | 'icon'
  | 'columns'
  | 'container';

export interface ComponentStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  padding?: string;
  margin?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: string;
  boxShadow?: string;
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  opacity?: number;
  transform?: string;
  transition?: string;
}

export interface ResponsiveStyles {
  desktop?: ComponentStyle;
  tablet?: ComponentStyle;
  mobile?: ComponentStyle;
}

export interface PageComponent {
  id: string;
  type: ComponentType;
  content: any;
  styles: ComponentStyle;
  responsiveStyles?: ResponsiveStyles;
  children?: PageComponent[];
  locked?: boolean;
}

export interface PageSection {
  id: string;
  type: 'section';
  name: string;
  components: PageComponent[];
  styles: ComponentStyle;
  responsiveStyles?: ResponsiveStyles;
  collapsed?: boolean;
}

export interface PageRow {
  id: string;
  type: 'row';
  columns: PageColumn[];
  styles: ComponentStyle;
  responsiveStyles?: ResponsiveStyles;
}

export interface PageColumn {
  id: string;
  type: 'column';
  width: number; // percentage
  components: PageComponent[];
  styles: ComponentStyle;
}

export interface PageBuilderState {
  sections: PageSection[];
  selectedId: string | null;
  selectedType: 'section' | 'component' | null;
  history: PageSection[][];
  historyIndex: number;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  showGrid: boolean;
  zoom: number;
}

export interface PageTemplate {
  id: string;
  name: string;
  description?: string;
  content: PageSection[];
  thumbnail_url?: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PageVersion {
  id: string;
  page_id: string;
  content: PageSection[];
  version_number: number;
  created_by: string;
  created_at: string;
  description?: string;
}

export interface DragItem {
  id: string;
  type: string;
  componentType?: ComponentType;
  sectionIndex?: number;
  componentIndex?: number;
}

export const DEFAULT_STYLES: ComponentStyle = {
  padding: '16px',
  margin: '0',
  backgroundColor: 'transparent',
  textColor: 'inherit',
};

// Theme-aware color tokens (use CSS variables for dark/light mode compatibility)
export const THEME_COLORS = {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: 'hsl(var(--primary))',
  primaryForeground: 'hsl(var(--primary-foreground))',
  secondary: 'hsl(var(--secondary))',
  secondaryForeground: 'hsl(var(--secondary-foreground))',
  muted: 'hsl(var(--muted))',
  mutedForeground: 'hsl(var(--muted-foreground))',
  accent: 'hsl(var(--accent))',
  accentForeground: 'hsl(var(--accent-foreground))',
  destructive: 'hsl(var(--destructive))',
  border: 'hsl(var(--border))',
  card: 'hsl(var(--card))',
  cardForeground: 'hsl(var(--card-foreground))',
};

export const COMPONENT_DEFAULTS: Record<ComponentType, Partial<PageComponent>> = {
  text: {
    content: { text: 'Enter your text here...' },
    styles: { ...DEFAULT_STYLES, fontSize: '16px', textColor: 'inherit' },
  },
  heading: {
    content: { text: 'Heading', level: 'h2' },
    styles: { ...DEFAULT_STYLES, fontSize: '32px', fontWeight: '700', textColor: 'inherit' },
  },
  image: {
    content: { src: '', alt: '', link: '' },
    styles: { ...DEFAULT_STYLES, width: '100%', borderRadius: '8px' },
  },
  gallery: {
    content: { images: [], columns: 3, gap: '16px' },
    styles: { ...DEFAULT_STYLES },
  },
  button: {
    content: { text: 'Click Me', link: '#', variant: 'primary' },
    styles: { 
      ...DEFAULT_STYLES, 
      backgroundColor: 'hsl(var(--primary))', 
      textColor: 'hsl(var(--primary-foreground))',
      padding: '12px 24px',
      borderRadius: '8px',
      textAlign: 'center',
    },
  },
  video: {
    content: { url: '', type: 'youtube', autoplay: false },
    styles: { ...DEFAULT_STYLES, width: '100%' },
  },
  form: {
    content: { 
      fields: [
        { id: '1', type: 'text', label: 'Name', required: true },
        { id: '2', type: 'email', label: 'Email', required: true },
        { id: '3', type: 'textarea', label: 'Message', required: false },
      ],
      submitText: 'Submit',
      submitAction: 'supabase',
      formId: '',
      formName: 'Contact Form',
    },
    styles: { ...DEFAULT_STYLES },
  },
  slider: {
    content: { slides: [], autoplay: true, interval: 5000 },
    styles: { ...DEFAULT_STYLES, width: '100%' },
  },
  accordion: {
    content: { 
      items: [
        { id: '1', title: 'Accordion Item 1', content: 'Content goes here...' },
      ],
      allowMultiple: false,
    },
    styles: { ...DEFAULT_STYLES },
  },
  html: {
    content: { code: '<div>Custom HTML</div>' },
    styles: { ...DEFAULT_STYLES },
  },
  divider: {
    content: { style: 'solid', color: 'hsl(var(--border))' },
    styles: { ...DEFAULT_STYLES, margin: '24px 0' },
  },
  spacer: {
    content: { height: '48px' },
    styles: { ...DEFAULT_STYLES },
  },
  icon: {
    content: { name: 'star', size: 24, color: 'currentColor' },
    styles: { ...DEFAULT_STYLES },
  },
  columns: {
    content: { columns: 2, gap: '24px' },
    styles: { ...DEFAULT_STYLES },
    children: [],
  },
  container: {
    content: { maxWidth: '1200px' },
    styles: { ...DEFAULT_STYLES, maxWidth: '1200px', margin: '0 auto' },
    children: [],
  },
};
